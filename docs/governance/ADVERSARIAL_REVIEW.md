# Phản biện hệ thống và hướng xử lý

> Evidence update 07/10/2026 — FLOW-CATALOG-001: PR16/migration005 và browser live mới hơn baseline review. Product Boxy đã được thu hồi APPROVED v22 → DRAFT v23; buyer detail 404, catalog rỗng. Đọc [evidence hiện hành](CATALOG_FLOW_EVIDENCE.md) trước áp dụng các nhận định baseline bên dưới. Receipt≤60s không còn là blocker của publication source mới. Các gate khác chưa tự động PASS.

`RVW-SYSTEM-001` · 2026-10-07 · Status: PROPOSED remediation; kiến trúc/decisions ACCEPTED không đổi.

Kết luận: modular monolith + PostgreSQL + website-first phù hợp với scope hiện tại. Rủi ro lớn nhất là availability/recovery và khoảng cách giữa contracts với executable behavior; thêm Kafka/microservices không giải quyết các điểm đó. Review dựa tài liệu và targeted source inspection ở checkout503ae0, không phải production audit. Không có lỗi runtime production nào được xác nhận trong task.

P0: cần xử lý trước feature/release liên quan vì có thể mất dữ liệu/quyền/tiền. P1: cần xử lý trước vận hành ổn định vì có thể gây outage hoặc quá tải. P2: giảm complexity/drift. Đây là review priorities, khác incident severity D10.

## RISK-001 — Catalog phụ thuộc renewal ≤60 giây (P1, blocker publication)

Evidence: ADR0003 ghi receipt expiry≤60seconds; apps/api/migrations/001_catalog_read.sql đặt CHECK valid_until≤verified_at+60s và visible_product chỉ trả valid_until>clock_timestamp(). Publisher/renewal chưa có trong baseline. Đây là source-confirmed mechanism, không phải observed production outage.

Scenario: sản phẩm đã publish, worker crash/backlog/network outage vượt valid_until → tất cả affected rows biến mất khỏi public reads. Một vòng renewal thường xuyên cũng tạo write/load và có thể giữ database thức; per-minute freshness không miễn phí. Site có thể nhìn giống catalog rỗng, dù nguồn hợp lệ còn tồn tại.

Hướng xử lý PROPOSED: review lại publication LLD trước bật thật. Ưu tiên approved publication revision + public visibility/withdrawal state cập nhật trong cùng canonical transaction, qua safe reader view; checkout vẫn revalidate current state. Nếu giữ receipt model, phải có renewable bounded batches, capacity/backlog/expiry alerts, worker-failure scenario và distinct stale/unavailable vs truly empty outcome. Không silently kéo TTL dài hoặc phục vụ hàng đã bị rút để cải thiện uptime. Thay schema/60s rule cần ADR+reviewed migration, không execution từ report.

Done evidence: publish→read, source edit/revoke→withdraw, worker outage→declared bounded outcome, restart→no obsolete resurrection, representative catalog capacity/cost. Gates PUBLISH/DATA/PERF/OPS.

## RISK-002 — Payment UNKNOWN làm khóa hàng kéo dài (P0 trước payment)

Evidence: D03/D04 giữ stock/financial holds trong PAYMENT_REVIEW cho tới final evidence; tài liệu đã yêu cầu bounded reconciliation nhưng actual provider/escalation policy chưa đủ. Safety đúng, operational liveness chưa chứng minh.

Scenario: provider không trả kết quả cuối, nhiều checkout uncertain chiếm stock; customers khác không mua được. Giới hạn một active attempt/buyer không chống nhiều accounts hoặc provider-wide outage. Tự release khi timeout có thể gây paid-without-stock.

Hướng xử lý: trước activate provider phải chốt method-specific query/cancel/expiry/finality, reconciliation cadence, named human escalation và admission thresholds theo unknown count/age/held stock exposure. Khi vượt ngưỡng, ngừng nhận mới cho affected payment method/SKU; vẫn recover attempts đã gửi. Resolution chỉ release với trusted no-effect evidence hoặc đi late-money/refund exception đúng D04, không “timeout=failed”. Không tự đặt thời hạn bank/provider từ app TTL.

Done: lost response/duplicate callback/provider outage và late success có persisted exception owner, không double order/debit hoặc infinite unmonitored hold. PAY/ASYNC/DATA/OPS.

## RISK-003 — RPO/RTO là mục tiêu, chưa có recovery architecture proof (P0 trước dữ liệu/giao dịch thật)

Evidence: D10 catalog RPO≤24h, commerce≤15min là proposed objectives; actual independent backups/keys/media/identity restore chưa có evidence. Paid plan/snapshot khác independent disaster recovery. Không kết luận Neon hiện tại mất dữ liệu; risk là không chứng minh recoverability.

Scenario: account/key/storage loss hoặc bad write propagate; DB dump có nhưng media/identity/idempotency/provider evidence thiếu. Restored app resend payment/refund hoặc revive revoked grants.

Hướng xử lý: tách catalog release và transactional release. Catalog cần approved independent encrypted scope+key recovery và measured restore. Commerce cần actual protection mechanism đáp ứng owner-approved data-loss tolerance, provider evidence catch-up, write fencing và reconciliation trước reopen. Verify measured snapshot boundaries/end-to-end coverage; daily dump không chứng minh15min RPO. Nếu budget/capability thiếu, feature giữ disabled hoặc owner review mục tiêu/budget explicit; không fake PASS.

Done: isolated restore DB+media+identity/config/key scope, logical invariants và post-snapshot replay/unknown effects có evidence. DATA/OPS/PAY/RELEASE.

## RISK-004 — Autoscaling API gây quá tải PostgreSQL (P1 trước public release)

Evidence: accepted pool max5/process; D10 yêu cầu deployment-wide budget nhưng actual max instances/concurrency/DB ceilings chưa verified. Cloud Run hỗ trợ concurrency và instance limits; giới hạn per-process không giới hạn toàn deployment. [Cloud Run concurrency](https://docs.cloud.google.com/run/docs/about-concurrency), [instance limits](https://docs.cloud.google.com/run/docs/configuring/max-instances).

Scenario: burst scale thêm instances, old/new revisions overlap, workers/exports cùng mở pools → connection/CPU/lock queue saturation. Public traffic tranh resources với Admin/webhooks/reconciliation. Frontend SSR origin round-trips và cross-provider region path có thể tăng latency; actual topology chưa đo.

Hướng xử lý: manifest budgets tổng API+workers+deploy surge+operational reserve; explicit max instances/concurrency, bounded acquisition queue/timeouts/cancellation và load shedding. Không coi max instances là hard DB resource guarantee; admission thực tế vẫn cần. Đo warm/cold/burst, representative queries, egress/region path; optional workloads yield trước core recovery. Không mặc định thêm Redis để che DB bottleneck. Neon suspended compute có startup behavior cần đo, không chỉ warm p95. [Neon scale-to-zero driver guidance](https://neon.com/blog/using-neons-auto-suspend-with-long-running-applications).

Done: declared workload không vượt budgets và saturated path controlled429/503, recovery vẫn hoạt động. PERF/OPS/SEC.

## RISK-005 — Webhook chỉ “sẽ durable” chưa đủ (P0 trước payment)

Evidence: contracts yêu cầu durable inbox/verification/dedupe, nhưng chưa actual receiver/provider evidence test. Không claim endpoint đã tồn tại hoặc bug ACK hiện tại.

Scenario: ACK trước persist→event mất khi crash; persist và business commit coupling sai→lost evidence; restore mất dedupe→replay monetary effect; incoming receipts bị rate-limit bởi public overload.

Hướng xử lý: verify bounded raw-body signature/merchant/correlation; persist receipt+dedupe qua scoped inbox transaction trước accepted ACK; separate processing recovery từ reception. DB unavailable thì không ACK successful acceptance nếu không có approved durable fallback, dựa provider retry/query contract. Protected resource budgets cho receipts/reconciliation; no unauthenticated gateway bypass. Recovery kết hợp trusted provider queries, không rely webhook alone. Duplicate/out-of-order delivery phải expected. [Webhook provider example](https://docs.stripe.com/webhooks).

Done: crash sau persist/trước ACK, sau provider send/trước response, DB outage, replay sau restore đều không mất evidence/double money effect. PAY/ASYNC/DATA/OPS.

## RISK-006 — Authorization locks có thể serialize hệ thống quá rộng (P1 trước private commerce)

Evidence: D08 grant/policy guards serialize revoke với mutations; D03/D04 global lock order. Correctness requirement tốt; lock granularity/actual access paths chưa tested.

Scenario: nhiều commands lock chung platform policy/grant row, unrelated customers chờ nhau; transactions còn giữ lock khi slow query/audit lớn; retry storm làm overload. PostgreSQL explicit locks có wait/deadlock behavior, không guarantee throughput. [PostgreSQL locking](https://www.postgresql.org/docs/18/explicit-locking.html).

Hướng xử lý: document lock graph cho từng command, per-principal/resource policy revision guards, immutable snapshots và guarded versions nơi phù hợp. Không lock singleton global row để authorize mọi request. Strong revoke semantics giữ nguyên; không chuyển sang stale auth cache để chữa chậm. Consistent acquisition order, timeout/deadlock retry total budget và no external waits trong closure.

Done: revoke-vs-command, same-key concurrency, unrelated principals và common SKU contention có correctness+latency evidence. SEC/DATA/PERF.

## RISK-007 — Shared Web/codebase không phải trust isolation (P0 trước Admin release)

Evidence: shared Next.js Buyer/Seller/Admin, reported bearer BFF approach; runtime hosts/token audience/origin/grants chưa verified trong review. Shared code tốt nhưng private leakage/cookie/token/SSR cache configuration phải chứng minh.

Scenario: forged host/forwarded header route private handler, cache response Admin vào public key, token/log/redirect leak, grants sau revoke vẫn usable. Một email owner/contact không đủ bootstrap.

Hướng xử lý: một reviewed auth/host manifest, exact origins/trusted proxy chain, route-level backend scopes, private no-store/SSR separation và audience/issuer/revocation policy. No dual-mode cookie/bearer inference. Keep runtime/migration/secret identities scoped; human owner recovery/strong-auth có proof. Tách deployment Admin thành independent service chỉ khi threat/availability evidence cần; không bắt microservices hoặc duplicate business logic.

Done: buyer host không lấy private data, spoofed host/claim/token rejected, current grants/revocation đúng, build/cache/logs không leak. SEC/OPS/RELEASE.

## RISK-008 — Một owner là operational single point of failure (P1 trước payment)

Evidence: D08 sole human owner; D1015min/30min incident acknowledgment objectives chỉ khi staffed. AI không được self-elevate hoặc execute financial recovery.

Scenario: owner mất điện thoại/quyền email hoặc không online, unknown money/critical incident không được xử lý; thuật toán/tool gateway không giải quyết human-only recovery.

Hướng xử lý giữ sole owner: verified account/key recovery, recovery instructions ngoài hệ thống có protected access, duty windows+alert destination, feature pause/containment runbooks và truthful staffed objectives. Không invent second admin hoặc24/7 capability. Human financial release/recovery cần unavailable state/escalation, không AI tự sửa money để giảm backlog.

Done: account/session loss recovery và operator-unavailable containment được kiểm chứng; financial exposure có owner/escalation path. SEC/OPS/PAY.

## RISK-009 — AI ambitions và no-egress chưa có executable inference path (P2, trước AI adoption)

Evidence: AI optional/per-model private databases và no unapproved external inference. Separate model DBs không tự bảo đảm isolation; prompts/tools/retrieval/logs/backups mới có thể trộn dữ liệu.

Scenario: ai CSKH/ops promised nhưng provider không nhận permitted inputs; hoặc prompt injection lấy commerce/private data qua tool rồi external model. n-model/n-database ops/backup/grants làm chi phí tăng khi chưa có use case.

Hướng xử lý: giữ core/human workflows độc lập, defer AI deployment. Chọn một concrete noncritical use case, một approved model identity và typed minimal tool projections; no direct SQL/secrets. Nếu muốn external inference, phải riêng data-flow/field/destination/retention contract và owner exception explicit, không coi tài khoản ChatGPT hoặc trusted cloud là approval. Không đổi n-model isolation rule âm thầm; chỉ provision actual approved model.

Done: AI-off core, cross-model access denial, injection/egress denial và cost/tool budgets. AI/SEC/OPS.

## RISK-010 — Tài liệu nhiều nhưng dễ drift và false assurance (P2, trước code handoff)

Evidence: V001 historical headers, CORE pending cũ, local129–131/main128 gap; previous validation chủ yếu links/hash/keyword coverage. Closed interpretation không là implementation acceptance.

Scenario: coder đọc file cũ trực tiếp; accepted guideline bị hiểu là deployed component; “55 topics checked” bị dùng như correctness proof. Một change chạm nhiều copies nhưng không update state/gates.

Hướng xử lý: CURRENT_STATE là summary view của nguồn, không authority thay owner/contracts. Maintain small structured decision/evidence register, exact source SHA và overrides refs; optional generated index/consistency checks trong scoped docs automation. Handoff mỗi task chỉ contracts liên quan, pass meaningful scenarios, review delta+ADR. Giữ history; tiêu chuẩn “no conflict” chỉ là applicability consistency. Archive/account/source facts không tự reconcile bằng đổi text.

Done: contract change làm stale summary/reference bị phát hiện; Work không reopen resolved values hoặc mark runtime gates từ doc counts. CONTRACT/RELEASE.

## RISK-011 — V1 scope rộng hơn khả năng release hiện tại (P2)

Evidence: long-term marketplace/points/apps/AI nhiều contracts, launch one seller và website-first. Terms thực tế/media/stock/provider/ops còn thiếu. Không đổi accepted long-term scope.

Hướng xử lý: deliver catalog+media entry/review/publication + minimal secure Admin first, with truthful no-commerce UX; sau đủ stock/provider/recovery thì checkout VND một provider. CP/VC/VCS, marketplace, six mobile targets và AI giữ deferred. Không build placeholder wallets/settlement để tick roadmap. Không cho contracts optional làm blocker unrelated safe catalog; không skip required safety gates của feature thực dùng.

Done: một end-to-end real-data journey review/publish/withdraw vận hành được và không hứa purchase chưa enabled. PUBLISH/SEC/OPS/RELEASE.

## Hướng đi đề xuất

1. Trước public catalog: xử lý RISK001 publication liveness, RISK003 scoped catalog restore, RISK004 budgets, RISK007 Admin/private boundaries. Product/media facts phải thật.
2. Trước VND checkout: RISK002/005 uncertainty+durable evidence, transactional DR, RISK006 concurrent grants/stock locks và RISK008 staffed recovery.
3. Sau measured need: AI/Risk009 và advanced services. RISK010/011 giữ scope/traceability gọn trong mọi task.

Mỗi remediation cần assigned implementation scope, gate IDs và evidence; changes tới accepted60s publication/auth/data-loss policy cần proposed ADR được owner/reviewer có thẩm quyền chốt. Report chỉ thêm critique và options, không tự phê duyệt hoặc thực thi.

## SYNC-PR16-001 — explicit historical-status correction

Nhận định main503ae0/no-live-evidence/missing ADR0004/renewal60s ở review hoặc appendices trước đó là historical baseline findings. ADR0004/0005 và V001 PR16 tới141 đã sync; checkpoint04/10 ghi activation, browser07/10 xác nhận withdraw DRAFTv23. FLOW-CATALOG-001/CURRENT_STATE là evidence hiện hành. RISK-001 receipt liveness được source migration005 giải quyết; full production gates và commerce vẫn chưa PASS.