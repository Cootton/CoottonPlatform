# D05 — Đơn hàng và vận chuyển: một seller Cootton

Contract `D05.orders.v1`, thiết kế 2026-10-01. Dependencies CORE/D01/D02/D03/D04; D06 returns, D08 permissions và D10 operational readiness theo chức năng. Scope hiện tại là documentation/logical design, không migrations, API, orders, carrier calls, payment hoặc deploy. Giữ V001 tại chỗ.

## 1. Launch scope và overrides mới nhất

Owner đổi launch thành Cootton bán trực tiếp hàng của mình, một seller, Hộ kinh doanh Cootton là đơn vị bán/nhận tiền. Không marketplace seller độc lập/thu hộ/split payout trong launch. Một sellerId canonical giữ từ D01; seller portal là staff Cootton quản lý hàng/tồn/đơn trong grants, không self-registration hoặc tạo seller thật từ tài liệu này. B2C homepage và B2B entry/PIECE/all-unit/minimum contracts vẫn giữ; B2B buyer eligibility chưa approved thì readiness phần đó blocked.

Owner chọn hoàn thiện website trước, task tích hợp thanh toán sau để có cơ sở thẩm định hồ sơ. Chưa chọn VNPAY thành approved integration: VNPAY là recommendation pending merchant acceptance. CP top-up explicitly paused, launch CP tender/VC/VCS inactive theo hướng VND trực tiếp; no issue/credit/spend points hoặc fake provider. Kiến trúc future multi-seller/CP không xóa nhưng không runtime enable ngầm. Phí marketplace 10%/D04 formula giữ future contracts, chưa tự khấu trừ internal seller self-fee hoặc tạo payout cho chính Cootton; D04 financial templates phải phân biệt direct-sale với marketplace.

Owner đã chốt refund: VND về original payment method; CP future hoàn đúng original consumed units; VC/VCS disabled. Partial refund dùng original paid net allocation, không reprice tier/MOQ của hàng giữ; fee reversal bounded corresponding original fee nếu có actual fee. Đổi trả 15 ngày từ confirmed successful delivery; Cootton chịu fixed return transport fee Admin policy. Refund cap/chống trùng/unknown reconciliation giữ D04. Deposit refund CP separate inactive. Eligibility, processing deadlines, carrier/service area/cost và invoice/tax còn cần actual policy.

## 2. Website trước payment: không giả hoàn tất đơn

Build target gồm public catalog, cart, address form, canonical quote/review screen, account/order views và Cootton staff management. Website chưa có payment adapter phải hiển thị rõ thanh toán trực tuyến chưa mở. Cart/preview không giữ stock/price hoặc tạo paid/confirmed order. Không dùng COD/manual transfer/mark-paid như fallback khi chưa owner authorizes riêng.

V1 trước payment không có submit-order command production, không giữ tồn hoặc tạo yêu cầu mua hàng rồi gọi đó là confirmed order. Buyer có thể save cart/preview trong authorized implementation sau; order view có truthful empty/not-enabled state, không seed đơn mẫu như đơn thật. Nếu sau này cần inquiry/request-order phải được giao task contract riêng, không phát sinh tự động. Đây là readiness staging trong kiến trúc, không yêu cầu chạy sandbox hoặc giả người dùng/giao dịch.

Sau payment task, confirmed order chỉ được tạo atomically qua D03 COMMITTED cùng valid payment evidence/D04 action và stock commit. UUID/order code không permission hoặc proof payment. Một checkout một mode, một seller Cootton; attempt có seller khác → SCOPE_NOT_SUPPORTED, không tự đổi seller. D03 future multi-seller semantics chưa launch. Không duplicate domain logic giữa website/Android/iOS.

## 3. Order aggregate và snapshots

Order có opaque UUID, buyer principal, Cootton sellerId, mode B2C/B2B, sourceAttemptId unique, contractVersion, positive version string, acceptedAt UTC, accepted quote/tender/policy refs và private address/contact snapshot. Public-safe human order code là unique lookup/display, không chứa phone/email/date of birth. Backend verified buyer identity/ownership, không tin buyerId/sellerId/paid input. No guest checkout từ scope này.

Canonical order chứa một seller component trong launch, dùng existing seller refs và line ownership; không cần nhân bản order và suborder như hai sources cạnh tranh. Future multi-seller dùng explicit version/migration và child aggregate khi authorized; không tạo giả seller split ngay. Immutable lines: lineId, SKU/offering IDs, historical title/code/variant, PIECE quantity, price/tier versions, unit/base/discount/net VND, approved policy and allocations. Catalog edit/archive/slug change không thay dòng đơn. Snapshot media giữ approved asset reference/retention, không URL secret.

Order snapshot bounded D02 max100 offerings, một seller launch; each net and totals conserve integer VND. Payment/stock refs canonical, totals không float. Address/contact private separately scoped, address reference không thay immutable accepted snapshot khi buyer chỉnh sổ địa chỉ. AcceptedAt/paymentAt/deliveryAt khác timestamps; không lấy createdAt làm paid/delivered. No arbitrary JSON source of financial balances.

## 4. State machines tách nghĩa

Order state CONFIRMED → PROCESSING → FULFILLING → DELIVERED → CLOSED theo evidence; REFUND/RETURN không là overwrite order paid flag. CANCELLED chỉ khi chưa handoff và cancellation workflow hoàn tất; CANCELLATION_PENDING giữ obligations đến refund/stock resolution. Exception là linked incident/case, không tùy tiện set terminal enum. CLOSED administrative fulfillment completion không xóa quyền return/refund/chargeback hoặc history; closing rules pending D06/D10, không auto-close theo invented days.

Payment state đọc D04 collection/refund allocations (confirmed/partial refund/refund pending/review) không editable order field. D03 committed internal/external effect là authority, staff không chuyển paid bằng checkbox. Fulfillment state UNFULFILLED→PACKING→READY→HANDED_OVER→IN_TRANSIT→DELIVERED, hoặc DELIVERY_EXCEPTION/RETURNING→RETURNED theo trusted evidence; có failed-attempt history, không pretend return-to-origin là delivery thành công. Payment refunded không imply restocked/delivery cancelled; giao thành công không imply settlement đã complete.

Launch giản lược: một outbound shipment cho toàn order; chưa partial fulfillment/multiple outbound parcels. Nếu không đóng thành một shipment/serviceability không đủ → review trước nhận đơn, không auto-drop line hoặc phát thêm parcel. Delivery failed/re-delivery không phí buyer mặc định; costs/limits cần approved carrier policy. Một replacement/return shipment là D06 linked workflow, không duplicate initial order charge.

Allowed staff commands có expected version, persisted idempotency, scoped grant, reason/evidence: accept processing, record pick/pack, prepare shipment, submit carrier intent, record verified handoff/delivery, request cancellation và resolve exception proposal. Buyer có read/request-cancel theo state, không trực tiếp change state. AI read/support/propose theo grant, không fabricate evidence/confirm dispatch/refund/SQL updates. Carrier events chỉ nguồn facts, không permissions.

## 5. Địa chỉ và serviceability

Address input gồm recipient/contact/address lines, canonical administrative location reference và optional delivery note bounded; null/empty required field → controlled ADDRESS_INVALID, không default office/home/owner address. Optional fields normalize trim/empty→absent theo explicit schema; no arbitrary HTML/scripts. Phone/address validation và supported locality registry phải có approved current reference, không hardcode historical district labels thành delivery truth. Registry version/provider source retained; old snapshot không bị đổi khi locality renamed.

Buyer address CRUD chỉ owner scope/version; never PII in URL, public IDs still require authorization. Before checkout validate canonical locality/contact completeness và approved carrier serviceability/product constraints from actual facts. Không carrier/serviceability policy → ADDRESS_NOT_READY/DELIVERY_NOT_READY, không promise nationwide delivery. Fresh serviceability evidence and effective validity recheck in D03 reservation; external carrier query trước transaction, persist decision version/expiry, không call network under resource locks.

Post-confirm address correction trước handoff cần buyer consent và staff scoped command/version, revalidate serviceability, append prior/new private snapshots audit. Không silently change paid total hoặc shipping buyer zero; nếu không thể giao thì cancellation/exception workflow. Sau handoff chuyển carrier change request/evidence, không sửa local address giả carrier đã đổi. Support/analytics AI không mặc định nhận full address.

## 6. Shipping costs, carrier và package facts

Buyer initial shipping = 0 VND theo owner, không checkout surcharge vùng xa/packing/handling ngầm. Internal carrier fee khác buyer price; payer/account/carrier invoice/budget approved riêng. Cootton trực tiếp seller nên Cootton dự trù vận chuyển trong giá bán. Khi actual shipping exceeds budget, staff xử lý cost incident không reprice accepted order. Chưa carrier contract/service region/cost approval → no operational shipment or launch checkout guarantee.

Package actual weight/dimensions/units và item restrictions do authorized staff/seller source xác nhận; product fabric GSM không substitute parcel weight. Không invent standard parcel numbers/warehouse/pickup/return address. Pickup registry actual, private and scoped; warehouse/location future không override D03 one-position launch. Delivery estimate là sourced range with observedAt/service conditions, không invented guarantee/date; unknown estimate hiển thị chưa xác định.

Carrier selection v1 một approved provider/service theo config, không nhiều adapters hoặc cheapest AI decision. Provider chưa chosen, manual verified shipping path chỉ khi owner approves separate runbook, evidence/source/grants, no implicit manual workaround. Carrier account/API credentials server-side, never GitHub/frontend. Actual carrier limit amounts/package/regions và cancel/label retry semantics trong capability register trước enable.

## 7. Shipment intent, events và recovery

Shipment intent unique order/action/version, immutable package/service/address snapshot, provider idempotency/correlation key, status CREATED→SUBMISSION_PENDING→ACCEPTED hoặc FAILED/REVIEW. Persist outbox fence trước call sau DB commit, no carrier call trong transaction. Timeout→REVIEW; query same external reference, không create another label/booking từ new retry key. Provider không idempotency/query guarantees thì adapter blocked until safe approved duplicate-prevention runbook.

Booking accepted không prove physical handoff. Handoff/delivery evidence cần authenticated provider event/query hoặc approved verified staff evidence; tracking URL/customer “đã nhận” signal riêng không tự authoritative. Validate provider/account/shipment/order refs, timestamp and status mapping; signature/auth channel, replay and inbox dedupe. Public tracking code không authorization private order, private carrier payload redacted. Out-of-order/duplicate event không regress delivered thành transit; conflicting correction linked incident/action, không erase prior events.

DeliveryAt là authoritative final successful delivery timestamp với evidence ref; out-of-order receivedAt không làm restart 15-day window. Date computation UTC instant +15×24h, future D06 boundary inclusive/exclusive và exceptional evidence corrections phải explicit trước activation; không tự claim owner đã chốt exact cutoff. Return window có thể hiển thị sau D06 accepted boundary config. Fraud/undelivered dispute không auto denied do webhook marked delivered. Failed delivery/lost/damaged paths trigger support exception and D06 resolution, không silent completed.

Notification at-least-once with event ID dedupe, bounded retries; only minimal buyer-safe message and authorized order link. Notification/cache/AI failure không rollback delivery/order/payment. No customer details/event raw payload to external models by default. Provider rate limits/circuit breaker/timeouts approved D10; stalled queue due index/backoff/escalation, không full-table scans hoặc indefinite unknown im lặng.

## 8. Cancellation, returns và inventory

Before handoff buyer request cancellation: lock order/version, fence carrier submission/handoff race, determine whether booking/no effect/final cancel evidence available. Pending carrier unknown → case REVIEW; don't cancel order while parcel might be shipping. Approved pre-handoff cancellation triggers D04 refund workflow, not automatic confirmed refund. Payment unknown giữ financial cap, no repeated refund. CancelAt independent RefundConfirmedAt; buyer UI explains waiting resolution.

D03 COMMITTED stock đã giảm sellable; không call reservation release sau order. Restock là idempotent D06 inventory movement từ actual pick/warehouse evidence, đúng SKU/location/quantity/condition. Unshipped cancellation có approved inspection/unpick evidence before restore; returns need received/quality evidence; lost/dispatched parcel không restock từ refund. Remaining refund/restock action independent, no rollback external shipping with SQL.

Return period baseline15days successfulDeliveryAt; Cootton pays fixed return shipping cost config, never buyer charge. Required D06: eligibility/exclusions/evidence/inspection, deadline boundary, processing promises, partial quantities/exchange/replacement, fixed-fee unit/amount and handling lost parcels. Original net paid refundable allocations per line/source, no higher price when remaining B2B qty drops tier/MOQ. Commission reversal only if original fee was actually posted; direct-sale self-fee absent means no fake commission refund.

## 9. Logical PostgreSQL design — chưa DDL

| Relation | Integrity / query boundaries |
|---|---|
| order | UUID, unique sourceAttemptId, buyer/Cootton seller refs, mode/status/version/timestamps; exactly one seller launch enforced by configured identity; buyer/status/createdAt/id and staff status/time indexes |
| order_line | UUID, order/SKU/offering refs, PIECE positive qty, immutable bounded accepted amounts/allocations; stable line identity for refunds and fulfillment; FK restricted deletes |
| order_contact_snapshot / address_book | private owner refs, validated bounded address/location version, snapshot/history; restricted read; no public projection PII |
| order_transition / cancellation_case | append-only action/evidence/version/time; unique business action; guarded state/quantity; due/status indexes |
| shipment / shipment_intent | unique initial outbound per order; external provider/account/ref unique when assigned; immutable package/service terms; submission fence and status/due index |
| shipment_event / shipping_cost_record | source/event unique, normalized fact/time/evidence; internal actual cost not buyer surcharge; order/provider/status lookup |
| serviceability_decision / pickup_location | actual registry/service/policy refs and expiry; no invented locality/warehouse or carrier facts |
| inbox/outbox/audit refs | same core idempotency/permission/privacy rules; not duplicate financial journal or shipping provider memory |

All proposed logical relations, no schema migrations. Financial source journals/holds D04 stay canonical; stock D03, refund D06; no new order balance authority. State changes/order audit/outbox/result one DB transaction with compatible D03/D04 global lock order; commands without financial effect still preserve order lock discipline. No SELECT-all catalog/ledger/shipments: pagination default20/max50 keyset with buyer/seller/grant predicates; staff dashboards bounded projection and staleness timestamp. Policy/snapshot JSONB typed/bounded, not arbitrary expressions. Financial retention and address data minimization approved D10 before purge; three version backups don't erase business records.

## 10. UX, authorization và execution gates

Buyer views distinguish saved cart/preview, payment unavailable, actual confirmed order, packing, carrier handoff, transit, delivered, cancellation/refund pending và exceptions. Before payment integrated no “đặt hàng thành công” for preview or real order IDs generated fake. Staff views only actual orders; empty states truthful. Internal cost/provider logs/address/fees/CP inactive state never publicly indexed; account/order pages no-store/noindex with backend authentication, no CDN private cache. HTTPS/opaque IDs không replace resource authorization; no personal data in slugs/query strings/order codes.

Future API specifications (not exposed): list/get owned orders, eligible cancellation request/status; scoped staff process/pack/shipment commands and incident views; trusted normalized shipment ingest. Transport core envelope, buyer-safe business reasons ORDER_NOT_READY, DELIVERY_NOT_READY, ADDRESS_INVALID, ORDER_VERSION_CONFLICT, ACTION_NOT_ALLOWED, SHIPMENT_REVIEW_REQUIRED, REFUND_PENDING. No false zero costs/success on timeout; unauthorized lookups don't leak others' existence/details. AI support can explain approved facts, never promise ETA/eligibility or change order on its own.

Gates before execution: explicit coding scope; actual seller/pickup/catalog/stock/prices/address registry; D08 verified identity/grants; selected shipping provider/serviceability/evidence/runbook; D06 eligibility/deadline/cost config; D10 privacy/retention/operations; approved payment/provider/financial posting templates for transactional order commands. Website read/cart/review sections may be implemented independently when assigned, while submit/holds/paid orders/shipping stays disabled. No unnecessary marketplace settlement requirement for public website launch, but real paid direct-sale needs real collection/refund accounting.

Future acceptance: wrong seller attempt denied; same attempt only one order; snapshots survive SKU edits; no fake order pre-payment; payment/stock/order atomicity with lost response; carrier send crash/query duplicate prevention; cancellation vs submission/handoff race; out-of-order/conflicting delivery facts; successfulDeliveryAt stable return anchor; partial return no tier/MOQ repricing; cancelled/refunded goods not auto restocked; shipping zero buyer despite actual fee; address ownership/change/serviceability; queue/notification/AI outage independent core. Planning acceptance requirements, not runtime evidence.

D05 design deliverable complete: direct-sale launch boundary, order/shipment identities and state/evidence contracts, website-before-payment behavior, addresses/serviceability, cost/recovery/cancellation and integration gates. Next D06 return/refund details and D08 access boundaries before corresponding implementation; no carrier/payment activation from this task.
