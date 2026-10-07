# Trạng thái và quyết định hiện hành — cửa vào bắt buộc

> **MERGE-PR16-001 · 2026-10-07:** PR #16 đã merge vào `main` tại `6205aa2ff1eee6c750fa277bb1faf5ae397c6ff6`; source fixes56f8058 được giữ nguyên. PR #17 đã chuyển base sang `main` và đang kiểm tra trước merge. Các ghi chú PR16 open/unmerged/stacked bên dưới là lịch sử. Migration006 vẫn chưa áp dụng production; merge không chứng minh runtime/deployment hoặc đóng Production Gates.


> **SYNC-PR16-006 · 2026-10-07:** Source hiện hành là PR #16 `56f80580e50b43c94df65d3ae79ef025ea957123`; [bản đồng bộ migration006](MIGRATION006_SOURCE_SYNC.md) phân biệt source/CI đã kiểm chứng với deployment checkpoint lịch sử. Migration006 đã chuẩn bị, **chưa áp dụng production**. Các source18768a1/pending notices dưới đây là lịch sử; không chứng minh runtime đang chạy bản sửa.


> Evidence update 07/10/2026 — FLOW-CATALOG-001: PR16/migration005 và browser live mới hơn baseline review. Product Boxy đã được thu hồi APPROVED v22 → DRAFT v23; buyer detail 404, catalog rỗng. Đọc [evidence hiện hành](CATALOG_FLOW_EVIDENCE.md) trước áp dụng các nhận định baseline bên dưới. Receipt≤60s không còn là blocker của publication source mới. Các gate khác chưa tự động PASS.

`GOV-STATE-001` · V001 revision `engineering_review_2026_10_07` · Asia/Saigon.

Tài liệu này là bản diễn giải thống nhất của owner decisions và contracts đang có. Nó giải quyết cách áp dụng các đoạn lịch sử; không thay source facts, tự chọn vendor, cấp quyền mới hoặc chứng minh production readiness. Khi có owner override mới hơn, cập nhật bảng này cùng ADR/changelog/V001 và nguồn.

## Decision status / applicability / evidence / authorization

Một policy có thể ACCEPTED nhưng chưa implemented hoặc chưa enabled. Một implementation có thể được reported nhưng chưa verified tại runtime. Catalog flow có evidence giới hạn tại FLOW-CATALOG-001. Một action có thể đã authorized có điều kiện nhưng gates chưa đủ để chạy. Đừng gom các chiều này vào một nhãn “ready”.

| ID | Quy tắc áp dụng duy nhất | Scope / nguồn |
|---|---|---|
| DEC-ARCH-001 | TypeScript/NestJS modular monolith, shared Next.js, backend giữ invariants | ADR0001, V00149/107; Spring là reference |
| DEC-DATA-001 | Một canonical PostgreSQL commerce database trên Neon current; Cloud SQL là migration direction LATER | ADR0002, V001127, D10; không parallel financial truths |
| DEC-LAUNCH-001 | Launch trực tiếp một seller Cootton, website trước payment; points/marketplace inactive | V001117, D05; long-term marketplace/mobile scope vẫn giữ |
| DEC-CACHE-001 | Cache/projections derived; không authority stock/ledger/grants; Redis PROPOSED nếu có nhu cầu | V00149/107, D03/D04/D09; ARCH-CACHE-002 không mandate Redis |
| DEC-ASYNC-001 | Durable outbox/approved dispatch chỉ khi side effect cần recover; bounded processing | V00193/107, CORE; không dựng queue cho operation chưa có |
| DEC-VERIFY-001 | Meaningful targeted verification theo assigned scope; restore/load checks trong release task tương ứng | V001106, D10; absolute no-tests là historical superseded |
| DEC-LEGACY-001 | Selective reuse compatible infra/data; replacement theo explicit resources | V001127; blanket purge/rebuild-all không áp dụng |
| DEC-SEC-001 | Deny-default backend permissions, AI dưới Admin; không self-escalate/unrestricted writes hoặc financial execution từ D08 scope | D08, V00186–95; grant không override scoped capability exclusions hoặc feature gates |
| DEC-AI-001 | Core AI-off hoạt động; per-model database/memory isolation; no unapproved external inference/egress | V00142/44, D08/D10; provider integration remains gated |
| DEC-AUTH-001 | Admin bearer-only same-origin BFF theo ADR0004/PR16; cookie mode D10 là alternative design | Không đồng thời bật hai mode; owner live login và scoped withdraw đã quan sát 07/10; session lifecycle/negative security checks cần evidence riêng |
| DEC-RELEASE-001 | Historical owner website-replacement authorization128 giữ có điều kiện; readiness và actual resource scope bắt buộc | Task review hiện tại chỉ sửa docs; không revoke authorization cũ, không deploy từ docs |
| DEC-VERSION-001 | Cập nhật V001 tại chỗ; Git history/changelog lưu revisions | V00160; không tự tạo V002 |

Các `DEC-*` là aliases/clarification cho nguồn đã có. DEC-AUTH-001 mô tả reported implementation, không owner approval mới hoặc assertion code đã merged. Không task nào được suy ra permission từ bảng này thay scope/grants hiện hành.

## Tài chính: đã chốt vs chưa kích hoạt

| Stable reference | Đã chốt về design | Applicability hiện tại |
|---|---|---|
| D02.pricing.v1 | MOQ đơn vị PIECE, all-unit tiers và quote constraints theo D02 | Implementation phải theo actual policy/config; không packs |
| D04.finance.v1 | CP_MILLI: 0.001 CP=1 VND, single tender mỗi attempt, marketplace commission floor10% seller net theo contract | CP top-up/tenders inactive; marketplace formula không self-fee direct-sale |
| D05.orders.v1 | One-seller launch, original-method/net allocation refund, payment sau website | Không activate provider từ VNPAY recommendation |
| D06.returns.v1 | Inclusive submission cutoff delivery+15×24h, clothing-condition rules và riêng complaint review | Không còn pending “return start/cutoff/eligibility baseline”; actual fee/provider/ops configs vẫn pending |

CORE và paragraphs lịch sử “precision/tender/MOQ/return rules pending” chỉ áp vào phần chưa được scoped contracts mới thay. Contracts D02–D06 là authority của values trên. Pending actual business facts/provider/grants/funding vẫn chặn feature phụ thuộc; không bịa policy để đóng pending.

## Evidence hiện tại — SYNC-PR16-001

| Layer | Nguồn hiện hành | Evidence / giới hạn |
|---|---|---|
| Main | PR16 base503ae0 | Baseline lịch sử; không dùng để mô tả publication runtime |
| Source PR16 | head56f80580e50b43c94df65d3ae79ef025ea957123, open/unmerged ngày07/10 | ADR0006, migration006 prepared, both review fixes and API/PostgreSQL CI passed; source readiness differs from deployed runtime |
| Deployment checkpoint | [04/10](../operations/CATALOG_PUBLICATION_CHECKPOINT_2026_10_04.md) | Owner activation, migration005, build/revisions, publishv22 được checkpoint báo; chưa query lại hạ tầng ở task sync |
| Browser runtime | [FLOW-CATALOG-001](CATALOG_FLOW_EVIDENCE.md),07/10 | Buyer đọc Boxy; owner Admin withdraw APPROVEDv22→DRAFTv23; detail404/catalog absent; một URL ảnh cũ bị từ chối |
| Final product state | Boxy DRAFTv23, sample DRAFTv5 | Không public product; không commerce/payment/points/B2B/indexing/public video |

ADR0005 là scoped accepted catalog-only override: reference prices không phải effective commerce offers; offering prerequisites vẫn bắt buộc trước purchase. Migration005 thay receipt renewal bằng immutable review + current version publication pointer. PR description và snapshot headers là historical source status, không phủ nhận checkpoint/live evidence mới hơn. Không đánh dấu toàn bộ Production Gates PASS.

## Technology applicability thống nhất

| Scope | Nội dung |
|---|---|
| V1 baseline | Accepted stack/ownership/contracts/security, PostgreSQL transactions và bounded reads; deployment chỉ theo readiness |
| PROPOSED adoption | Redis, dedicated API Gateway, SSE/WebSocket, circuit-breaker implementation theo workload và dependency need |
| LATER adoption | Kafka, CQRS framework/infrastructure, event sourcing, sharding, microservices, gossip, Bloom filter, Kubernetes, graph/vector clusters, active-active multi-region |
| REFERENCE knowledge | Spring MVC/Boot, AWS EC2, algorithm patterns không có business use case hiện tại |

REFERENCE là applicability, không approval status thứ năm. OOP/SOLID/complexity/algorithm invariants áp dụng khi viết LLD; việc học chúng không mandate framework/service mới. Synchronous commands và derived read projections hiện có không tự biến thành CQRS/event-sourcing deployment.

## Cách đọc lịch sử không gây xung đột

Index → CURRENT_STATE → DECISIONS/TRACEABILITY → relevant scoped contracts/modules → V001 historical source để audit. Header cũ, “latest” cũ và pending cũ bên trong V001 không có precedence trên bảng nguồn hiện hành. SOURCE và evidence mới hơn phải được ghi explicit, không xóa decisions cũ hoặc tự ratify assistant snippets.