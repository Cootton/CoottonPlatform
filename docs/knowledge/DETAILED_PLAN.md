# Kế hoạch chi tiết theo repository

`KN-PLAN-002` · v0.2.0 · 2026-10-08 · **PROPOSED**, chưa authorization triển khai. Đọc [backlog](EXECUTION_BACKLOG.md), [decisions/evidence](DECISIONS_AND_EVIDENCE.md), [source register](SOURCE_EVIDENCE_REGISTER.md).

## Mục tiêu và nguyên tắc thực hiện

Thống nhất knowledge với authority hiện có; hoàn tất release evidence và catalog journey; chỉ mở commerce/AI khi có scoped assignment và gates. Giữ selective reuse, applied SQL001–006, dữ liệu/scope hiện hữu và V001 in-place. Không xây lại NestJS/Next.js/Neon hoặc mở marketplace chỉ vì bài học có nhắc.

Kế hoạch chia milestone theo đầu ra và dependency. Chưa có capacity/owner assignment nên không tự hứa lịch hay ngày release. Khi assign từng milestone, ghi người chịu trách nhiệm, reviewer, effort estimate, execution scope, candidate SHA/digest và recheck triggers. Các vai trò ở backlog chưa phải grants/accounts thực tế.

## Milestone 0 — hợp nhất authority và review tài liệu

Work đọc MASTER_PLAN → CURRENT_STATE → DECISIONS → TRACEABILITY → GATE_EVIDENCE → scoped contracts/ADR/V001. Review bộ knowledge này, reconcile unmerged PR26 head và các historical notices, map general user approval tới artifacts cụ thể nếu owner muốn adoption. Kết quả là một task scope rõ: source baseline, quyết định giữ, gaps còn mở, ai review và hành động nào được phép.

Exit: nguồn main/overlay/runtime phân biệt; KB aliases không thay D contracts; mọi đề xuất mới PROPOSED; không source conflict chưa xử lý. Bộ tài liệu lần này hoàn thành phần biên soạn, owner/domain review vẫn pending.

## Milestone 1 — đóng gaps của API04 release preparation

Kế thừa [deployment plan](../operations/API04_DEPLOYMENT_PLAN.md) và [PR26](https://github.com/Cootton/CoottonPlatform/pull/26); không viết một rollout runbook cạnh tranh. Các hoạt động runtime dưới đây là **planned**, chỉ thực hiện theo authorization thực tế.

1. Re-read sanitized service/revision/traffic/identity/secret-version references và applied SQL hashes; không đọc secret values. PR26 cloud config đã COMPLETE cho run ghi nhận, cần recheck trước release chứ không làm lại như chưa có evidence.
2. Chốt candidate API/Web immutable digests, base/FFmpeg/ffprobe versions và Web/API status compatibility; source SHA không thay image digest. Chưa candidate artifact thì STOP.
3. Kiểm chứng bounded generation-pinned operations dưới intended runtime identity. Operator ADC/IAM bindings chỉ là config/fixture evidence. Reuse sáu private fixture objects đã được ghi nhận; không tự tạo objects hoặc grant mới.
4. Điều tra actual Storage SDK warning với safe stacks, bounded repeated workload, listeners/handles/RSS. Local100-read/0-warning result không đủ kết luận actual runtime hết vấn đề; không tăng listener limit để che warning.
5. Kiểm tra cross-encoder retry integrity/uncertain COMMIT và identity negative cases trong môi trường isolated. Preserve exact retry key/fingerprint; không xóa media khi uncertain SQL outcome.
6. Xác nhận rollback image retention, traffic mapping, Web latestRevision vs named pin, API02–04 protection regression và containment. Ghi monitoring/stop thresholds, resource budget, backup/restore evidence và reviewers.

Các nhánh artifact/identity/listener/rollback có thể chuẩn bị độc lập sau frozen scope; final manifest chỉ complete khi đủ tất cả applicable checks. Browser recovery được PR26 ghi nhận; cần recurrence observation và sanitized failed-request facts nếu lỗi tái xuất hiện, không tuyên bố root cause từ CORS probe hay “không có CSP”.

Exit: exact candidate/config/rollback manifest, applicable V01–V08/R01–R02 dispositions và reviewers rõ; unresolved integrity/auth/runtime identity/threshold gaps thì vẫn NOT READY TO DEPLOY. API04-RECOVERY-002 có track riêng, không giả closed hoặc bỏ yêu cầu applicable gate. Owner/ops quyết định liệu scoped release được phép với gap còn mở; tài liệu không tự miễn gate.

## Milestone 2 — rollout có điều kiện và API05 catalog acceptance

Chỉ sau milestone1 đủ readiness và **scoped release approval** mới làm no-traffic candidate/approved traffic steps theo deployment plan. Không tự triển khai từ knowledge approval. Record exact source/digests/revisions/traffic/timestamps and check results; không migration/data reset/republish sản phẩm cũ.

API05 ở đây là **proposed task label** cho end-to-end catalog acceptance, chưa contract mới. Inventory current operations trước khi chốt scope. Journey: human Admin login → sourced draft/intake → media → review snapshot → publish khi được giao → authorized public DTO/media → withdraw → subsequent reads deny. Không publish giả data; ưu tiên isolated fixture, production controlled nonpublic/product commands cần authorization riêng.

Acceptance phải bao gồm permission/revocation, duplicate retry, stale version, visibility after withdrawal, cold/multiple-instance cache behavior và UI/Web/API status compatibility. Không chỉ happy path. Browser hồi phục một phiên không substitute toàn bộ matrix.

Exit: evidence từng scenario cùng source/environment/identity, publish/withdraw scope rõ, noindex/commerce/AI flags giữ theo current assigned scope. Không tự nâng all Production Gates PASS. Nếu rollout chưa được giao, deliverable là reviewed execution packet và isolated acceptance matrix, trạng thái runtime vẫn OPEN.

## Milestone 3 — operations và media recovery policy

Song song phần thiết kế với milestone1: xử lý API04-RECOVERY-002 durable intents/retention/orphan cleanup. Cần owner/domain/ops quyết định authoritative lifecycle, references, grace/retention/lease, recovery claims, audit và bounded cleanup strategy. Không tự chọn retention hoặc delete objects. Applied migrations không sửa; nếu thiết kế cần migration mới thì có review/scope riêng.

Hoàn thiện restore rehearsal, alerts/reconciliation, performance measurements/pool/resource limits, budgets và response ownership theo D10. Gate status phải theo evidence đã chạy; backup tồn tại không chứng minh restore được, CI pass không chứng minh production rights.

Exit: accepted scoped policies nếu owner duyệt, testable design và recorded rehearsals khi được giao; deletion/restore/jobs vẫn không tự được cấp phép bởi design approval.

## Milestone 4 — commerce readiness, sau catalog và financial scope

Không tái thiết kế D01–D10. Lập delta checklist từ D02–D06: quote/consent, stock hold/expiry, authoritative tender/provider finality, timeout/UNKNOWN/reconciliation, order/address/shipping, refund/restock. Chọn tender/provider actual activation và external policy unresolved với owner; VNPAY recommendation không là selected provider. CP/VC/VCS/top-up vẫn inactive tại launch.

D03 checkout execution yêu cầu D04/D05 executable contracts, scoped coding/schema assignment và applicable payment/data/security/ops gates. Chỉ sau đó đề xuất vertical slice nhỏ theo approved single-seller launch. D06 finance/refund/restock không phải UI state flip, D07 reports không bịa COGS/profit. No paid/order/hold/provider actions trong task hiện tại.

Exit: explicit release scope, financial decisions/evidence và authorization riêng. Website/catalog readiness không tự enable purchasing hoặc indexing.

## Milestone 5 — AI và scaling theo nhu cầu

Chỉ đề xuất AI feature khi có benefit, approved processing/egress, tool allowlist, per-model isolation, eval/negative cases và bounded cost. Core path hoạt động không AI. Scaling theo measured workload; Redis/gateway/realtime/circuit breakers review theo use case, Kafka/microservices/sharding vẫn LATER. Không gộp AI/scaling vào critical release path khi không cần.

## Dependency và stop rule

M0 → M1 → scoped approval → M2. M3 design song song M1, nhưng applicable unresolved recovery/ops gates có thể chặn M2. M4 cần catalog/data/security/operations readiness cùng explicit commerce assignment; M5 là track optional riêng. Không tự chạy milestone tiếp theo chỉ vì milestone trước đã viết xong tài liệu.

STOP khi thiếu exact baseline/candidate, identity/visibility violation, duplicate financial/data effect, media mismatch/overwrite, leaked transaction, unexplained resource growth, incompatible proxy semantics, thiếu rollback/threshold/signoff hoặc execution scope. Ghi incident/evidence và giữ state; timeout không tạo key mới hoặc tự clean up state.
