# COOTTON MASTER PLAN — Index cho Work và engineering

> **ACT006-RUNTIME-001 · 2026-10-07:** Migration006 đã áp dụng/idempotent và API `cootton-api-act006-3c768d6` đã nhận100% traffic. Đọc [runtime checkpoint](docs/operations/ACTIVATION006_CHECKPOINT_2026_10_07.md) để phân biệt DB rollback/storage helper/HTTP evidence. Boxy vẫn DRAFTv23; các ghi chú006 chưa áp dụng dưới đây là lịch sử. Full Production Gates chưa PASS.


> **MERGE-PR16-001 · 2026-10-07:** PR #16 đã merge vào `main` tại `6205aa2ff1eee6c750fa277bb1faf5ae397c6ff6`; source fixes56f8058 được giữ nguyên. PR #17 đã chuyển base sang `main` và đang kiểm tra trước merge. Các ghi chú PR16 open/unmerged/stacked bên dưới là lịch sử. Migration006 vẫn chưa áp dụng production; merge không chứng minh runtime/deployment hoặc đóng Production Gates.


> **SYNC-PR16-006 · 2026-10-07:** Source hiện hành là PR #16 `56f80580e50b43c94df65d3ae79ef025ea957123`; [bản đồng bộ migration006](docs/governance/MIGRATION006_SOURCE_SYNC.md) phân biệt source/CI đã kiểm chứng với deployment checkpoint lịch sử. Migration006 đã chuẩn bị, **chưa áp dụng production**. Các source18768a1/pending notices dưới đây là lịch sử; không chứng minh runtime đang chạy bản sửa.

> Hiện hành: đọc [FLOW-CATALOG-001](docs/governance/CATALOG_FLOW_EVIDENCE.md). Luồng Boxy đã có checkpoint intake/review/publish 04/10; buyer read và withdraw trực tiếp 07/10, cuối DRAFT v23. V001 bundle đã sync PR16 source18768a1 tới141; main503ae0 là baseline lịch sử, PR16 chưa merged. Nội dung 'không runtime verification' bên dưới thuộc review trước kiểm chứng này.

`MP-INDEX-001` · V001 cập nhật tại chỗ · 2026-10-07 · Asia/Saigon

Đây là cửa vào bộ tài liệu GitHub-ready. [V001](COOTTON_WORKING_V001.md) giữ toàn bộ lịch sử quyết định; các module dưới đây bổ sung kiến thức và cách áp dụng, không thay contracts D01–D10 bằng ví dụ học tập. Scope lần này: tài liệu; không cấp quyền coding, migration, payment hoặc deploy. Đã gửi GitHub review tại [PR #17](https://github.com/Cootton/CoottonPlatform/pull/17); chưa merge hoặc deploy. [PUB-DOCS-001](docs/governance/GITHUB_REVIEW_SCOPE.md) ghi phạm vi publication.

## Thứ tự đọc bắt buộc cho Work

1. Đọc index này, [trạng thái hiện hành](docs/governance/CURRENT_STATE.md), [governance và nguồn](docs/governance/DECISIONS.md), [traceability](docs/governance/TRACEABILITY.md).
2. Đọc notice đầu [V001](COOTTON_WORKING_V001.md), §§106–107, §§117–141 và appendices MP-ENG-001/MP-REVIEW-001. Dùng CURRENT_STATE và scoped overrides; headers/pending lịch sử giữ để audit.
3. Đọc [CORE](docs/contracts/CORE.md), ADR [0001](docs/adr/0001-foundation.md), [0002](docs/adr/0002-neon-connection.md), [0003](docs/adr/0003-catalog-read-slice.md), [quy tắc tổng hợp mới](docs/adr/knowledge-001-engineering-consolidation.md).
4. Đọc [architecture](docs/engineering/01_ARCHITECTURE.md) → [API/networking](docs/engineering/02_NETWORKING_API.md) → [data/cache](docs/engineering/03_DATA_CACHE.md) → [async](docs/engineering/04_ASYNC_EVENTING.md).
5. Đọc [performance](docs/engineering/05_PERFORMANCE_SCALING.md) → [payment](docs/engineering/06_PAYMENT.md) → [security/AI Tool Gateway](docs/engineering/07_SECURITY_AI_GATEWAY.md).
6. Đọc [testing/Production Gates](docs/engineering/08_TESTING_PRODUCTION_GATES.md) và [gate evidence hiện hành](docs/governance/GATE_EVIDENCE.md), rồi contract D01–D10 liên quan task. Gate của domain là bắt buộc, bảng tóm tắt không giảm điều kiện.
7. Đọc [HLD/LLD/OOP/SOLID/patterns](docs/engineering/09_SOFTWARE_DESIGN.md), [algorithms](docs/engineering/10_ALGORITHMS_DATA_STRUCTURES.md), [Spring/Git/cloud](docs/engineering/11_RUNTIME_GIT_CLOUD.md) theo nhu cầu.
8. Trước sửa: tạo task record theo mẫu governance; sau sửa: cập nhật traceability, ADR nếu đổi quyết định, [changelog](CHANGELOG.md), evidence và trạng thái gate.

## Trạng thái source và runtime

Đọc [checkpoint deployment04/10](docs/operations/CATALOG_PUBLICATION_CHECKPOINT_2026_10_04.md), [ADR0004](docs/adr/0004-admin-catalog-workflow.md), [ADR0005](docs/adr/0005-catalog-publication.md) và [publication contract](docs/contracts/CATALOG_PUBLICATION.md) cùng FLOW-CATALOG-001. Header/status pending trong pinned source là lịch sử; trạng thái cuối buyer/Admin được ghi trong CURRENT_STATE. Không dùng catalog acceptance để mở commerce.

## Baseline có hiệu lực

| Stable ID | Quyết định giữ nguyên | Nguồn chính |
|---|---|---|
| DEC-ARCH-001 | NestJS/TypeScript modular monolith; shared Next.js Web; AI optional | V001 §§49,107; ADR0001 |
| DEC-DATA-001 | PostgreSQL canonical; Neon hiện dùng; Cloud SQL là hướng stack lịch sử/future migration, không hai commerce truths | ADR0002; V001 §127; D10 |
| DEC-LAUNCH-001 | Một seller Cootton; website trước payment; CP top-up paused, CP/VC/VCS chưa bật | V001 §117; D04/D05 |
| DEC-ASYNC-001 | Durable outbox/Cloud Tasks khi side effect cần; Kafka/Redis không mặc định V1 | V001 §§49,93,107 |
| DEC-SEC-001 | Backend sở hữu permissions và business invariants; AI không self-escalate, không unrestricted SQL/financial writes | D08; V001 §§42,86–95 |
| DEC-VERIFY-001 | Targeted verification theo task; không còn cấm tests tuyệt đối | V001 §106; D10 |
| DEC-LEGACY-001 | Selective reuse thay blanket reset; giữ compatible infrastructure/data/owner access | V001 §127 |

Các ID `DEC-*` là aliases cho quyết định cũ, không phải approvals mới. Effective decisions và financial/auth/evidence/authorization đọc tại CURRENT_STATE. [Review report](docs/governance/REVIEW.md) và [ADR-KNOWLEDGE-002](docs/adr/knowledge-002-review-reconciliation.md) ghi resolutions. ACCEPTED khác implementation evidence và authorization.

## V1 / PROPOSED / LATER

V1 dùng kiến trúc đã chốt, bounded queries, transactions/idempotency, private/public projections, security và readiness gates. Redis cache, dedicated API Gateway, SSE/WebSocket, circuit breaker implementation là PROPOSED khi use case được đo và review. Kafka, CQRS infrastructure, event sourcing, sharding, microservices, gossip, Bloom filter, graph/vector cluster, Kubernetes và multi-region active-active là LATER. Không task nào được thêm chúng chỉ vì có trong bài học.

## Giới hạn nguồn và điểm cần giải quyết

Hội thoại tham chiếu chỉ trả 5 turns, không cursor; hình gốc không được đọc trong task này. Các chủ đề người dùng liệt kê được tổng hợp bằng kiến thức kỹ thuật và tài liệu chính thức, không giả là đã khôi phục toàn bộ chat. Nhãn ACCEPTED trong câu trả lời assistant của chat được giữ trong registry như historical claim, không biến thành owner approval.

Repository checkout baseline: `Cootton/CoottonPlatform`, SHA `503ae0be7f2956af2b9c006c364e758e7ee58b03`. Checkpoint cục bộ §§129–131 báo bootstrap/secrets preparation mới hơn nhưng chưa có trong main: giữ dưới nguồn riêng, không khẳng định đã đồng bộ code/deploy. Một ADR0004 Admin được nhắc trong V001 nhưng file không có ở baseline; ADR mới dùng filename có tên riêng và stable ID `ADR-KNOWLEDGE-001`, không chiếm hay đổi ID Admin.

## Bản đồ domain contracts

[D01 Catalog/SKU](docs/contracts/D01_PRODUCT_CATALOG_SKU.md) · [D02 Pricing/MOQ](docs/contracts/D02_PRICING_MOQ_QUOTE.md) · [D03 Checkout/Inventory](docs/contracts/D03_CART_CHECKOUT_INVENTORY.md) · [D04 Finance](docs/contracts/D04_FINANCE_PAYMENT_RECONCILIATION.md) · [D05 Order/Shipping](docs/contracts/D05_ORDER_SHIPPING.md) · [D06 Return/Refund](docs/contracts/D06_RETURN_REFUND_RESTOCK.md) · [D07 Reporting](docs/contracts/D07_SELLER_BUSINESS_REPORTING.md) · [D08 Access](docs/contracts/D08_ADMIN_RBAC_POLICY.md) · [D09 UX/SEO](docs/contracts/D09_UX_SEO_HELP.md) · [D10 Operations](docs/contracts/D10_OPERATIONS_BACKUP_RELEASE.md).

## Completion của bộ tài liệu

[Phản biện hệ thống và hướng xử lý](docs/governance/ADVERSARIAL_REVIEW.md) ghi11 risks, priorities, proposed remedies và evidence cần đạt. Đây là PROPOSED remediation; không thay accepted decisions hoặc runtime.

Đã tổng hợp tài liệu ≠ đã triển khai ≠ đã pass Production Gates. Các evidence runtime lịch sử giữ nguyên nguồn/thời điểm, không dùng docs check thay security/load/restore/payment acceptance. Bước tiếp theo của Work: xác minh HEAD và các checkpoint chưa merge, chọn task nhỏ được owner giao, khóa dependencies và chỉ thực thi trong scope đó.

## RULE-API-001 — Endpoint contract and data control · 2026-10-07

Owner ACCEPTED:

> Mỗi endpoint phải mô tả request/response, quyền truy cập, điều kiện dữ liệu, tác động nghiệp vụ, hành vi khi retry hoặc xung đột, và bằng chứng kiểm thử.

[Required endpoint fields and review record](docs/engineering/ENDPOINT_CONTRACT_RULE.md) · REQ-API-CONTRACT-001 · ADR-KNOWLEDGE-003. Applies to every endpoint; preserve existing accepted contracts. Compliance requires scoped implementation/test evidence; existing endpoints are not automatically certified and Production Gates remain unchanged.


## API-01 — Endpoint inventory · 2026-10-07

[HTTP inventory](docs/engineering/API01_HTTP_INVENTORY.md) pins main `a2d893e3b9828cc42691ac1d9a4e299a7c41dec1`: 13 backend operations and 10 logical Web proxy operations. Work reads this after the API/networking module and before API-02 contract work. API-01 is VERIFIED for source inventory only; six findings remain follow-ups. The owner endpoint rule is documented in separate, unmerged [PR #19](https://github.com/Cootton/CoottonPlatform/pull/19); do not assume it is already on main. Existing ACCEPTED decisions and runtime checkpoint retain their authority.



## API-02 — Contract records and reconciliation

Read [endpoint/action contracts](docs/contracts/API_ENDPOINT_CONTRACTS.md) → [OpenAPI](docs/contracts/openapi.json) → [ADR0007](docs/adr/0007-http-contract-reconciliation.md) → [API-02 evidence](docs/governance/API02_EVIDENCE.md). Prepared source changes make command201 explicit and reconcile parser/proxy errors. API-01 remains a historical pinned inventory; ACT006 is still runtime authority. API-03 authorization, API-04 transactions and API-05 complete flow evidence remain open; no full gate PASS.

