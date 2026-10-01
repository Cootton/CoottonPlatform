# Core contracts 0.1.0

Trạng thái: nền móng kỹ thuật đã triển khai; không phải schema database hay commerce production.

- Canonical entity ID: UUID v4 opaque, normalize lowercase. Firebase subject là external identity riêng; không ép Firebase UID thành entity ID. SKU/slug là mã tham chiếu, không khóa định danh. ID không là quyền truy cập hoặc mã hóa; private URL vẫn cần backend authorization. UUID không chứa PII.
- VND: JSON `{currency: "VND", amount: "1000"}`; decimal integer string không âm. Không floating-point tài chính. Ledger debit/credit direction và point precision chưa khóa; không dùng kiểu này để giả lập ledger.
- API: `/v1`; hiện chỉ `GET /v1/health/live`. Liveness chỉ chứng minh process phản hồi, không chứng minh DB/payment/commerce readiness. Không endpoint readiness giả.
- Error envelope tương lai `{code, message, requestId}`: message an toàn, không stack trace/PII. Chưa có business endpoint áp dụng; status/code mapping khóa khi triển khai handler chung.
- Collections tương lai cursor pagination, bounded page size; limit, cursor encoding/index theo query workload cụ thể. Không load toàn bộ bảng hoặc giả cursor.
- Roles/surfaces không cấp quyền. Backend verify Firebase identity, explicit permissions, seller ownership và resource scope trước khi có business route. AI_SUB_ADMIN chỉ theo grant ADMIN, không tự nâng quyền.
- Business mutations bắt buộc idempotency theo principal + operation + key, persisted request fingerprint/result; khác payload cùng key phải conflict. Atomic business + ledger + outbox transaction, concurrent replay handling/retention phải khóa trước endpoint. Không tuyên bố đã triển khai các mechanisms này.
- Events at-least-once, consumers dedupe event ID, versioned payload; không gửi model memory/PII trong event mặc định. Không activate workers.
- Buyer `cootton.com`, seller `seller.cootton.com`, admin `admin.cootton.com`; shared Web codebase. Routing host không security boundary. Seller/Admin chưa tạo UI hoặc expose business data. Mobile Android/iOS dùng cùng API; chưa scaffold apps.
- Core không phụ thuộc AI. Không provider SDK, no cross-model memory và no unapproved data egress.

## Business decisions cần khóa trước commerce

Baseline owner: 10% phí, đổi trả 15 ngày, 1 CP = 1.000 VND, B2B MOQ 10 tổng đơn seller và minimum 1.000.000 VND sau ưu đãi; ADMIN có quyền cấu hình đã chốt. Không hardcode baseline thành chính sách tài chính đang chạy.

Pending: fee basis/rounding, return start/eligibility/return shipping amount, MOQ unit, price precision/tier gaps, VC conversion/funding/expiry, VCS funding/backing, tender combinations, trusted payment confirmation/provider, order/ledger state machines, inventory reserve TTL, payout/retention, PostgreSQL tables/constraints. Không DDL/migrations hoặc money operations khi chưa có contracts này.

Breaking changes cần explicit contract version + migration/consumer compatibility decision trước merge. Git diff và ADR là evidence; cập nhật V001 tại chỗ.

## D01 catalog design locked

See [D01.catalog.v1](D01_PRODUCT_CATALOG_SKU.md) for seller-owned products, unified Variant/SKU identity, global immutable SKU codes, logical PostgreSQL schema, publication and canonical URL contracts. D01 resolves its scoped design decisions; executable tables/migrations and D02 financial/quantity decisions remain gated. No new API routes are implemented by this document.

## D02 pricing design

[D02.pricing.v1](D02_PRICING_MOQ_QUOTE.md) specifies offering price versions, all-unit tiers, seller B2B minimum and quote conservation/eligibility. Owner locked MOQ unit PIECE; no packs. This replaces the older pending MOQ unit statement. CP/VC/VCS financial decisions and execution gates remain pending; no pricing endpoint or migration is implemented.

## D03 checkout design

[D03.checkout.v1](D03_CART_CHECKOUT_INVENTORY.md) defines versioned carts, one-mode all-or-nothing checkout attempts, canonical stock holds, atomicity/idempotency, deadline/recovery states and explicit D04 financial execution gates. No checkout/stock endpoint or worker is currently implemented. D04/D05 dependencies and operational configuration must be locked before execution.

## D04 finance design

[D04.finance.v1](D04_FINANCE_PAYMENT_RECONCILIATION.md) defines asset lots, balanced append-only journals, holds/funding/quota, payment evidence and reconciliation. Owner locked CP_MILLI (0.001 CP = 1 VND), single tender per attempt, and floor(10% of seller net after discounts before tender) per seller suborder. These replace older pending statements for those choices; VC/VCS activation is explicitly blocked pending issuance/conversion/backing. Other provider/refund/settlement/operational gates remain. This documentation does not implement financial writes or unlock D03 execution.

## D05 direct-sale launch override

[D05.orders.v1](D05_ORDER_SHIPPING.md) and V001 section 117 supersede historical launch/payment/return-start pending statements: single Cootton seller, website before payment, CP top-up paused, launch points inactive, VNPAY recommendation only. Refund baseline original method/net allocations, 15 days from verified delivery; remaining eligibility/cutoff/provider/config gates persist. Marketplace fee contracts remain future scope; no self-fee in direct-sale launch. Order/shipping design only, no handlers/migrations/actual transactions.
