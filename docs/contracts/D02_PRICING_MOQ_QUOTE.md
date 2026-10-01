# D02 — Giá, MOQ và quote

Contract `D02.pricing.v1`, thiết kế ngày 2026-10-01 theo owner assignment. D01.catalog.v1 là dependency. Specification này chưa triển khai pricing API, chưa tạo bảng/config giá/campaign thật, chưa ghi Neon hoặc thanh toán. Giữ V001 duy nhất. Các phần chưa đủ quyết định phải fail closed theo phạm vi, không cản review phần độc lập và không giả vờ checkout sẵn sàng.

## 1. Quy tắc đã khóa

- Backend là nguồn giá duy nhất; Web/apps cùng đọc kết quả. Client chỉ gửi offeringId, SKU quantity, mode context và voucher/tender selection; không có quyền gửi đơn giá, discount, fee hoặc sellerId như nguồn tin cậy.
- B2C một giá theo SKU/offering. B2B all-unit theo quantity của từng SKU: bậc áp một đơn giá cho toàn bộ quantity SKU đó. Không cộng khác SKU/màu/size/seller để nâng bậc.
- MOQ theo tổng phần đơn B2B của từng seller; B2C và seller khác không góp quantity/value. MOQ và minimum value là hai điều kiện đồng thời; ngưỡng tiền kiểm tra sau discount, trước tender payment. Baseline Admin 10 và 1.000.000 VND, không hardcode thành cấu hình runtime đã tồn tại.
- Minimum effective: approved seller-specific Admin override ưu tiên platform default. Seller có thể yêu cầu minimum cao hơn nhưng không tự hạ ràng buộc Admin: nếu seller minimum được bật, required threshold là max(Admin effective threshold, seller configured threshold) trên cùng unit/basis. Override Admin không cho cross-seller aggregation hoặc đổi basis sang trước discount.
- B2C không bị ngưỡng B2B. Seller mode permission B2C-only/B2B-only/both/disabled do Admin; offering không tự cấp permission. Inventory/SKU giữ cùng identity D01.
- Giao hàng ban đầu buyer shipping = 0 VND. Chi phí carrier, phí sàn 10%, settlement và return shipping không cộng vào buyer quote. Không tự thêm tax/processing/AI fee hoặc tuyên bố tax-inclusive khi invoice contract chưa rõ.
- Tender CP/VC là phương tiện thanh toán, không tự thành discount. CP incentive chỉ xuất hiện khi một policy CP đang hiệu lực và tender CP được chọn; thay tender phải tính lại. VCS là funding nội bộ seller-only, không buyer tender/discount thứ hai.

Owner đã xác nhận MOQ unit = PIECE (chiếc), tổng số chiếc B2B của từng seller; chưa hỗ trợ pack. Quantity SKU và threshold phải dùng cùng PIECE. Pack input bị INVALID_INPUT, không tự quy đổi. Quyết định này thay pending unit trong D01 và các mục planning cũ.

## 2. Price book và bậc giá

Offering là (skuId, salesMode), unique theo cặp trong toàn bộ lịch sử; sellerId luôn suy từ SKU. Giá nằm ở immutable price-book version, không sửa price version đã dùng trong quote/order. Version mới được duyệt, có effectiveFrom/effectiveUntil (UTC, khoảng [from,until), null until là không giới hạn). Một offering không có hai phiên bản active chồng thời gian. Không active version → OFFER_UNAVAILABLE; không fallback B2B về B2C hoặc dùng future/expired price.

B2C version có đúng một unitPrice. B2B có 1–100 tiers: mỗi tier chỉ lưu minQuantity và unitPrice, không lưu maxQuantity cạnh tranh. Tier đầu minQuantity=1; ngưỡng tăng chặt; khoảng tier tự là [min,nextMin), tier cuối không giới hạn. Như vậy không gaps/overlaps. Tier giá không tăng khi quantity tăng; nếu cần mô hình khác phải version contract, không admin bypass. Mỗi quantity chọn tier minQuantity lớn nhất ≤ quantity. Không có max tier không nghĩa vượt giới hạn quantity API.

Giá VND là decimal integer string, dương, tối đa 30 chữ số; PostgreSQL numeric(30,0). Không float, scientific notation, số âm hoặc giá 0 ngầm. Sản phẩm miễn phí cần policy riêng, không suy từ discount 100%. Giá trị và tiers thật do seller nhập có nguồn, không seed ví dụ. quantity là integer dương ≤2.147.483.647; API serialize quantity integer string để mọi client dùng một contract, validate trước arithmetic. Bộ tính dùng bigint; overflow bound của kết quả xử lý INVALID_INPUT trước ghi/hiển thị. Whole quote tiền không vượt 30 chữ số. Giới hạn request 100 unique offerings và 20 sellers; duplicate offering input bị INVALID_INPUT, không âm thầm cộng line.

Seller chỉ cấu hình price của mình trong permission/bounds; Admin có quyền moderation theo grant. Phát hành version phải serialize theo offering để tránh concurrent interval overlap. Disable offering không xóa price history hoặc đổi order đã xác nhận. Catalog/SKU/seller permission active được kiểm tra cùng price version.

## 3. Discount và phân bổ chính xác

Một discount policy immutable version phải khai phạm vi seller/SKU/mode/buyer/tender, effective window, formula, cap, sponsor/funding reference và combinability. Empty/unconfigured không là ưu đãi. Customer-facing voucher code chỉ là lookup token, không trust số giảm do client gửi. Không có campaign active thì discount=0. Feature CP/VC/VCS chỉ enable khi đủ contract/source; không dùng AI quyết định giá hoặc suy tỷ lệ VC.

Minimal v1 không tự stack nhiều campaign trên cùng line. Explicit requested vouchers có phạm vi xung đột → DISCOUNT_CONFLICT, không tự chọn cái rẻ hơn hoặc bỏ voucher để đạt minimum. Một policy có thể tài trợ nhiều eligible lines và một automatic policy được dùng cùng voucher chỉ khi policy composition/version xác định thứ tự và không overlap. Nếu composition thiếu → blocked, không phép cộng tùy tiện. Việc owner muốn sale linh động được đáp ứng bằng policy có version, không bằng mặc định stacking.

Rate formula chỉ hỗ trợ integer basis points 0–10000 hoặc fixed integer VND theo policy; không tự tạo giá trị rate/cap. Percentage amount = floor(eligibleBaseVnd × rateBps / 10000), cap theo policy, không vượt eligible base. Đây là quy tắc làm tròn kỹ thuật của discount; không áp cho commission, points conversion hoặc taxes. Formula và funding classification phải được duyệt trước activate. VCS funding không thay buyer amount lần nữa.

Discount tổng được phân bổ theo trọng số eligible line base, exact largest-remainder: floor(D × lineBase / sumBase), rồi phân bổ từng đồng còn lại theo remainder giảm dần; hòa remainder dùng SKU UUID rồi offering UUID tăng dần. eligibleBase=0 → không allocate, không chia cho 0. D≤eligibleBase, allocations≥0 và không vượt line base; sum allocations = D. Nếu policy theo line thì scope chỉ line đó. Cross-seller campaign được chia về lines một lần; seller subtotal lấy sum allocations thuộc seller, không tạo discount lần hai.

Example chỉ minh họa: base 101 và 100 VND, discount 100 → floors 50 và 49, dư một đồng về line thứ hai (remainder lớn hơn): allocation 50/50, net 51/50, tổng net 101. Đây không phải bảng giá thật. Discount 150.000 trên subtotal 1.100.000 → net 950.000, nên không đạt minimum 1.000.000 dù quantity đủ. Backend không bỏ discount để làm đơn đạt minimum.

## 4. Minimum và pipeline duy nhất

Validate shape/limits → canonical SKU/offering/seller status và permission → select effective price versions → per-SKU all-unit unitPrice → base line totals → approved discount selection và funding eligibility → allocate discounts → per-seller B2B minimum sau discount → buyer shipping zero → payableVnd → tender eligibility → immutable quote.

Seller B2B quantity = sum(quantity của B2B lines seller), giá trị = sum(line net B2B seller). Tender CP/VC không trừ minimum thêm lần nữa. `shortfallQuantity=max(requiredQty-actualQty,0)`, `shortfallVnd=max(requiredVnd-netVnd,0)`. Cả hai phải bằng 0 và policy/unit/permissions hợp lệ. Explicit disabled threshold dùng enabled=false, không null/empty/0 ngầm. B2C group không có minimum B2B. Same seller B2C/B2B cùng request có groups riêng; mixed-mode checkout activation còn D03, không tự gộp để đặt đơn.

Admin minimum policy phải khai scope, unit, enabled flags, quantities/amounts, version/effective interval; missing default không nghĩa bỏ MOQ. Seller stricter threshold cùng unit/basis; khác unit bị policy invalid. Admin giảm ngưỡng chỉ ảnh hưởng quote/giao dịch mới, orders giữ snapshot. Không retroactively tăng giá hàng giữ lại khi partial return tụt tier/MOQ.

## 5. Quote DTO và trạng thái

Future endpoint specification `POST /v1/quotes/preview`, chưa expose. Request có lines[{offeringId,quantity}], voucherCodes (tối đa 5, bounded 64-character lookup input), tenderSelection (UNSPECIFIED/CASH/CP/VC), expectedQuoteId optional để so sánh. Auth/buyer identity suy từ verified context; guest chỉ thấy giá public; private buyer eligibility không expose. Không nhận arbitrary conditions hoặc amount. Mode từ canonical offering, không tự chuyển mode theo route/quantity.

Response allowlist:

- quoteId UUID, createdAt, expiresAt, contractVersion, state, input fingerprint opaque; public IDs không là bearer authorization.
- lines: offeringId/skuId/public seller reference, mode, quantity/unit, priceVersionId, tier minQuantity, unitPrice/base/discount/net VND strings; public-safe discount reason và version references.
- seller B2B groups: applicable policy versions, required/actual quantities, required/net value, shortfalls, eligibility và buyer-safe blockers. B2C groups tách riêng.
- totals: sum base, sum discounts, shipping='0', payable=sum net; currency VND. `totals.base - totals.discount + totals.shipping = totals.payable = sum(lines.net)`.
- tender status riêng; conversion/point amount chỉ khi đúng approved D04 contract. Không cộng CP+VC thành một amount; UNSPECIFIED không tự chọn payment.
- change summary khi reprice: trước/sau và buyer-safe reason; không expose sponsor cost, VCS balance/funding details, private eligibility rules/evidence hoặc stack trace.

Quote lifecycle CALCULATED/BLOCKED/CONFIRMABLE/STALE. CALCULATED có giá hợp lệ nhưng chưa bảo đảm checkout. BLOCKED khi eligibility/policy/input phụ thuộc thiếu; nếu không tính được giá thì totals=null, không giá 0 giả. CONFIRMABLE chỉ khi D03/D04 readiness + tất cả canonical conditions thật đã đáp ứng; hiện chưa có runtime nên không tuyên bố state này đang hoạt động. STALE là view của quote hết hạn hoặc facts/input/tender thay đổi, snapshot gốc không sửa.

Quote validity mặc định đề xuất kỹ thuật 300 giây, future server config 30–900 giây, server clock UTC; chưa tạo config runtime. TTL không giữ stock/points/quota hay cố định quyền sử dụng voucher. Price/revocation thay đổi có thể làm stale sớm hơn TTL. Checkout phải revalidate dưới transaction/holds D03/D04; nếu amount hoặc terms thay đổi phải có quote mới và buyer xác nhận lại. Không silent accept hoặc order paid từ preview.

Preview không debit ledger, giữ tồn, trừ quota/campaign budget, dùng VCS hay tạo order. Có thể lưu quote snapshot private và audit read, không coi đó là transaction kinh doanh. Retry preview tạo kết quả deterministic tại cùng facts/versions/time; không promise cùng quote ID nếu không có idempotency contract. Confirm order là command riêng persisted idempotency, không reuse quote ID làm khóa chống double-spend.

## 6. Logical PostgreSQL schema (chưa migration)

| Relation | Key facts | Constraints/index design |
|---|---|---|
| pricing_offering | id UUID, sku/seller references, mode B2C/B2B, enabled, version | unique(skuId,mode); ownership same D01 parent; no duplicate stock; index(sellerId,mode,id) |
| pricing_price_version | id UUID, offeringId, sequence bigint, lifecycle DRAFT/APPROVED/RETIRED, effective interval, currency VND | unique(offeringId,sequence); positive sequence; from<until; serialize approval to prohibit overlapping approved intervals; index(offeringId,effectiveFrom) |
| pricing_tier | priceVersionId, minQuantity integer, unitPrice numeric(30,0) | composite PK; minQuantity>0, price>0; kind/count/order/monotonic checks in version approval transaction; immutable after approve |
| pricing_minimum_version | id UUID, platform or seller scope, enabled flags/unit/quantity/value, sequence/effective interval | exactly one applicable version per scope/time; no null disables; scope/unit/basis contracts validated; approved seller override precedence |
| pricing_discount_version | id UUID, formula kind, fixed amount or bps, scopes/caps/windows, funding refs, lifecycle/version | exact discriminated fields, bounded amounts/bps; no executable code/admin expressions; activation gated by campaign/funding contract |
| pricing_quote | id UUID, verified principal or private guest binding, created/expires timestamps, fingerprint, immutable validated JSONB snapshot D02 schema | PK; expires>created; index(principal,createdAt,id), index(expiresAt,id) for bounded retention jobs; no public customer keys |

Quote JSONB là immutable derived snapshot, không nguồn pricing policies hoặc arbitrary admin fields. Child line/group allocations nằm trong bounded snapshot tối đa 100 lines/20 sellers; exact DTO schema validated trước persist. Prices/minimum/discount source records là relational/versioned. No cascading deletion of references used in orders/quotes. Retention amount/time chưa chốt D10, không tự purge snapshots/audit; expired quote không nghĩa dữ liệu được xóa.

Quote creation đọc consistent canonical versions trong một bounded DB snapshot transaction; không outbound provider calls/model calls trong transaction. Shared schema locking/version checks serializes policy edits; price version overlap cần database-level constraint hoặc locked command discipline với restricted writers, không chỉ SELECT trước INSERT. Approval mutation có RBAC, expected version, idempotency, audit/outbox atomic như core contract. Snapshot transaction không bảo đảm stock/quota không đổi sau commit.

Cache price display/read projections theo offering/mode/version; cache không nguồn final quote. No private quote caching CDN. Quote tokens/URLs/logs không PII/balances. AI optional và không có financial-write access từ pricing read permission.

## 7. Gate register và errors

| Gate | Owner / phần được phép tiếp tục |
|---|---|
| MOQ unit | Đã chốt PIECE (chiếc); chưa pack; mixed units bị từ chối |
| Seller actual prices, tiers và minimum config | Seller/Admin approved records; không seed hypothetical values |
| B2B buyer eligibility | Admin business decision/D08; chưa khai → no confirmable B2B checkout |
| Discount rates/stacking/caps/sponsors/economic funding | Admin/D04; chưa active approved policy → không apply; requested unknown voucher trả blocker |
| CP precision, remainder khi payable không chia hết 1.000; VC/VCS source/rate/expiry, mixed tender | D04; no inferred ceil/free remainder/negative balance; affected tender blocked |
| Phí 10% basis/rounding, settlement, tax/invoice | D04/D07; buyer quote không tính seller payable/tax claims |
| Stock holds/quota race/payment confirmation/commit atomicity | D03/D04; no purchase guarantee from preview |

Errors: INVALID_INPUT for empty/noninteger/out-of-bound/duplicate lines; OFFER_UNAVAILABLE for missing/ineligible offering/version; PRICE_POLICY_INVALID for malformed tiers/intervals/unit; MINIMUM_NOT_MET with seller-safe shortfalls; DISCOUNT_INVALID/CONFLICT for requested invalid benefit; TENDER_NOT_READY/INSUFFICIENT for selected unready/insufficient tender; QUOTE_STALE for changed facts/time; UNAVAILABLE for dependency timeout. Map to core error envelope through future API handler; codes inside quote blockers are business reasons, not an unreviewed replacement for core transport ErrorCode. No stack/PII leaks, no zero-price fallback or basket auto-correction.

Acceptance: every quote total conserves integer VND; all-unit tier uses per-SKU quantity; seller minimum excludes B2C/other sellers and uses net after discounts; sponsor/tender separation; unknown policy blocks only dependent readiness; concurrent version edits cannot silently confirm stale quote; stored snapshots support partial refund without retroactive tier repricing. Review examples: quantity 5+5 on two SKUs same seller can satisfy MOQ 10 while each SKU still takes tier for 5; split sellers 5+5 cannot; discount can break value minimum; duplicate request does not debit anything; empty quantity never defaults to MOQ.

Next: D03 checkout/reservation contract, with D04 financial contracts required before execution. D02 document completion does not complete unresolved owner financial decisions or authorize migration.
