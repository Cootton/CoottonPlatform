# Bản đồ kiến thức → authority → áp dụng

`KN-MAP-002` · v0.2.0 · Các KB IDs là aliases biên tập, không phải contracts thay thế. Đọc [CORE](../contracts/CORE.md), [DECISIONS](../governance/DECISIONS.md), [CURRENT_STATE](../governance/CURRENT_STATE.md) trước khi thực hiện.

## Tám miền kiến thức

| Miền từ v0.1.0 | Áp dụng hiện tại | Nguồn repository |
|---|---|---|
| Foundation/business | Một Cootton seller; website trước payment; canonical business invariants | [architecture](../engineering/01_ARCHITECTURE.md), D01–D10, DEC-ARCH/LAUNCH/LEGACY |
| Data/knowledge | PostgreSQL trên Neon; media blobs ngoài DB; projections/cache dẫn xuất | [data/cache](../engineering/03_DATA_CACHE.md), ADR0002, API_MEMORY_CACHE |
| API/security | /v1, RULE-API-001, bearer-only same-origin Admin BFF; singleton verified human owner hiện tại | [API](../engineering/02_NETWORKING_API.md), [endpoint records](../contracts/API_ENDPOINT_CONTRACTS.md), [auth matrix](../contracts/API_AUTHORIZATION_MATRIX.md) |
| Events/reliability | Durable receipt/transaction/outbox theo operation, retry/reconciliation có contract | [async](../engineering/04_ASYNC_EVENTING.md), [API04](../contracts/API_TRANSACTION_MEDIA_RECOVERY.md), D03/D04 |
| AI system | Optional; isolated models/memory, approved tool/data egress; chưa catalog inference activation | [security/AI](../engineering/07_SECURITY_AI_GATEWAY.md), D08 |
| Performance/operations | Bounded cache/queries; profile/SLO/resource thresholds cần evidence | [performance](../engineering/05_PERFORMANCE_SCALING.md), D10, [gates](../engineering/08_TESTING_PRODUCTION_GATES.md) |
| Engineering/governance | V001 in-place, ADR/version/traceability; source và authorization riêng | [design](../engineering/09_SOFTWARE_DESIGN.md), [traceability](../governance/TRACEABILITY.md), AGENTS |
| Learning library | Algorithms, patterns, Spring/Java/cloud là kiến thức tham khảo; không stack change mặc định | [algorithms](../engineering/10_ALGORITHMS_DATA_STRUCTURES.md), [runtime/Git/cloud](../engineering/11_RUNTIME_GIT_CLOUD.md) |

## KB-C01–C12 được dẫn về contracts hiện có

| Alias cũ | Authority chính | Trạng thái diễn giải đúng |
|---|---|---|
| KB-C01 Domain | D01–D10, DEC-ARCH-001, ADR0001 | Domain design đã có; executable readiness theo từng feature |
| KB-C02 Canonical data/tx | D01/D03/D04, ADR0002, API_TRANSACTION_MEDIA_RECOVERY | SQL001–006 đã applied theo ACT006; không mọi commerce schema đã chạy |
| KB-C03 Cache/projections | API_MEMORY_CACHE, CATALOG_PUBLICATION, engineering03 | Bounded memory cache/public projection có source; Redis chỉ proposed |
| KB-C04 Identity/security | D08, API_AUTHORIZATION_MATRIX, ADR0008 | Human owner scoped evidence có; full identity/security gate còn mở |
| KB-C05 API semantics | RULE-API-001, API_ENDPOINT_CONTRACTS, OpenAPI, ADR0007 | API01–04 đã có source/records/tests; chưa suy main đã rollout |
| KB-C06 Events/outbox | engineering04, D03/D04, API04 | Durable records ở scoped source; consumer lifecycle/recovery cần evidence |
| KB-C07 Safe external workflows | API04, D04/D06/D10 | Media scoped proof có; recovery002 và provider/payment activation chưa hoàn tất |
| KB-C08 Agent/tools | D08, engineering07, V001 security sections | AI optional/gated; không grant hoặc activate bởi general learning approval |
| KB-C09 RAG/memory/vision | engineering07, data restrictions/V001 | Learning/proposed features; provenance/ACL/egress/evals trước activation |
| KB-C10 Capacity/SLO | D10, engineering05/08 | Resource history khác measured candidate budgets; thresholds cần signoff |
| KB-C11 Evidence/recovery | GATE_EVIDENCE, API04 checkpoint/deploy plan | Scenario PASS không full gate PASS; review này không re-run tests |
| KB-C12 Governance/version | V001, DECISIONS, TRACEABILITY, AGENTS | Accepted old decisions preserved; new plan proposed, V001 không đổi version |

## Business invariants đã chốt cần giữ

| Domain | Điều đã chốt / giới hạn activation |
|---|---|
| [D01](../contracts/D01_PRODUCT_CATALOG_SKU.md) | Canonical product/SKU identities và ownership; không fictitious actual products |
| [D02](../contracts/D02_PRICING_MOQ_QUOTE.md) | PIECE, no packs, all-unit tiers và per-seller B2B MOQ; quote từ canonical data |
| [D03](../contracts/D03_CART_CHECKOUT_INVENTORY.md) | Cart/version/quote/hold design; D04/D05 executable conditions trước actual checkout |
| [D04](../contracts/D04_FINANCE_PAYMENT_RECONCILIATION.md) | CP_MILLI precision, single tender, seller-net commission floor; launch points inactive, không tự self-commission; provider activation chưa chốt |
| [D05](../contracts/D05_ORDER_SHIPPING.md) | Single seller/direct sale, website before payment, original-method refund theo allocations |
| [D06](../contracts/D06_RETURN_REFUND_RESTOCK.md) | Inclusive delivery+15×24h request cutoff; personal return conditions riêng với wrong/defective/damaged complaints |
| [D07](../contracts/D07_SELLER_BUSINESS_REPORTING.md) | Unknown COGS/costs là incomplete reporting, không fake zero profit/self-payout |
| [D08](../contracts/D08_ADMIN_RBAC_POLICY.md) | Scoped capabilities/readiness, owner bootstrap; host/email/role labels không authority |
| [D09](../contracts/D09_UX_SEO_HELP.md) | Noindex tới scoped release; indexability không purchase readiness |
| [D10](../contracts/D10_OPERATIONS_BACKUP_RELEASE.md) | Backup/DR/monitoring/release evidence; app version count không retention policy |

Nếu thấy pending statements lịch sử mâu thuẫn, đọc newest scoped override và ghi nguồn supersession; không tự mở lại quyết định đã khóa. Mapping không đổi ID/version/status của contract gốc.
