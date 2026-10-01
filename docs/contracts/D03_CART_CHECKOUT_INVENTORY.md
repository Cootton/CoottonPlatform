# D03 — Giỏ hàng, checkout và giữ tồn kho

Contract `D03.checkout.v1`, owner assignment 2026-10-01. Dependencies: D01.catalog.v1, D02.pricing.v1, D04 financial contracts trước thực thi. Đây là specification và logical PostgreSQL design, không runtime, migration, reservation/payment worker, ledger write hay deployment. V001 duy nhất. Không schema/data/credentials thật được tạo bởi tài liệu này.

## 1. Phạm vi tối thiểu và quyền

Core độc lập AI. Backend giữ một nguồn catalog/price/inventory/checkout cho Web và apps. Giỏ không giữ stock, price, points hoặc quota. Checkout v1 có một salesMode B2C hoặc B2B trên mỗi attempt, có thể nhiều seller; buyer chọn lines/mode rõ ràng. Giỏ có thể chứa cả hai modes, nhưng request checkout mixed-mode bị INVALID_INPUT, không tự chuyển mode hay bỏ lines. Cùng SKU ở hai offerings/modes vẫn cùng tồn D01; chỉ những lines được chọn tham gia attempt. B2B MOQ PIECE tổng phần đơn từng seller, không dùng B2C hoặc seller khác để đạt minimum.

Persistent cart và checkout phải có verified buyer principal. Guest có thể giữ cart tại client và xem public price preview nhưng không tạo order/holds; khi login buyer chủ động chọn nhập giỏ guest. Không tự gộp/overwrite quantities hoặc nhận client price/stock. Seller/Admin đọc tài nguyên theo grant, không xem private cart buyer mặc định. AI không có quyền reserve/pay/confirm từ quyền CSKH hoặc catalog read.

Checkout all-or-nothing cho tập lines đã chọn: không đủ một nguồn bất kỳ thì không giữ phần còn lại và không tạo một phần đơn ngầm. Parent order có seller suborders, nhưng payment/refund/fulfillment statuses là contracts riêng D04/D05/D06. Partial seller fulfillment sau order không thay atomicity của checkout. Không tự mở mixed tender, COD, credit, guest checkout hoặc partial capture.

## 2. Cart aggregate và commands

Một active cart mỗi buyer; cartId UUID ổn định, version bigint positive serialized decimal string. Cart lines unique(cartId,offeringId), có lineId UUID, offeringId, quantity PIECE decimal integer string theo D02, addedAt/updatedAt; SKU/seller/mode suy canonical. Không lưu giá như authority. Display snapshots nếu có phải có observedAt và nhãn có thể thay đổi.

Future /v1 specification, chưa expose: get cart, set line quantity, remove line, clear selected lines, create preview, start checkout, get checkout status. Set quantity là absolute quantity, không increment mơ hồ: duplicate replay không cộng lần hai. Quantity=0 không là remove; dùng remove explicit, không silently nâng lên MOQ. Payload unknown fields/empty/null quantity bị INVALID_INPUT. D02 bounds tối đa 100 offerings/20 sellers; không load cart vượt giới hạn hoặc auto truncate.

Mutations có expectedCartVersion, persisted idempotency key (principal + operation + key), request fingerprint và safe result. Version conflict → CONFLICT, client tải lại và buyer quyết định; không last-write-wins giữa devices. Remove/clear atomic theo expected version. Guest import là explicit proposal, resolve trùng offering bằng buyer chọn quantity cuối, rồi một accepted command; không dùng giá client. Không fake tombstones/order history từ cart sync.

Active cart editable trong khi attempt đang pending, nhưng accepted checkout snapshot không đổi. Thay giỏ không sửa attempt, hold, price hoặc debit. Không cho active attempts có selected line identity giao nhau; lock buyer checkout admission để serialize concurrent starts. Retry cùng idempotency key trả attempt cũ; key mới chồng lines trả CHECKOUT_ALREADY_ACTIVE. V1 không mở nhiều attempt song song cho cùng buyer (một nonterminal attempt/buyer); giữ đơn giản và tránh accidental double-buy. Buyer vẫn được explicit mua lại sau attempt terminal theo command mới.

## 3. Một pipeline checkout

1. Buyer chọn lines một mode và verified contact/address reference của mình. Address validity/serviceability theo D05, không suy địa chỉ từ URL hoặc seller profile. Contact snapshot private chỉ lấy sau scope validation; chưa D05 contract thì gate affected checkout.
2. Backend tạo D02 preview từ canonical offering/quantity. Buyer thấy exact quoteId, totals/terms/selected tender và confirmed consent. UNSPECIFIED hoặc tender chưa ready không được bắt đầu holds; không tự chọn CASH/CP/VC.
3. `start checkout` nhận cartVersion, selected line IDs, acceptedQuoteId, tender selection, address reference và idempotency key; không nhận amount/price/paid flag. Server checks ownership/input fingerprint/quote versions/expiry/eligibility; nếu giá/discount/terms đổi → QUOTE_STALE kèm quote mới, không reserve hoặc silent consent.
4. Bounded DB transaction tạo immutable attempt snapshot và holds stock, D04 financial assets/funding/quota cùng audit/idempotency/outbox. Lock và revalidate mọi nguồn; thiếu một nguồn rollback toàn bộ. Không outbound network/model/provider call trong DB transaction.
5. Chỉ sau commit, adapter được duyệt xử lý external payment intent khi cần. Intent/callback gắn attempt ID và unique external payment reference; provider idempotency contract phải có trước gọi. CP/VC internal confirmation dùng D04 transaction, không fake external callback.
6. Authoritative payment evidence được validate/correlate/consume idempotently. Cùng một transaction commit stock reservations, financial holds/debits/quota/funding theo D04, parent order + seller suborders + line snapshots, audit/outbox và attempt result. Khi chưa đủ D04/D05 executable contract, không triển khai bước này.
7. Sau commit, notify/clear cart có condition và projections asynchronously; failure notification/cache không rollback order. Buyer đọc status bằng authorized backend; response bị mất thì retry/status lookup, không tạo checkout mới từ timeout.

Accepted quote snapshot chỉ trở thành locked attempt price khi bước 4 commit. D02 preview TTL không giữ giá; sau lock không tự reprice hold vì quote preview cũ hết hạn. Attempt vẫn phải đáp ứng hold deadline và canonical permission/revocation checks theo explicit rules. Admin emergency fraud/safety revocation chặn commit theo authorized policy, không tự sửa giá đã accepted; funding/late-payment resolution theo D04. Order snapshots immutable sau commit.

## 4. Inventory và reservation invariants

V1 một inventory stock position mặc định per seller/SKU, chưa multi-warehouse allocation/partial picking. Location identity do seller/inventory registry quản lý, không tự seed warehouse thật. Future location extension theo version contract, không phân hàng ngẫu nhiên. On-hand ở đây là **sellable units chưa được commit bán**, không bằng chứng đếm vật lý tại kho.

stock_position: skuId/locationId unique, seller ownership canonical, onHandSellable ≥0, reserved ≥0, reserved≤onHandSellable, version. Available = onHandSellable - reserved. Buyer thấy available indication không promise hold. Một attempt aggregated SKU demand, một reservation line per attempt/position; không duplicate stock theo sales mode.

Reserve qty q: locked row/conditional atomic update chỉ khi available≥q, reserved+=q và persist matching ACTIVE reservation trong cùng transaction. Commit q: ACTIVE→COMMITTED, reserved-=q, onHandSellable-=q, append stock movement liên kết order. Release q: ACTIVE→RELEASED/EXPIRED, reserved-=q, onHandSellable unchanged. Mỗi transition chỉ một lần bằng guarded status/version; counters không negative. Không apply stock delta lần hai khi retry/event duplicated.

Sellable stock update seller là scoped audited command với expected version, reason/source, chỉ khi onHandSellable mới ≥reserved. Seller không set available/reserved trực tiếp hoặc đè hold của buyer. Điều chỉnh vật lý/discrepancy khác cần inventory incident workflow, không AI sửa SQL trực tiếp. Refund/cancel order đã COMMITTED không gọi hold release để tăng stock; restock là D06 command riêng có evidence/idempotency và không tự coi mọi hàng trả đã bán lại được.

Reserved counter phải bằng sum ACTIVE held quantity của stock position, kể cả hold đang cần payment review; expireAt đã qua không tự làm ACTIVE disappear khỏi sum. Scheduled reconcile kiểm tra counter/movement/hold/order refs, báo incident và ngừng mutation bị ảnh hưởng; không tự xóa holds hoặc đặt stock=0 để “sửa”. Bounded due-hold index/batches, không scan full inventory/table.

## 5. Deadlines, state machine và payment uncertainty

Technical design: stock/financial hold deadline mặc định 10 phút từ server transaction start, future approved config 1–30 phút; chưa config runtime. Effective attempt deadline là minimum của requested hold TTL, asset/campaign/provider validity deadlines và D04 permitted limits; không giữ một nguồn ngắn hơn các nguồn khác rồi pretend đủ. No sliding renewal từ polling/retry/app mở. Countdown chỉ UI; PostgreSQL UTC clock quyết định. D04 phải duyệt expiry/unknown/late-payment rules trước activation.

Attempt states: RESERVED → PAYMENT_PENDING (external submission) hoặc COMMITTED (internal atomic D04 success). RESERVED có thể CANCELLED/EXPIRED trước financial effect và confirmed no payment in-flight. PAYMENT_PENDING → COMMITTED / FAILED / PAYMENT_REVIEW theo authoritative evidence. PAYMENT_REVIEW → COMMITTED hoặc FAILED chỉ qua authorized reconciliation với valid holds/deadline/evidence/D04 rule; không enum flip từ UI. Terminal COMMITTED/FAILED/CANCELLED/EXPIRED immutable. Reconciliation records append-only, không rewrite terminal state để che late capture.

RESERVED expiry worker chỉ release khi đã xác minh không submission/in-flight/effect; lock attempt rồi tài nguyên, race-safe với payment submission/commit. PAYMENT_PENDING timeout, network error hoặc ambiguous provider result chuyển PAYMENT_REVIEW; không coi unpaid/failed và không release financial/stock holds tự động. PAYMENT_REVIEW qua deadline giữ counters cho tới có final evidence/D04 resolution; monitoring escalates có thời hạn xử lý do D04/D10 chốt. Tránh hold vô hạn im lặng: adapter chưa có bounded reconciliation/cancellation policy thì không enable external payment. Tài liệu không tự đặt thời hạn ngân hàng hoặc tự refund.

Payment submission transition/fence và outbox intent phải persist trước outbound call. Cancel và submit serialize theo attempt row: sau submission fence không cancel/release như chưa gửi; chỉ provider cancellation/reconciliation contract. Worker crash sau send trước response không tạo intent mới; query/replay bằng provider idempotency reference. Provider timeout không paid flag.

Authoritative late payment sau attempt terminal/hold expired: inbox lưu correlated evidence, tạo payment exception/liability theo D04, alert Admin, không tạo paid order thiếu stock, không resurrect/reserve lại tự động và không thu thêm tiền. Refund/void hoặc giải quyết được phép cần D04 exact command/approval. Callback phải kiểm tra chữ ký/issuer, currency, amount, attempt/merchant identity và unique reference; screenshot/client redirect/CSKH/AI không là payment proof.

Race expiry vs valid commit phải có một winner dưới attempt/resource locks và server deadline check; tại now≥deadline không commit theo normal hold path. Nếu financial effect đã xảy ra, chuyển exception/reconcile thay vì tự rollback external money. COMMITTED order reply mất mạng → same persisted result; duplicate trusted event → no debit/order/stock effect thứ hai. Evidence mâu thuẫn cùng reference → incident, không overwrite inbox facts.

## 6. Transaction/idempotency boundaries

Trong một PostgreSQL transaction: acquire idempotency admission + buyer attempt lock; lock attempt; lock D04 wallets/funding/campaign/quota theo stable resource-kind/UUID order; lock stock positions sorted UUID; validate policy/version/status and guarded deadlines; apply aggregate writes; audit/outbox/result; commit. Tất cả writers/expiry/financial/stock adjustment dùng cùng declared global lock order; D04 phải tương thích, không tự nối two DB transactions thành atomic. Retry deadlock/serialization bounded, cùng logical idempotency command; no outbound call trong retried closure.

Request fingerprint includes normalized principal, command/version, line IDs+quantities, selected mode, quote version/fingerprint, tender/address refs. Key cùng payload trả safe recorded result; key khác payload CONFLICT; concurrent replay waits/returns in-progress handle, không process second writer. PII values không nằm trong public fingerprint/log; private hash canonicalization và retention khóa trước executable adapter. Timeout API không xóa idempotency record. Không tự purge financial effect keys theo hold TTL; D04/D10 retention before implementation.

External calls không thể rollback bằng SQL. Outbox/inbox + reconciliation/saga handle uncertainty; không tuyên bố distributed ACID hoặc exactly-once network. At-least-once event delivery, dedupe unique source/event reference và attempt action version. Notifications/SEO/AI outside critical transaction.

Cart cleanup sau COMMITTED là conditional post-commit action: chỉ xóa selected lines nếu current line versions/quantity vẫn match accepted snapshot; buyer edits/new quantity giữ nguyên và UI báo còn items. Không toàn bộ clear cart sau một partial selection, không subtract để gây silent remaining quantity. Order success không phụ thuộc cleanup thành công; retries cleanup idempotent.

## 7. Logical PostgreSQL design, chưa DDL

| Relation | Fields/identity | Integrity/query boundaries |
|---|---|---|
| cart | UUID, buyerId, state ACTIVE/ARCHIVED, version bigint, timestamps | one active/buyer via partial uniqueness; owner scoped |
| cart_line | UUID, cartId, offeringId, quantity integer, version bigint | unique(cartId,offeringId); qty D02 bounds; stable FK; limit counts validated under cart lock |
| stock_position | UUID, SKU/location/seller refs, onHandSellable/reserved bigint, version bigint | unique(SKU,location); CHECK nonnegative/reserved≤onHand; indexed seller/SKU |
| checkout_attempt | UUID, buyerId, mode, state, version, quote/cart refs, private immutable snapshot, deadline, orderId nullable | one nonterminal/buyer; unique accepted command result; state/deadline index; valid state-order correlation |
| stock_reservation | UUID, attemptId, positionId, qty bigint, state, deadline, version | unique(attemptId,positionId); positive qty; terminal transition guards; position/state and state/deadline indexes |
| stock_movement | UUID, positionId, kind RESERVE/RELEASE/COMMIT/ADJUST/RESTOCK, qty/delta, actionRef, before/after/version | unique business action reference; append-only; exact counter equation; no direct buyer writes |
| checkout_idempotency | principal+operation+key, fingerprint, in-progress/result ref, timestamps | unique compound key; private safe results; no secrets/PII body in public logs |
| payment_inbox/outbox/audit | immutable event ID/source/ref/attempt correlation, safe payload, sequence/timestamps | depend on core/D04 storage; dedupe; least privilege; no arbitrary AI/provider-memory fields |

Financial holds/orders/ledgers are **D04/D05 relations**, not fabricated executable tables or JSON balances in checkout_attempt. SQL restrictive references/no cascade destruction for orders/stock/audit. Snapshot JSONB bounded D02 lines/20 sellers, explicit schema/allowlists, source policies remain relational. Time indexes for expiry batches; SKIP LOCKED workers bounded batch/fair retries after implementation. Listing keyset default20/max50 with owner predicates, no all-table dump.

## 8. D04 required contracts — execution gate

| Required D04 output | D03 consequence if missing |
|---|---|
| Asset precision/conversion: CP remainder, VC batch rate/source/expiry, VCS actual economic backing | affected tender/funding unavailable; no invented rounding/mixed tender |
| Wallet available/held/debit/release accounting, unique hold/action refs, nonnegative invariants | cannot reserve financial source or commit order |
| Coupon quota/campaign budget and VCS/Cootton funding reservation/commit/release exact allocation | no promised discount beyond backed capacity |
| Same PostgreSQL atomic reserve/commit/release financial port; compatible global lock ordering | no split-brain stock+money transactions |
| Trusted payment integration, account/currency/amount correlation, idempotency, signature verification | no external payment submission or paid confirmation |
| Failure/cancellation/expiry/unknown/late-capture compensation and bounded reconciliation; partial-refund mapping | external payment feature stays disabled |
| Fee basis/rounding, seller liability/settlement and immutable original allocations | no production settlement or financial “profit” claims |
| Audit/ledger retention, runtime permissions and approved operational config | no migration/service enablement with owner DB credential |

Conceptual financial port methods `reserve`, `commit`, `release`, `recordExternalEvidence`, `reconcile` must take attempt/action refs, expected version and exact typed asset allocations; internal methods accept same transaction context, not HTTP calls pretending atomicity. They cannot be stubbed as always-success for launch. D04 contracts reviewed first; D03 design review may complete independently, executable checkout may not.

## 9. Error/UX and acceptance

Core envelope mapping future handler; business reason allowlist: CART_VERSION_CONFLICT, CART_EMPTY, CHECKOUT_ALREADY_ACTIVE, MIXED_MODE_NOT_SUPPORTED, QUOTE_STALE, MINIMUM_NOT_MET, OFFER_UNAVAILABLE, STOCK_INSUFFICIENT, TENDER_NOT_READY, ADDRESS_NOT_READY, HOLD_EXPIRED, PAYMENT_REVIEW_REQUIRED, UNAVAILABLE. Missing/invalid quantity → INVALID_INPUT, never default MOQ. Buyer-safe copy gives SKU quantity shortage and seller minimum shortfall without private balances/other carts. Server exception is generic, no DB URL/stack/PII.

UI distinguishes cart, preview, held deadline, payment pending/unknown, confirmed order and exception. Poll GET status bounded/backoff, no holding extension or mutation; unknown means “đang xác minh”, not retry pay automatically. App restart retrieves active attempt; only new explicit checkout after prior terminal. Private URLs use opaque ID plus backend authorization, never phone/email/address/point balances. All private cart/quote/order responses no-store; third-party analytics/model no raw payloads.

Required future scenario verification before execution: two buyers competing last units (only one reserves); all-or-nothing multiseller failure; same command replay/different payload conflict; same buyer two devices; expiry/submit/commit race; process crash before/after provider call/DB commit; duplicate/out-of-order callback; late payment without stock; coupon/points concurrent exhaustion; stock adjustment below reserved denied; cart edited after accepted snapshot; notification failure after commit; no AI available. These are acceptance requirements, not evidence tests or runtime already passed.

D03 deliverables complete at design level: cart/stock/attempt ownership and bounded DTOs, single checkout flow, states/deadlines, atomicity/idempotency, logical schema, recovery/UX matrix and D04 gates. Next D04 before implementation. Real inventory rows, holds, orders, financial ledger, API handlers, workers and migrations remain uncreated.
