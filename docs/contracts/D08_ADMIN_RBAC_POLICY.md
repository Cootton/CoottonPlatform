# D08 — Admin, phân quyền và quản lý chính sách

Contract `D08.access.policy.v1`, 2026-10-01. Dependencies CORE/D01–D07, D10 secret/session/audit/recovery operations. Một seller Cootton, website trước thanh toán, CP top-up/point tenders và marketplace inactive. Documentation/logical design only: không tạo accounts/grants, Firebase claims, secrets, policies runtime, migrations, API hoặc deployment. Giữ V001 tại chỗ.

## 1. Identity và hierarchy

ADMIN là chủ quản trị duy nhất ở cấp cao nhất, human owner principal được xác minh và bootstrap rõ; AI_SUB_ADMIN trực thuộc ADMIN, không ngang hàng/không tự nâng quyền. Seller staff là human capability memberships của Cootton, không thêm seller hoặc quyền hệ thống. BUYER chỉ own resources; runtime service và AI service identities riêng, không impersonate human Admin. Role là nhóm capability, không phép bỏ qua resource/policy/state checks.

Firebase Auth cung cấp external subject; backend map (issuer/project,subject) tới opaque principal UUID sau server token verification (signature/issuer/audience/expiry và revocation theo session policy). Email đã supplied private chỉ bootstrap contact hint, không authorization bằng email match, frontend field hoặc tự claim ADMIN. Actual verified subject/project và owner proof chưa provisioning từ document. Disabled/deleted user không auto map tới principal cũ theo email tái sử dụng. Provider changes need explicit audited identity linking with verified ownership, không cross-provider AI memory linking.

Web buyer/seller/admin và Android/iOS shared authorization engine/backend; host routing/hidden menu/UUID không security boundary. Identity alone chưa permission, permission alone chưa payment readiness; feature flags không grants. Public catalog chỉ published-safe read, không authenticated private cache trên CDN. AI disabled core/human Admin tiếp tục hoạt động.

## 2. Authorization decision duy nhất

Command/read decision: verify identity/session → active principal/service → exact action capability → active grant/expiry/scope → seller membership hoặc buyer ownership → resource state/version → approved domain policy/feature readiness → validate input/evidence/idempotency → atomic action/audit/outbox. Deny by default unknown action/resource/scope; no client-supplied roles/buyerId/sellerId as authority. List queries push scope predicates into DB before pagination/count, not fetch-all then hide unauthorized records.

Grant fields conceptual: UUID, subject principal, action set allowlist, scope kind SELF_BUYER/COOTTON_SELLER/RESOURCE_SET/PLATFORM_OPERATION, canonical scope IDs, validFrom/validUntil, status/version, constraints/limits, issuer/approval refs. Null scope không wildcard; platform action không mặc định toàn bảng/PII. Human owner/Admin exact capabilities plus state/feature rules; AI tools always restricted. Constraints typed per command (resource set/amount unit/bounds/runbook) not arbitrary SQL/scripts/admin expressions. Explicit deny/revocation takes precedence, expired grant no fallback. Permission/model names không executable instructions.

Every sensitive read/mutation rechecks server grants. Runtime deny authority unavailable → UNAVAILABLE/fail closed private action, public catalog independent; no cached permanent admin trust. Minimum critical revocation correctness: current grant revision/active status under authorization guard locked/versioned with mutation, revoke vs execution has serialized winner. Authorize+mutation not separated into TOCTOU gap. Queue workers reauthorize actor/delegation/action grant at execution; delegated business obligation workers use explicitly service-owned approved grant, không keep revoked human access token indefinitely. In-flight irreversible provider effect may already occurred before revoke; reconcile and record evidence cannot be discarded, but no new unauthorized submissions.

## 3. Capability matrix design

All entries specify permitted delegation, not grants already installed. ADMIN grants human staff/AI exact scopes, no default wildcard.

| Domain/action | Buyer | Cootton staff | ADMIN | AI_SUB_ADMIN |
|---|---|---|---|---|
| Public published catalog | public-safe | public-safe | public-safe | public-safe |
| Private cart/address/order/case | own resource only | required fulfillment/support fields when granted | explicit support/evidence grant, audited | minimal assigned case read; no raw PII/model egress by default |
| Product/price drafts and publish/moderation | none | own Cootton catalog/pricing grant; approval boundary | scoped policy/moderation approval | draft/propose; approved bounded catalog/SEO runbook only |
| Stock adjustment/inspection/restock | none | actual evidence + separate D03/D06 grants | approve permitted evidence command, cannot fabricate physical facts | monitor/propose; no physical attestation/SQL correction |
| Processing/packing/shipment/case decisions | request/read own | typed scoped D05/D06 command/evidence | authorized review/escalation | read/explain/propose, no fake handoff/delivery/refund proof |
| Cost/report aggregates | none | D07 report/cost proposal or review separately | approved cost basis/report control | authorized aggregate read/report/propose; incomplete facts stay incomplete |
| Refund/payment/ledger correction | no paid/refund flag writes | separate financial execution grant only after enablement | approved bounded domain command/evidence after payment readiness | no financial execution from this scope; no direct balance/ledger edits |
| Policy draft/approve/activate | none | delegated specific draft where allowed | scoped approval/activation with readiness | propose; no approval of own financial/security policy |
| Staff grant/revoke/AI tool grants | none | none in launch | owner-admin explicit security command | none; no self-escalation/delegation |
| Sensitive export/secrets/raw database | none | export explicit field/job grant; no secrets/SQL | authorized export/secret workflow, no unrestricted app SQL | no raw secret/DB-owner credentials/export or third-party transmission by default |

Buyer checkout consent không grants staff/AI tự mua/thu tiền. Seller manager title không ADMIN. Admin doesn't bypass immutable ledger/stock invariants or active feature readiness. Multi-seller/VCS personal access deferred; no marketplace grants provisioned. AI granted automation separate scope/runbook/resources/bounds; broad owner cooperation authorization không perpetual external API financial/root access.

## 4. Bootstrap, sessions và sensitive actions

Owner bootstrap is separately assigned provisioning workflow: verified Firebase subject/project, one canonical owner-admin record, protected one-time registration/recovery path, no public register-admin/email hardcode/default password. No tool/service can bootstrap itself from document. Prevent revoke/remove last active owner-admin through ordinary command; ownership recovery requires explicit verified human/runbook, no backup admin invented. Owner session unavailable does not auto elevate AI or staff.

Privileged Admin actions require verified strong authentication/step-up evidence policy before access/grant/secret/financial/policy changes; method (supported MFA provider/enrollment/session age/duration/recovery) actual D10 decision gate, not fake enrolled claim. No OTP/password stored in repo/chat/tools logs. Browser cookie vs bearer session transport, CSRF/origin/CORS allowlists, token rotation/revocation and secure mobile storage exact implementation contract before auth routes. Existing API liveness not proof auth implemented.

Sensitive approval binds actor/session, exact command hash/resource/action/expected versions, limit and expiry; payload/state change invalidates approval. Human ADMIN may approve and execute within explicit runbook when solo owner; no fabricated mandatory second human. AI cannot approve own security/financial requests. No everlasting approve-all checkbox or approval reused for another refund/grant. Actual time/amount thresholds unresolved means sensitive execution unavailable, not unlimited. Audit denied/proposed/approved/executed phases with safe minimal metadata.

Recovery/break-glass never generic bypass URL/token. Needs approved identity verification, scoped temporary grant/time/reason, revocation and audit; policies/invariants/ledger immutability still hold, no auto financial replay. Design does not request or create new credentials/access now.

## 5. Policy lifecycle và immutable contracts

Policy key belongs canonical domain registry (catalog dictionaries/moderation D01, prices/minimum D02, stock/attempt controls D03, financial D04, shipping D05, returns D06, seller/report D07, permission D08). One owner module, admin UI edits via typed command not SQL or duplicated client rules. D01–D10 “Admin configurable” means approved bounded fields, not free schema/contract rewrite. Breaking schema/asset units/identity/time basis changes require reviewed contract version/migration/consumer compatibility, not dropdown override.

Version states DRAFT→SUBMITTED→APPROVED→SCHEDULED→ACTIVE→SUPERSEDED/RETIRED; rejected draft preserved decision, changes create new revision/hash and require new approval. Immutable approved version retains actor/reason/evidence, exact values/unit/scope/effective interval, dependencies/activation plan. At given scope/time unique applicable approved version and defined override precedence; conflict overlap blocked under policy-key lock, no choose newest arbitrary. Domain-specific D02 scope rules preserved. Empty config not0/unlimited/disabled; explicit enabled flag/actual values required.

Activation checks source/grants/provider/cost/operational and contract dependency readiness in bounded transaction with audit/outbox/idempotency. Scheduled timestamp UTC+input timezone as typed facts; schedule not promise worker/onboarding exists. Retroactive effective dates changing accepted obligations forbidden. Snapshot accepted order/quote/lot/case/report terms protected D02–D07; emergency safety revocation may block new mutations/commit through explicit domain rules but doesn't rewrite prices, erase refund obligations or drop uncertain funds.

Rollback creates approved new version referencing prior safe values + compatibility analysis, not edit/delete history or undo posted money/stock/carrier effect. Financial CP conversion fixed CP_MILLI; VC/VCS actual rates/sources inactive, cannot activate by copying CP. D06 15×24h inclusive cutoff and approved conditions baseline protected; future policy changes need owner decision/protected snapshot behavior, not AI unilateral change. Fixed return cost amount/unit/COGS/SLA missing cannot auto-fill from competitor/AI guess.

## 6. Feature readiness và operator workflow

Separate statuses NOT_CONFIGURED / BLOCKED / READY / ENABLED / PAUSED with evidence/version gates. READY no runtime ENABLED, UI checkbox not provisioning/provider contract. Current website-before-payment allowed planning/read/layout implementation when assigned; no real order-submit/stock hold/payment/refund/carrier enabled. CP top-up explicitly PAUSED; CP/VC/VCS launch tenders and marketplace disabled. VNPAY recommendation not merchant approval. Re-enable needs owner scope, provider/policy/grant/source readiness and targeted verification, no inference from broad Admin authority.

Admin panel workflow review current values/version/source → draft typed change → validation/diff/impact on new vs existing resources → scoped approval → activate/schedule → persisted result/audit → monitor. One workflow no automatic alternate price/provider/customer correction on validation failure. Policy dependencies missing report blockers/source data required, don't silently fabricate values. Diff hides secrets/PII, no provider raw documents in model input default.

Routine read/aggregate/anomaly reports and approved low-risk bounded actions AI may automate only actual runbook/tool grant. Error→prompt→fix cycle operates authorized repository/reversible action scope, not authority to delete DB/edit ledger/open payment/write customers or bypass branch checks. Stop/review conditions: no contract/grant/evidence, bound exceeded, ambiguous external effect, sensitive change requiring human, revoked scope. Tool invocation records actual result, no “fixed” from model text. Auto-run no scheduled jobs created here.

## 7. Audit, data safety và service scopes

Audit append-only action ID/actor type/verified subject ref/impersonation-delegation ref/action/resource/scope/expected and resulting version/decision/reason/policy/approval refs/time/outcome/requestId. Safe field allowlist, secret values/OTP/bank login/raw customer payload not logs; protected diff refs encrypted if evidence required. Denied access logging bounded/rate-limited to avoid log-flood DoS and PII oracle, no public expose unauthorized record existence. Failure to persist mandatory audit → mutation rollback/no outbound submission; external already-effectful facts durable inbox/recovery not ignored if audit sink temporarily down.

Audit transactional database record + outbox; external log sink not network dependency inside core transaction. Read log projections no journal edit privileges. Application service role least privilege, migration role separate, runtime no Neon owner credential; no unrestricted SQL console in admin. Separate webhook identities validate provider/auth/correlation; queue identity can't mutate arbitrary data beyond action grants. Secrets accessed server-side scoped integration, not API response/email/export/AI memory.

Customer/bank evidence field access minimum by purpose; public catalog projections exclude private grants/IDs/customer/cost data. Export requires action+field allowlist+bounded job/grant current at download; no default staff all-data. Provider model isolation and no unapproved egress preserved; model context not trusted authorization/policy. D10 retention/backups/recovery actual before purge; three app versions not audit/financial history lifespan. AI DB monitoring reports mismatch/injection/anomaly, no SQL repair/permission elevation or proof DDoS blocked from chart.

## 8. Concurrency và logical PostgreSQL design

Access commands persisted principal+operation+key/fingerprint/result, expected version; replay safe same payload, CONFLICT different payload. Grant revision lock/authorization guard before domain mutation, then D03–D06 global order (buyer/attempt if used → existing order/case → financial resources → stock). Revoke command only auth rows, no acquiring domain rows after money/stock; consistent guard order avoids deadlock. Policy key/version admission guard before affected domain resources; any new earlier resource discovery restarts bounded transaction. No external auth/provider/AI call within retried DB closure.

| Conceptual relation | Integrity/workload design |
|---|---|
| principal / external_identity_binding | UUID plus unique issuer/project/subject, active lifecycle/version, no email-as-role; immutable binding/recovery facts |
| role_capability / scoped_grant / grant_transition | typed action/scope IDs/constraints/effective interval/status/version, issuer refs; subject/action/scope and due expiry indexes; deny-first resolution |
| owner_admin_binding / approval_record | one current owner boundary, verified bootstrap/recovery, exact action hash+version/expiry+actor evidence; no auto-create or bypass |
| policy_key / policy_version / approval / activation | unique scoped key/version, immutable payload/schema hash/effective intervals/dependencies; locked activation, approved template/type bounds |
| feature_readiness / automation_grant refs | evidence/contract version/prerequisite/status/runbook/bounds, no checkbox overrides; CP paused explicit |
| authorization_audit / security_incident / outbox refs | immutable safe facts, action ID unique, indexed actor/resource/time and due/status; no raw secrets/PII public |

All logical names, no DDL/migrations or seeded privileges. Cross-row overlaps/last-owner/atomic revoke correctness needs guarded transaction/restricted writers; not independent CHECK guarantee. List/query default20/max50 keyset and resource-scoped predicates, grants bounded indexed resolution; no permission scan full DB per request, cache must version-check/revoke fail-closed. Exact auth cache/session/time budgets D10 pending, no claim current production correctness. No parallel role engine per Web/app/provider.

## 9. UX/errors, execution gates và acceptance

Admin/seller UI shows actual allowed tasks, draft vs active policy, actor/version/audit, blockers and safe previews; sensitive submit needs actual approval/step-up. Forbidden button hidden for UX but backend always validates. Input required empty/null/unknown enum bounded INVALID_INPUT, no default admin/financial values. Auth failure401 vs authenticated forbidden403 implementation mapping to core later; resource existence neutral where privacy requires. Other reasons GRANT_REVOKED, POLICY_VERSION_CONFLICT, POLICY_DEPENDENCY_NOT_READY, APPROVAL_REQUIRED/STALE, FEATURE_PAUSED, OWNER_RECOVERY_REQUIRED, UNAVAILABLE. No stack/security/PII leakage.

Gates: explicit coding/provisioning task; actual Firebase project/verified owner subject; owner bootstrap/strong-auth recovery/session transport decisions; reviewed D08 action matrix and actual staff/service/AI grants; typed policy records/sources/domains; runtime least privilege roles/secrets; audit storage/retention and revoke/concurrency evidence; D10 time/bounds and targeted checks. Public website independent auth/payment blocker; private flows cannot fake role/login to appear complete. No permission or policy written from this contract.

Future acceptance: forged email/role/claim/host/client sellerId denied; buyer/private cross-resource access/list/count/export denied; grant expiry/revoke race with command/queued provider submission; last-owner prevention and authorized recovery; staff catalog grant no financial execution; AI self-escalation/proposal self-approval denied; policy duplicate/overlap/different payload replay/rollback old snapshots; paused CP/payment readiness not bypassed by Admin; mutation audit failure no external send; sensitive payload invalidates approval; outage fail-closed private and public core independent; no source sensitive leak. Required implementation verification, not runtime evidence.

D08 deliverable design complete: owner hierarchy/identity, scoped capability matrix, approval/revocation, typed policy lifecycle/readiness, AI boundaries/audit/service roles/logical relations. Next D09 UX/SEO/help and D10 operational readiness before private management implementation; no financial or production access granted now.
