# D07 — Seller Cootton và báo cáo kinh doanh

Contract `D07.seller.reporting.v1`, thiết kế 2026-10-01. Dependencies CORE/D01–D06; D08 identity/permissions và D10 operations trước executable commands. Một seller Cootton trực tiếp, website trước payment, points inactive; marketplace onboarding/commission/payout cho seller độc lập deferred. Documentation/logical design only: không DDL, migrations, business API/jobs, actual staff/seller/cost records, banking/payment actions hoặc deploy. Giữ V001 duy nhất.

## 1. Seller identity và hồ sơ

Một seller UUID canonical đại diện Cootton trong launch; ownership product/SKU/offering/stock/order theo D01–D05, không hardcode human name thành FK. Launch identity registry actual phải approved trước provisioning, chưa seed UUID/profile/kho. Hộ kinh doanh Cootton là legal merchant dự kiến; legal name/registration/contact/tax/bank verification actual nguồn owner, không tự điền từ website đối thủ. Public seller profile allowlist brand/display/contact/policy đã approved; legal/bank docs private, không GitHub/source/client/customer URLs.

Seller lifecycle DRAFT→VERIFICATION_PENDING→ACTIVE hoặc CHANGES_REQUIRED; ACTIVE→RESTRICTED/PAUSED qua explicit granted command/reason/evidence/version. Identity VERIFIED không payment/provider readiness, không auto mở checkout. RESTRICTED xác định capability flags catalog edit/publish/new sale/fulfillment/support/report separately, không blanket account delete. Pause new sale không hủy orders/returns/financial obligations đã có; staff được phép xử lý existing obligations trong scoped grants. Reactivation authorized review với actual prerequisites, không time-based automatic toggle.

Seller portal seller.cootton.com dành nội bộ Cootton, không public seller registration/search/other-seller access. Host và frontend toggle không permission. Bank destination edit chỉ metadata verification request riêng, không immediate payout route hoặc provider account change; no payout function trong direct-sale launch. Merchant credentials giữ server secrets workflow, không seller profile editable API field. Owner quyết định legal/merchant status, AI không tự giả verified/compliance certificate.

## 2. Nhân sự và capability grants

Staff principal verified identity + explicit sellerId-scoped membership/grants (effective/revokedAt, action/source/reason/version); một person có nhiều capabilities khi được Admin cấp, không làm nhiều sellers. Capability groups conceptual: catalog management, pricing, inventory, fulfillment, customer case handling, business-report read, cost proposal/review, sensitive evidence read/export. D08 matrix/approval policies actual trước runtime; seller manager không inherit Admin/system/financial execute permission. Admin override audited explicit scope, không default wildcard từ title.

Grant changes expected version/idempotency/audit; revoke takes effect server authorization immediately, queued mutable actions recheck grants before execute. Không remove historical actor refs, no staff email public. New sale read/write checks active seller/membership and resource ownership, catalog moderation D01 and price D02 remain canonical. Financial refund D04/D06 permission distinct from support, inventory adjustment vs inspection distinct. AI_SUB_ADMIN read/report/propose theo grant; không auto grant self/credit points/transfer/verify physical stock or sensitive egress. Core/staff portal works without AI.

## 3. Portal workflow tối giản

Catalog/SKU manage approved standardized dictionaries D01; tiers/price/MOQ D02, no seller-defined unstructured form taxonomy. Inventory position D03 actual sellable/reserved/available & discrepancy cases, staff cannot type reserved/available or overwrite ledger history. Order board D05 one initial shipment, packing/handoff evidence; return board D06 quarantine/inspection/refund/disposition independent. Reports/cost evidence scoped in same backend, no duplicate price/stock/payable logic in seller UI.

Website-before-payment phase: allow design/build of profile/catalog/price/inventory screens when coding assigned; real mutations still prerequisites and scope. Order/capture/refund/settlement metrics NOT_ENABLED, không fake sample transactions/profit/paid orders. Empty actual initialized dataset khác unconfigured/unavailable: genuine 0 only after valid source query/coverage confirms zero. Catalog real state can exist independently of unready financial domain; dashboard reports per-card readiness, no full portal broken due payment off.

Staff task lists bounded, filters mode/status/age/SKU with canonical versions; counts from defined projection with asOf. Due targets workload/delivery provider actual D10, no invented processing promises. Buyer PII only minimum fulfillment/support grant, report aggregates default no identifiers. Product edit preserves order snapshot/refund prices; alert operational anomaly with evidence not autonomous financial fix.

## 4. Metric dictionary: facts và thời gian

Reporting definition version immutable: metricId/formula/unit/scope/timeBasis/source/eventKind/coverage. VND decimal integer strings, quantities integer PIECE, calculated negative net/delta use signed integer string in reporting-specific DTO (not mutation Money type). Ratios optional exact numerator/denominator + display rounding spec, no JS float finance; denominator0 → NOT_APPLICABLE, not Infinity/0 fabricated. Aggregation overflow controlled ERROR, no truncate. CP/VC/VCS not mixed VND totals; inactive not zero balance claims.

| Metric | Formula/source/time basis |
|---|---|
| Confirmed merchandise value | sum immutable order net D02 at D03 COMMITTED/D05 acceptedAt; not bank cash or statutory revenue |
| Gross order base / discount | original accepted line base and discount, sum base-discount=net; snapshot versions, no current catalog price |
| Confirmed collection | sum trusted D04 successful captures/collections, confirmedAt; excludes created intents/screenshots/unknown/CP deposits/inactive tenders |
| Confirmed refunds | D04 unique confirmed refund actions, confirmedAt, original allocations; excludes pending requests; chargebacks separate metric |
| Net payment movement | confirmed collections - confirmed refunds - separately verified chargeback debits; event-period facts, not earned revenue or cash in bank |
| Refund exposure | active reserved refund amounts states REQUESTED/SUBMISSION_PENDING/PENDING/REVIEW asOf; no double count status transitions |
| Delivered/returned/refunded units | respective D05 delivery facts/D06 accepted physical receipt and D04 confirmed refund-linked units; never imply equal quantities |
| Sellable/reserved/available units | D03 current position snapshot; reserved includes active review holds; stock quantity not inventory valuation |
| Verified operating cost | approved cost allocations eventBasis/type, source/ref/link; declared budget/quote vs accrued vs actual separately |
| Provider reconciliation | expected vs observed source refs and asOf coverage, unmatched/unknown totals; D04, not manually typed cash metric |

Time window `[from,to)` with local user selection Asia/Saigon converted to UTC boundaries once; asOf and source watermarks in response. Store instants UTC; document timezone display. Period refund for old order is refund-period movement, not retroactive change of old sales cohort. Cohort view separately original order acceptance dates includes cumulative subsequent outcomes through asOf; do not combine cohort sales with event-period refund into undefined “doanh thu”. One event counted once by source action ID/contract version.

Grouped metrics B2C/B2B/category/product/SKU using immutable original snapshot/classification refs; taxonomy changes no silent historical regroup. Live catalog inventory group separately current taxonomy with dictionary version. Order count unique orderId, not line count; refund count unique action/case distinctions; buyer count scoped distinct verified buyers excluding staff/test fixtures if actual classification approved (no fabricate labels). Definition missing → NOT_CONFIGURED; no analytics provider dependency to compute canonical sales.

## 5. Chi phí, giá vốn và margin

Cost proposals immutable source document/action, kind/product/order/shipment/case ref, amountVnd, allocation basis, incurredAt/recordedAt, source currency and evidence provenance. Vietnamese dong-only reporting v1, external currency not silently converted; FX/precision policy separate task. Admin/staff submit→review→approved/declined; corrections append reversal/replacement with reason/version; do not edit approved amount/order refund allocation. Actual invoice references private, no fake invoice/duplicate expenses. Approved cost capture journal template/economic basis before financial posting; report proposal not posted ledger.

Kinds: acquisition/manufacturing cost, outbound carrier, return carrier, payment provider fee, packaging, approved incident loss, other scoped operating expense. Actual quantities/facts needed, no assume material GSM×price = actual COGS. Cost dedupe unique source/vendor/document+line+action mapping under explicit review; duplicate receipt image doesn't create second expense. Budgets/estimated carrier rates/actual invoice/cash paid separate states; choose one approved economic cost basis per component for margin, don't subtract accrued plus actual plus paid triple.

COGS method (specific identification/FIFO/weighted average etc.) owner/accounting decision pending, no implement speculative stock valuation or claim zero COGS. Approved source lots/unit cost/production overhead allocation/refund cost reversal/non-sellable write-off criteria required before complete margin report. Returned item refund not COGS reversal until approved disposition/cost policy, no pretend returned damaged item becomes asset of same value. No restock increases cash.

Operational contribution analysis, explicitly not statutory profit: original merchandise net minus relevant refunds/chargeback adjustments, minus approved COGS treatment, carrier/return/provider/packaging and eligible direct cost allocations on same cohort/asOf. Sponsored discount/funding already in net or reimbursed under explicit accounting source, not counted twice. Exact formula version and attribution/time basis required; estimated costs labelled estimate. If any required component unknown → metric value null, state INCOMPLETE, expose known subtotal/components and missing counts, never label known subtotal profit. Complete contribution not after-tax/net profit; overhead/taxes/other obligations unknown not silently0. Actual statutory accounting/revenue/tax rules and accountant-approved chart remain separate readiness gate.

Direct-sale launch no marketplace 10% self-commission ledger/deduction/revenue; report this feature NOT_APPLICABLE, not 10% income. Future marketplace 10% D04 formula/history remains versioned deferred. No seller payable split/payout cash transfer/settlement cadence or VCS personal balance UI in launch. Payment settlement to merchant bank may later be reconciled with provider statement D04, not an app “seller payout” auto-action.

## 6. Report result và truy vết

Future report request metricDefinitionVersion/date bounds/timezone/mode/grouping/cursor, verified actor/seller scope canonical; no arbitrary SQL/executable formulas/user sellerId authority. Response metric value or null, currency/unit/status READY/INCOMPLETE/NOT_CONFIGURED/NOT_ENABLED/UNAVAILABLE/NOT_APPLICABLE, source coverage/asOf/refreshedAt, formulaVersion/filter basis/missingComponents and safe drilldown refs. Ready zero valid only complete canonical source. Unknown provider state displayed unresolved, not cash collected0 or assumed paid.

Report totals enforce same filter/version/asOf, sum grouped results reconciles headline with explicit UNCLASSIFIED bucket for absent historical dictionary fields. New partial classifications create data quality case, no dropping unclassified orders. Drilldown line/order/event references server authorized current grants, sanitized fields; no bank secrets/private identity in report. Staff cost-only access cannot enumerate buyer contact; aggregate role cannot retrieve financial evidence automatically.

Export deferred until D08 export grant and D10 retention/limits. If enabled: bounded job snapshot source/filter/version/asOf/actor, private object with expiring authorized access and audit; no public attachment or automatic email/model transmission. CSV formula injection guard/PII allowlist at implementation; concurrent grant revocation abort download/job authorization. No claim “Excel export ready” from this design.

## 7. Read models và scaling

Start PostgreSQL canonical event facts + indexed bounded aggregates; one reporting module/backend, no new warehouse/Kafka/microservice/tools without measured need. Immutable source action IDs with transactional outbox, at-least-once dedupe; incremental metric contributions per source/event/version, reversals/corrections as linked events not overwriting source business records. Report rebuild only derived projection with verified checkpoint/source coverage/runbook; never change wallet/order/stock to match dashboards.

Windowed/backfill jobs bounded keyset/watermark, restart persisted checkpoint/idempotency; no replay causing duplicate cost/refund totals. Late events affect defined event period using observed authoritative time with receivedAt metadata; report revisions append snapshot/revision markers, not silently alter exported report. Cached aggregates per seller/filter/definition/asOf, private no-store browser policy as appropriate; cache stale displayed refresh time, never price/payment authority. Critical cart/checkout no report recalculation/AI in transaction.

Cost/order/stock mutation discipline follows D03–D06 global lock order; report reads consistent DB snapshot/watermark and no outbound calls under DB locks. Resource-intensive report independent bounded concurrency/timeout/connection budget D10; no unbounded query monopolizes buyer checkout. Limits design interactive window≤366 days/page default20/max50, explicit timezone/bound validation; older custom history via approved bounded job not silent truncation. Exact response/latency/refresh/service budgets pending D10 before enable, no current scale benchmark claims.

## 8. Anomalies, AI và governance

Anomaly sources: missing costs/unmatched collections, refund review age, duplicate economic expense, snapshot/projected stock mismatch, negative/unknown contribution components, source ingestion gap, seller readiness inconsistent with payment feature. Rules/version/scope/threshold/source evidence explicit; thresholds actual Admin config not AI invented financial risk score. Incident OPEN→review/proposal→approved resolution+recheck; no delete/rewrite ledger/source or automated bank action.

AI summaries only canonical authorized bounded aggregate facts, source cutoff and missing components; models isolated, no cross-provider reads/default third-party customer data. Outbound model processing only approved grant/egress policy; otherwise deterministic report UI. AI cannot attest physical stock/profit/tax, set prices/permissions/verified seller based on conjecture. Daily reports/alerts require approved schedule/channel/permissions D10, not create automation or send external messages in this design. No notification policy hiding unresolved financial risk.

Historical policies/reports/seller grants retain references, no cascading deletion. Internal evidence retention/privacy/backup D10; three app versions not legal/accounting retention. Sensitive merchant account data only separate restricted backend vault/registry, never dashboard financial metadata on public site. Public SEO sees approved catalog facts only, not sales figures/buyer counts/private costs/seller bank verification.

## 9. Logical PostgreSQL design — chưa DDL

| Relation | Identity / invariants / workload |
|---|---|
| seller_profile / seller_transition | UUID canonical seller; approved public/private fields, capability state/version; immutable verified evidence and append-only transitions; one configured launch seller identity |
| seller_membership / scoped_grant refs | verified principal + seller/action scope, lifecycle/version/audit; D08 authority not parallel permission engine; no hardcoded email permission |
| operating_cost_proposal / cost_allocation | original evidence/action IDs, amount/type/basis/time/version, approval lifecycle, disjoint attribution; approved facts append-only; source dedupe/resource locks |
| cost_basis_policy_version | explicit owner-approved valuation/economic basis/overhead/disposition rules; no automatic method or fabricated prices |
| metric_definition / report_run | immutable typed formulas/filter/time/source registry, asOf/coverage/revision; no user SQL; bounded snapshot metadata |
| metric_contribution / aggregate_projection | unique(source action,metric,definitionVersion,group key), exact integer deltas, watermark/checkpoint; derived rebuildable not authority |
| reporting_incident / export_job refs | safe source refs, due/status indexes, approved grants/private export metadata; no bank/customer raw payload in AI memory |

Conceptual relation names, not authorized migrations. Query indexes source seller/occurredAt/actionId, order buyer/state/time per D05, cost seller/type/time/id and event projection key; no unnecessary join all raw payments/images. Integrity cross-row allocation/dedupe requires restricted writers + bounded atomic commands, not independent SQL CHECK aggregate claim. B2B quantities integer arithmetic not per-piece cost records explosion. Chart/templates statutory revenue/COGS not invented by relations.

## 10. Errors, gates và acceptance

Future handlers core envelope: SELLER_NOT_READY, CAPABILITY_NOT_GRANTED, PROFILE_VERSION_CONFLICT, COST_SOURCE_REQUIRED, COST_DUPLICATE_REVIEW, COST_BASIS_NOT_CONFIGURED, REPORT_INCOMPLETE, REPORT_RANGE_INVALID, SOURCE_UNAVAILABLE. No arbitrary bank/stack/private owner/customer details. Admin form required fields empty controlled invalid, optional absent explicit; merchant legal verification cannot default true. Future product/seller/actions proposed here no API routes implemented.

Execution gates: explicit coding assignment, actual seller identity/profile/staff grants D08, real catalog/inventory/prices from owner, D04/D05/D06 real transactional records for reports where enabled, approved cost basis/COGS and account templates for financial metrics, D10 reporting/retention/export budgets and incident ownership. Website catalog/report empty layout can be implemented independently when assigned; complete operational profit report cannot activate without actual facts. No banking onboarding required to build public catalog; no dummy payments to make dashboard populated.

Future acceptance: wrong principal/seller access denied despite host routing; revoked grant queued work/download denied; seller pause new sale preserves existing returns; inactive payments truthfully NOT_ENABLED vs actual0; order/cohort/event-period refunds coherent across timezone midnight; same event/backfill duplicates counted once; grouped sums include unclassified; 0 denominator/negative movement/overflow controlled; costs proposed/accrued/actual not triple counted; missing COGS returns null incomplete contribution; restock not cash revenue; no self-commission/payout; reports remain safe during late corrections/stale cache/AI down. These are targeted implementation criteria, not passed runtime evidence.

D07 deliverables complete design: canonical Cootton seller/staff capability boundaries, portal workflow, metric dictionary/time bases/cost provenance/contribution completeness, bounded read models and governance/logical relations. No source application changes or actual seller/report/job created. Next D08 Admin/RBAC/policy before implementing the website's private management flows.
