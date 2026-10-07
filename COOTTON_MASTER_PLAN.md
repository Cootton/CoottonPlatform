# COOTTON MASTER PLAN — Index cho Work và engineering

> Hiện hành: đọc [FLOW-CATALOG-001](docs/governance/CATALOG_FLOW_EVIDENCE.md). Luồng Boxy đã có checkpoint intake/review/publish 04/10; buyer read và withdraw trực tiếp 07/10, cuối DRAFT v23. V001 bundle đã sync PR16 source18768a1 tới141; main503ae0 là baseline lịch sử, PR16 chưa merged. Nội dung 'không runtime verification' bên dưới thuộc review trước kiểm chứng này.

`MP-INDEX-001` · V001 cập nhật tại chỗ · 2026-10-07 · Asia/Saigon

Đây là cửa vào bộ tài liệu GitHub-ready. [V001](COOTTON_WORKING_V001.md) giữ toàn bộ lịch sử quyết định; các module dưới đây bổ sung kiến thức và cách áp dụng, không thay contracts D01–D10 bằng ví dụ học tập. Scope lần này: tài liệu; không cấp quyền coding, migration, payment hoặc deploy. Không tuyên bố đã publish lên GitHub.

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