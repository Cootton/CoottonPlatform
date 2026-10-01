# D06 — Đổi trả, hoàn tiền và nhập lại tồn kho

Contract `D06.returns.v1`, thiết kế 2026-10-01. Dependencies CORE/D01–D05, D08 permissions/D10 operations. Single seller Cootton direct-sale; website trước payment; CP top-up/point tenders và marketplace inactive theo V001 §117. Scope chỉ contracts/logical design, không DDL/migrations/API/cases/refunds/restock/shipments thật hoặc deploy.

## 1. Owner baseline và decision register

Đã chốt: đổi trả 15 ngày từ confirmed successful delivery; VND refund về original payment method; future CP refund đúng original consumed units; VC/VCS inactive; partial refund original paid net không reprice retained items tier/MOQ; corresponding fee reversal capped original fee nếu actual charged; Cootton chịu fixed return transport cost do Admin cấu hình; pending/confirmed refunds không vượt original payment; unknown phải reconcile trước resend; late payment without order xử lý exception/refund verified. CP deposit refund riêng inactive. Direct-sale không tự tạo self-commission 10% hoặc refund fake fee.

| Decision | Status |
|---|---|
| 15-day exact cutoff | Owner chốt `[deliveredAt, deliveredAt + 15×24h]`, inclusive tại deadline, server persisted receivedAt quyết định; owner đã chốt |
| Change-of-mind clothing condition | Owner chốt chưa mặc/giặt, còn tem/phụ kiện, inspection có evidence; owner đã chốt |
| Wrong/defective/damaged item complaint | Owner chốt complaint workflow riêng, không auto-reject thiếu tem/quá hạn; owner đã chốt; không tự quyết quyền pháp lý |
| Processing/inspection/refund/carrier time promises | Actual approved policy + provider capabilities chưa có, không tự đặt SLA |
| Fixed return cost amount/unit và return pickup location | Actual Admin approved config chưa có, không tạo địa chỉ kho/phí giả |
| Exchange/new replacement pricing/stock/fulfillment terms | Chưa approved; v1 chỉ return/refund, exchange interface deferred và không silently substitute SKU |

Pending conditions chặn automatic eligibility/approval, không chặn ghi nhận complaint khi được implement/authorized sau này. Không tuyên bố 15 ngày loại bỏ mọi quyền khiếu nại hoặc theo luật; legal/compliance validation riêng trước công bố policy. Chưa runtime policy nên không hiển thị đề xuất như cam kết đã hoạt động.

## 2. Một case, ba tracks độc lập

Case ID opaque UUID, buyer/order/Cootton seller refs, type RETURN_REFUND / COMPLAINT / PRE_SHIPMENT_CANCELLATION / DELIVERY_FAILURE, lifecycle OPEN→UNDER_REVIEW→APPROVED/REJECTED/WITHDRAWN→RESOLUTION_IN_PROGRESS→RESOLVED theo allowed guarded transitions. REJECTED/WITHDRAWN terminal chỉ khi không pending financial/shipping/stock effects; completed case giữ lịch sử, escalation tạo linked review không overwrite old decision. Case terminal không là order deletion/payment flip. Complaint có thể kết thúc không refund nhưng cần reason/evidence và unresolved obligations bằng 0; no AI auto-denial.

Separate tracks: return transport NOT_REQUIRED/AWAITING_HANDOFF/IN_TRANSIT/RECEIVED/LOST/REVIEW; refund D04 REQUESTED/SUBMISSION_PENDING/PENDING/CONFIRMED/FAILED/REVIEW; disposition QUARANTINED/INSPECTED/RESTOCKED/NONSELLABLE/PENDING_DISPOSITION. Refund confirmed không return received hoặc restock; warehouse received không refund authorized; notification không proof. Buyer sees actual independent progress với safe reason, không một enum “đã hoàn tất” che refund pending.

Website-before-payment: no actual order → no active return command/fake return cases. Public policy/help và truthful empty support screens có thể build độc lập khi assigned. Não production order, refund, carrier hoặc CP port được stub always-success để demo như thật. Support inquiry không masquerade order return.

## 3. Request admission, quantities và deadline

Verified buyer gửi orderId, original lineId+PIECE quantity, reason code, bounded text/evidence refs, expected order/case versions và persisted idempotency key; no client refund amount/paid flag/stock delta/bank destination. Backend checks ownership before details, original delivered/captured quantities, canonical policy snapshot và prior claims. Duplicate line/empty/noninteger/zero quantity → INVALID_INPUT, không auto toàn đơn. Limit ≤100 original lines, one order/one seller case; no cross-order aggregation.

Admission lock order + per-line quantity entitlement before case allocation. For each original line: active claims + settled claims ≤ original eligible units; rejected/withdrawn unfulfilled claim releases its reservation only when verified no side effects. Consumed entitlement for successfully refunded/returned/disposed units cannot be reused. Unknown refund/return effects continue encumber units until authoritative resolution. Same principal/operation/key+fingerprint replay returns case; different payload CONFLICT. New key cannot bypass active qty caps; disjoint quantities may have multiple cases but sum bounded. Complaint evidence thread may be appended to existing disputed claim instead of consuming same units twice.

Owner-approved deadline: start confirmed D05 successfulDeliveryAt UTC, deadline start+15×24h; inclusive comparison admissionReceivedAt≤deadline. receivedAt is server durable admission timestamp in transaction, not client/device/email-createdAt or upload timestamp. Upload alone không submitted claim; buyer sees server ack/time, response lost retrieves same key/case. Eligible timely request preserves submission eligibility through later processing; no requirement inspection/physical return complete within 15-day window unless approved separately. Delayed callback does not restart deadline. Genuine wrong-delivery/evidence correction through audited review recalculates anchored window prospectively preserving timely accepted requests; no erase history or instant auto-denial.

Chưa successful delivery evidence → DELIVERY_UNCONFIRMED complaint review, không giả window; shipment loss/delivery failure là separate support case, không force “return delivered item”. Buyer disputed delivery được review, not blindly trust carrier success. Policy activation/version changes capture eligibility terms at order acceptance + case transition under approved temporal rule; no retroactive removal of accepted rights. Exact publishable eligibility matrix B2C/B2B/products/reasons/evidence must approve before automatic decisions.

## 4. Review, private evidence và authorization

Reason dictionary versioned, no arbitrary executable Admin expressions. Staff verifies source/photos/order/SKU/quantity/condition and records decision reason/evidence/policy/version. Photo absence or poor network is controlled incomplete evidence/request-more state, không crash/auto approval; alternative evidence acceptance needs approved rules, no blanket fabricated proof. Change-of-mind conditions and defect complaints separate; UI does not promise refund until approved. Partial approval specifies quantities/reasons per line; declined units release claim capacity only after no effects and retain decision history.

Evidence media private staging, bounded allowed types/sizes and pipeline D09/D10, malware/content-type validation, metadata strip and protected access; no public product CDN or third-party AI raw customer photos/order details. Actual limits/retention pending implementation contract. Buyer can read own case, Cootton staff minimum necessary scope, financial executor separate, carrier sees delivery fields only. AI CSKH read/explain/request missing facts/propose within grant, never invent physical inspection/approve transfer/restock/change policy or direct DB repair. Opaque IDs/short signed media access không replace server permissions; no PII in URL/log/analytics.

Decision, audit, case qty allocations, idempotency result and outbox one DB transaction. Permission/version mismatch → safe CONFLICT/FORBIDDEN; cannot staff approve same effect twice. D08 approval matrix actual before execution; do not invent fixed approver count, but financial execution is distinct from support read permission.

## 5. Return transport và received facts

Approved return creates one inbound shipment intent per transport action from case address/location snapshot, actual serviceability/parcel facts/provider capability. Cootton pays fixed return cost per approved unit/policy; actual carrier expense recorded separately, difference business cost not deducted buyer refund. Missing amount/unit/pickup location/provider → RETURN_SHIPPING_NOT_READY, không estimate giả/collect buyer fee. Cootton cost may be recorded accrued then actual under accounting policy; no claim configured fixed cost guarantees carrier tariff.

Same D05 outbox submission fence/query/idempotency avoids duplicate labels. Cancellation/retry before/after handoff needs authoritative carrier outcome; timeout REVIEW, no second booking/refund or charge for unknown. Delivery to warehouse event is transport proof, not SKU/condition inspection. Warehouse receiving command uses physical count, timestamp, case/parcel/SKU refs/evidence; expected and received/damaged/missing/extra quantities separate. Overages/unknown SKU quarantine incident, not automatic stock increase/refund. Lost return parcel invokes approved incident/compensation decision, not force customer no-return/no-refund or restock missing goods.

Verified staff carrier-independent workflow chỉ khi explicitly approved runbook/grants/evidence; no implicit manual success checkbox. Carrier notification/raw payload not permission. Pickup/return destination private configuration actual not owner contact assumed warehouse. Transitions/out-of-order events append facts, conflicts linked review; record receivedAt and observedAt separately.

## 6. Exact financial allocation và refund caps

Original order net after discounts and D04 tender allocation are only refund monetary basis. For original line quantity Q and net N integer VND: allocate per-unit entitlement deterministic ordinal 1..Q, unit value floor(N/Q) plus one VND for first N mod Q ordinals. Không store Q rows, use interval/range arithmetic; partial approved qty claims reserve unique unclaimed ordinal ranges under line lock. Sum all unit entitlements=N, so multiple partials/full return conserve amount; no float/fresh price/tier/MOQ conversion. Amount proposal from approved returned ordinals; inspection qty change maps exact claimed ranges, never random recompute. This technical allocation must match order financial allocation contract before executable template; non-quantity refunds/lump compensation separate approved action, capped remaining capture and explicitly mapped.

Example technical only: Q=3,N=100 → unit entitlements34/33/33; three one-unit refunds total100, not floor(100/3) each losing one. Commission (future if actually charged) allocation uses original fee total/line and deterministic unit ordinal distribution; each reversal≤original remaining fee, sum full fee reversals=original fee. Direct-sale original fee absent means zero fee action, no fake 10% compensation. Funding restoration/coupon reinstatement do not change buyer refund or automatically issue new benefit; actual policy pending inactive points.

Refund commitment caps per capture/source/order line + total capture: confirmed + active REQUESTED/SUBMISSION_PENDING/PENDING/REVIEW ≤ original approved refundable consumption minus prior other monetary resolutions. Failed final no-effect releases only money reservation, not allows duplicate benefit if claim still settling; case tracks authoritative attempt and permitted retry same action. Partial requests across cases and late-money exceptions share D04 payment reference cap so one capture never refunded twice. No double count same pending action twice in aggregate. approvedQty and amount frozen snapshot; decreasing after external submission not silently change amount.

VND refund destination original payment reference through approved adapter, no client arbitrary account. Impossible original-method return is exception requiring separately approved alternative destination verification/consent/runbook, no default cash/CP. D04 submission fence and provider key persist before external call; timeout REVIEW/query same reference, no success from request accepted/status HTTP200. Trusted final success posts compensating journal exactly once; irreversible external money effects reconciliation, not SQL rollback. Processing times, gateway fees and constraints pending provider; no invented promise. CP/VC/VCS launch inactive; future CP original units/formula holds, expired-lot protections and other asset policies required before enable. No auto reopen CP from return feature.

## 7. Physical disposition và restock

Return stock starts private quarantine physical receipt record, không onHandSellable. Inspection approved rubric actual: SKU/size/color identity, counted PIECE qty, condition/evidence, location custody and sellable classification; UNINSPECTED/DAMAGED/UNKNOWN cannot restock. Non-sellable may need rework/disposal separate approved action, never fake sold-stock reconciliation. Photograph/AI classification alone không confirmed physical count. Refund before receipt, compensation for loss or goodwill refund doesn't make returned units exist.

Restock command idempotency/actionRef + expected stock/case/receipt versions + verified disposition; qty≤verified received eligible qty - previous restocks/dispositions/reservations. Original stock_position seller/SKU/location references revalidated D03; no arbitrary new warehouse or SKU substitution. Approved restock updates onHandSellable += q (reserved unchanged), append RESTOCK movement before/after/order/case/receipt/evidence refs, disposition consumption/audit/outbox/result atomically; existing reserved≤onHand invariant holds. Unique action and original receipt ordinal/range entitlement prevents two commands/new keys restocking same units. No stock_reservation RELEASE after D03 commit.

Unshipped cancellation uses actual unpick/unused custody evidence for original committed units, not return shipment expected qty. If goods never left stock custody, one verified restock path, no duplicate unpick+return restock. Wrong item delivered returns actual SKU quarantine; no restock ordered SKU unless physical identity proven; replacement resolution separate. Stock adjustment/discrepancy with missing goods is D03 incident command, no negative fake restock. Refund completion doesn't require restock success; restock failure incident retains inventory facts and queues retry, no second refund.

## 8. Transactions, events và bounded recovery

Global lock compatible D03/D04: idempotency admission → buyer/attempt if involved → order then case/claim parent locks by UUID → financial resources by declared kind/UUID → stock positions UUID. Existing D03 commit creates new order after financial/stock locks, so does not acquire an existing contested order lock in reverse. Any command needing existing order must acquire it before finances; no other writer holds money/stock then locks existing order. Refund/posting/inspection/admin reconciliation conform; resource discovery restart if earlier locks required. No HTTP/AI/user wait within DB transaction; bounded same-key deadlock/serialization retry.

Durable versioned events minimal IDs/action/state/order/case refs, at-least-once inbox dedupe/source refs; external calls after outbox commit. No customer evidence/AI memory as event default. Notification/cache failure no rollback refund/stock. Reconcile case vs qty claims, D04 refund caps/provider evidence, received/inspection/disposition vs D03 stock movements with bounded indexed cursor/batches. Pending unknown beyond approved nextActionAt/escalation creates alert/incident, no release financial hold or close case falsely. Actual deadlines/retries/runbook D10 before worker enable; no indefinite unowned pending queue.

RESOLVED only when every approved line obligation done or explicitly evidence-resolved, no pending/unknown refund/transport actions, disposition accounted and reconciliation passed; NONSELLABLE can resolve without saleable stock, refund success+stock incident cannot be hidden resolved. Retry same action after server crash/read result loss returns persisted result. Correction append-only, no deletion/reset journal/case to make metrics green; AI propose only. Financial/claim action dedupe retention not15-day window; historical refund keys need D04/D10 rules.

## 9. Logical PostgreSQL relations — không migrations

| Relation | Canonical facts / constraints / queries |
|---|---|
| return_policy_version | immutable reason/mode/condition/deadline/source terms, approved lifecycle and activation gates; no retroactive overwrite |
| return_case / case_transition | UUID, buyer/order/seller/version/type/status, delivery anchor/policy snapshots, evidence decisions; owner/time/id and status/nextActionAt/id indexes |
| return_claim / claim_range | original line/ordinal ranges, active/consumed qty reservations, decisions/version; serialize under original line lock, disjoint ranges and total qty caps |
| return_transport_ref | actual D05 shipment intent/event references, case correlation; no duplicate carrier authority or generated warehouse |
| return_receipt / inspection / disposition | actual SKU/location/qty/custody/evidence, immutable observations, approved classification, remaining restock/disposition caps |
| refund_resolution_ref | approved original allocation/cap/action refs into D04, status projection only; no second financial ledger/balance authority |
| restock_action_ref | unique action and consumed receipt entitlements, D03 movement ref, guarded state; exact qty conservation |
| case_evidence / incident / outbox / audit | private allowlisted facts, stable refs, versioned transitions, due indexes; no raw customer media to public/model |

Logical design only. Cross-row interval overlap/qty/refund/stock caps need locked transaction and restricted writers; not pretend independent CHECK guarantees aggregate. Range arithmetic/relational indexed facts keep large B2B qty bounded, no loop one record per piece. Order/ledger snapshots preserved, case lists keyset default20/max50 verified owner/grant, no unbounded orders/refunds dumps. Dashboard derived projection with freshness; source financial D04/stock D03. Three recent app backup versions not business retention; approved privacy/accounting/incident evidence retention and verified restore D10 before purge/recovery.

## 10. Website UX, errors, gates và acceptance

Buyer help: 15-day anchor and actual approved conditions, eligible original lines/qty, sourced calculated refund, Cootton return cost, evidence request/inspection/transport/refund status. No active refund buttons without actual order+policy+payment integration; show truthful unavailable/empty states. Not label review as rejection or completed refund. Private URLs IDs only, auth/no-store/noindex, no balance/contact/photos in query strings. Staff inspection/refund permissions separate; no AI tool self-approval or production raw SQL.

Future errors to core envelope: RETURN_POLICY_NOT_READY, RETURN_WINDOW_REVIEW, RETURN_QUANTITY_CONFLICT, EVIDENCE_REQUIRED, RETURN_SHIPPING_NOT_READY, REFUND_NOT_READY, REFUND_REVIEW_REQUIRED, INVENTORY_DISPOSITION_REQUIRED, CASE_VERSION_CONFLICT, INVALID_INPUT/UNAVAILABLE. Missing values never zero fee/success/free money; unauthorized lookups no cross-customer details. Unknown does not mean failed; app refresh retrieves case not another refund action.

Execution gates: owner condition/cutoff decisions đã chốt mục 1; real policy limits/evidence procedures/cost amount+unit/return destination; D05 carrier and custody evidence capabilities; D04 real provider/refund finality/accounting templates/caps; D08 grants; D10 retention/deadlines/recovery; explicit implementation task. Exchange replacement/compensation/alternative refund destinations require additional approved terms, not implicit scope. Website help independent implementation permitted when assigned; actual refunds/restock remain disabled until corresponding gates met.

Future acceptance: deadline equality/timezone/client clock/late callback; same-key replay/different payload; two cases same unit/capture caps; quantity large without per-unit explosion; 100/3 partial monetary conservation; partial rejected inspection mapping; screenshot vs real physical receipt; wrong SKU/overage/missing/lost parcel; refund unknown/late success/crash/duplicate event; original-method unavailable; cancelled unpicked units vs received return double-restock; damaged/non-sellable not available stock; no tier/MOQ repricing; inactive points not reenabled; notification/AI outage independent. Required targeted implementation verification, not runtime evidence from this document.

D06 design complete with explicit pending decisions; no legal compliance certification, actual monetary operations, carrier/stock changes or executable schema. Next access/policy/website planning per owner assignment; no automatic production execution.
