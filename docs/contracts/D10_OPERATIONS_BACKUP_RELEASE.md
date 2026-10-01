# D10 — Vận hành, giám sát, backup/DR và điều kiện triển khai

Contract `D10.operations.readiness.v1`, 2026-10-02. Dependencies CORE/D01–D09 và actual infrastructure/provider capabilities. Một seller Cootton, website trước thanh toán; CP top-up paused, launch CP/VC/VCS và marketplace inactive. Documentation/logical design only: không provisioning jobs/cloud roles, migrations, restore/delete, secrets, deployment workflows hoặc application runtime. Giữ V001 tại chỗ.

## 1. Baseline và một luồng thực hiện

Actual evidence: foundation NestJS/Next/shared transport, protected main/CI/CodeQL; Neon PostgreSQL18 Free Singapore và local read-only SELECT1 ngày2026-10-01. Web shell noindex; public liveness không phụ thuộc DB. Chưa executable commerce schema/handlers, production role/deployment, actual owner bootstrap/session/MFA/grants, backup execution hoặc restore drill. Có Firebase/Google Cloud/Play Console account không chứng minh runtime configured.

Giữ modular monolith + PostgreSQL canonical + shared contracts/public-private projections + object storage + bounded worker khi cần. Không microservices/Kubernetes/vector DB/replica mặc định. Exact hosting/storage/log destinations, region, budget, domain/DNS/TLS, quotas/identities phải có actual environment manifest trước provisioning. Google Cloud qua GitHub Actions/OIDC là hướng dự kiến, chưa tạo resources; Cloud SQL shortlist tương lai, không canonical song song với Neon.

Task flow: V001/contracts → prerequisites/evidence → scoped runbook → prepare change → required verification → protected PR/CI → immutable approved release → deploy chỉ khi assigned scope/grants/readiness → bounded observation → complete hoặc durable incident/checkpoint. Routine authorized steps không hỏi lại; AI không tự mở code/deploy từ design. Owner tham gia khi prerequisites/rights AI không tự thực hiện được.

## 2. Readiness manifest và gates

Logical manifest: environmentId/scope, Git SHA/artifact digest, contract/schema versions, public hosts, actual infra/region/plan/quotas, identities/grants, secret refs không values, enabled features/policy sources, backup/restore evidence, monitoring/duty contact, approval/changeId/state. Missing → NOT_READY, không invent credentials/provider/data. READY khác ENABLED, role khác financial/provider readiness.

| Gate | Actual evidence phải có | Không mở theo gate này |
|---|---|---|
| Public catalog | Approved D01/D02 data/media, D09 rendering/UX, infra/TLS/budgets/security, backup/restore, exact release assignment | Private CRUD/order/payment |
| Indexing | Canonical routes, truthful content/markup, sitemap/robots verification, public policy/contact, index approval | Checkout; current noindex giữ tới gate |
| Private management/cart | Executable contracts, D08 actual bootstrap/session/grants, audit/private boundaries/policies/ops | Fake role/admin bypass |
| VND commerce | D03–D06 integrity, real stock/carrier/costs, approved provider/evidence/refund/reconciliation, stronger DR | Chưa payment activation hiện nay |
| Points/marketplace/apps/AI | Separate exact assignment/funding/grants/provider isolation/store readiness | CP paused/VC-VCS unresolved/multi-seller deferred |

Catalog-only release báo rõ chưa nhận đơn/thanh toán; không fake orders/paid, implicit COD/manual transfer. Compliance/privacy/merchant actual evidence cần riêng; đây không legal/tax certification.

## 3. Health và observability

Liveness process-only; readiness scoped dependencies/schema/config/runtime identity/backpressure. Public response generic; internal diagnostics D08 auth. DB/provider outage không restart-loop hoặc SELECT1cron giữ Neon wake. Synthetic public reads có cadence/budget; DB probe bounded chỉ khi cần, không defeat scale-to-zero.

Minimal structured logs: UTC, environment/release/contract, request/action/trace UUID, module/operation, safe reason/outcome/duration/retry. Không raw customer text/URL query/body/headers/email/address/token/password/OTP/bank/database URI/provider evidence trong logs/traces/prompts. Metrics route-template/error-class bounded; không order/customer/SKU IDs high-cardinality labels. Private correlations protected, không public screenshots.

Signals: public/API availability/p95/4xx/5xx; auth/revoke anomalies; DB pool acquisition/connections/timeouts/locks/deadlocks/slow fingerprints/storage-index-bloat/quota growth/cold starts; inbox/outbox backlog-oldest-age/deadletters/worker heartbeat/projection watermark; stock/uniqueness anomalies; payment/refund unknown/reconciliation freshness chỉ khi enabled; backup last success age/coverage/key/drill; D09 rendering/index/CWV/cache withdrawal; optional AI errors/costs riêng. Missing source → UNAVAILABLE, inactive → NOT_ENABLED, không0.

One dashboard plus protected incident detail, source/asOf/coverage. No full-table daily scans; indexed bounded batches/watermarks. Alert-on-absence của backup/worker/monitor khác job-error. Monitoring outage cũng incident, không kết luận không có lỗi.

## 4. Technical budgets và database phình to

Các số là baseline design targets/bounds, chưa measured guarantees/SLAs; typed reviewed ops changes không đổi financial contracts/deadlines.

| Area | Baseline |
|---|---|
| Public availability | Internal99.5% rolling30days eligible reads; infra timeout/errors included, invalid requests excluded |
| Warm public API | p95≤500ms under declared workload; cold starts riêng nhưng failure không loại khỏi availability |
| Web | D09 p75mobile LCP≤2.5s/INP≤200ms/CLS≤0.1; real field evidence, lab proxy không achieved INP |
| First load targets | Compressed HTML≤100KiB, JS≤250KiB, visible initial images≤500KiB; route/device evidence |
| Queries | Keyset20/max50; detail D01 bounds; D07 interactive≤366days, larger export async/granted |
| Existing connector | max5/process,min0,connect15s,idle30s,statement10s,query12s retained; not production tuned |
| Future transactions | Lock timeout baseline2s, statement≤10s within request deadline; no external/AI call inside transaction |
| Safe DB retry | Max3attempts total transient serialization/deadlock, jitter/deadline/same key; unknown commit look up durable result first |
| Background | Batch≤100items, max1heavy job concurrently Free baseline, resumable cursor/lease/fencing/heartbeat |
| Quotas | Warning70%, urgent85% or forecast exhausted≤7days, critical95% or actual failure; no auto paid upgrade |

Provider timeouts/retry/query-after-unknown method-specific before activation, no generic resubmit/new key. All process/API/worker/deploy-surge pools sum below actual provider ceiling with operational reserve; manifest max instances/admission queues bounded, không max5×unlimitedautoscale. Unknown ceiling blocks scale config. Controlled429/503 instead of infinite queues.

Catalog mutable cache baseline max-age60s plus event/version invalidation, immutable media hashed; checkout canonical revalidate, cache never finance authority. Withdraw/private content purge promptly, no serving concealed stale private/withdrawn facts. Private no-store; D08 revocation serialized guards not TTL-only trust. Indexes for scoped query/idempotency/jobs/relations and plans on representative volumes; no SELECT-all/deep offset/images in DB/unbounded JSONB. Partition/replica only workload evidence, no early duplicate source.

## 5. Incidents và AI auto-run

| Severity | Example | Internal response objective when staffed |
|---|---|---|
| P0 | Active leak/integrity loss/duplicate unauthorized money effect | Immediate alert, human ack≤15min |
| P1 | Critical outage/backup RPO exceeded/provider unknown/quota imminent | Immediate alert, ack≤30min |
| P2 | Partial noncritical/projection-SEO lag/capacity warning | Review≤1businessday |
| P3 | Maintenance suggestions | Next planned window |

Actual notification destination/duty hours/recovery contact cần trước commerce; AI alone không staffed24/7. Alerts dedupe incident key, first actionable/severity change/resolution; external messages only authorized channel, none sent now. Traffic anomaly là suspected attack, không chứng minh DDoS đã block; actual CDN/WAF/rate-limit/abuse runbook cần provisioning.

Incident DETECTED→TRIAGED→CONTAINED→RECOVERING→VERIFIED→CLOSED, immutable timeline/source/scope/version/actions/uncertainty. CLOSED không paid/refunded hay physical inspection. Auto-loop observe→classify→scoped repair task→precondition/grant check→bounded action→verify→continue/checkpoint. Runbook version/hash/actor/actions/resources/preconditions/max3attempts/deadline-cost/idempotency/success evidence/rollback/escalation. Same failure3attempts/no progress, stale approval, unknown external effect or scope/budget expansion → checkpoint/escalate, no infinite repair.

Only after actual scoped grant: bounded derived rebuild, safe job/read retry same key, compatible app rollback, content/SEO proposal, pause optional AI. No direct stock/money SQL, self-grants, fabricated carrier/inspection proof, disable security, dropDB/purge backup/rotate secret by model alone. Typed AI history actionId/task/runbook/actor/environment/release/sourceRefs/state/reason/attempt/scope/fingerprint/evidence/verification/nextCheckpoint; no secrets/raw PII/prompt injection. Per-model memory isolated; shared incident facts through canonical authorized tools, không read cross-provider memory.

## 6. Backup scope và ba phiên bản

Three hot APP versions: current + two previous known-compatible releases/manifests. Git source/history Source of Truth không xóa theo3versions. Older release packages compress/encrypt, download/archive to owner-designated private destination, checksum+read-back receipt trước online removal. Missing destination/receipt → retain/alert; document không authorize delete.

Data backup riêng: catalog/SKU/policies/grants/order/stock/financial journals/claims/idempotency/inbox/outbox/audit/schema; media originals/private evidence/object versions; Firebase identity/bootstrap recovery, infra config, secret/key recovery refs. DB dump alone thiếu external media/identities/cluster roles/keys. Backup writer separated from restore-reader/delete rights and production credentials, encrypted before transfer/TLS, key outside archive with verified owner recovery. Public Git/Actions artifacts/log/email/model memory không backup destination. Restored private data never public preview.

Manifest backupId/environment, UTC snapshot boundary/start/end, engine/tool/schema/contracts/release, scope/exclusions/media-evidence watermarks, encrypted object IDs/checksum/size/keyRef, upload read-back, retention/legalHold/restoreEvidence/status. Bytes checksum không proof logical recoverability; partial export notSUCCESS. pg_dump consistent single-DB export with supported PG18 tools/privileges and warnings checked, không omit RLS data silently; roles/extensions from reviewed least-privilege manifest, no broad credential dump.

## 7. Recovery objectives và Neon Free

Official Neon documentation checked2026-10-02: Free short restore history, one manual snapshot/no scheduled native backups, finite quotas/short metrics history/no uptime SLA. Reverify actual current account settings before provisioning; không claim Cootton backups/PITR verified. Same-account branch/snapshot/history không independent account/off-provider recovery.

| Scope | Proposed objective before launch | Evidence |
|---|---|---|
| Catalog-only, no commerce | RPO≤24h, RTO≤4h from declared incident | Independent encrypted export/media/config/key coverage, measured successful restore; usable snapshot age≤24h |
| Transactional VND/stock/order | Canonical RPO≤15min, RTO≤4h; reopen after reconciliation | Validated continuous + independent protection across failure classes, actual tool/provider capability/budget and owner data-loss-risk approval |
| Media/identity/provider loss | Coverage consistent with dependent feature goals | Actual per-resource recovery, not DB-only proof |

Design daily catalog export02:00 Asia/Saigon plus safety run/recovery margin before24h freshness limit; exact scheduling/duration/resource approved at provisioning. No schedule automation created. Fresh proven recovery point before data-affecting release/migration. Proposed catalog retention7daily+4weekly; financial/audit/evidence/PII retention/legalHold approved purpose separate, not inferred from export count. Daily dumps alone cannot meet15min commerceRPO. Free short PITR insufficient account outage/long-history strategy; need verified architecture or approved budget/plan change before transactions. Paid tier alone not guarantee independent15minRPO/media/identity DR.

Monitor snapshot-boundary age/coverage/read-back/key/drill, warn before max freshness and P1 when objective exceeded; provider console up không successbackup. Monthly private isolated restore drill baseline and after backup/schema/key/major tool changes. Necessary recovery validation không sandbox product deployment. None executed now.

## 8. DR runbook

1. Declare incident/cutoff, preserve facts, drain/fence affected writes/provider sends/workers; safe public reads if possible.
2. Inventory keys/backup scope, select compatible point, authorized isolated target; no destructive overwrite first.
3. Restore DB/media/config/identities through reviewed tools; outbound workers/webhooks/notifications/AI disabled before restored app starts.
4. Verify D01 uniqueness/IDs, D03 stock/holds/attempts, D04 per-asset balance/lots/caps, D05 order evidence, D06 claim/refund/restock, D08 owner/grant/revocation/audit, source watermarks. No fake zero missing costs or balance edits.
5. Reconcile post-snapshot collections/refunds/carrier facts with trusted external queries/inbox/independent evidence. Lost idempotency refs/commit results → REVIEW_REQUIRED, recover evidence, never new payment/refund keys or blind replay. Incoming evidence retained durably during freeze, no acknowledge then drop.
6. Rebuild derived cache/search/discovery/reports only; apply late events version-guarded. Reapply deletion tombstones/revocations/current security facts before access; old backups not revive deleted PII or expired grants.
7. Single-writer cutover/drain/fencing; prevent split-brain, authorize restart/reconcile before workers send. Exact endpoint change/grants approval required.
8. Verify measured coverage/RPO/RTO, unresolved unknowns and owner, preserve original incident evidence, then close.

App rollback không DB rollback erasing real post-backup commerce; financial compensation append-only D04/D06. Unknown provider effects keep review, no automatic hold release. At-least-once outbox uses durable dedupe/lease fencing, không claim exactly-once. Restore drills cannot fabricate physical stock/delivery evidence.

## 9. Retention, secrets, session readiness

Proposal operational logs7days online/30days encrypted justified incident archive, aggregate metrics30days; exact destinations/capacity/purpose must be approved. Canonical financial/order/audit/case/customer retention market-specific approved before activation/purge, no statutory duration invented. LegalHold overrides purge; deletion/anonymization policy includes backup expiry/tombstones/recovery access. No actual purge from design.

Production approved secret manager refs/env-scoped access/rotation/recovery, no browser bundle/Git/debug URI. Local ignored .env development read-check only; Windows user-only ACL unconfirmed. DB runtime least privilege separate migration/backup/restore identities; Neon owner not production role. Grant/credential security changes require explicit scope, document not pre-grant.

Web auth baseline design host-only Secure HttpOnly SameSite=Lax cookie plus CSRF/Origin checks for state changes, exact CORS/hosts no wildcard credentials; verified Firebase identity+current D08 guards, email/cookie role not authority. Admin idle15min/absolute8h and sensitive step-up fresh≤5min proposed targets. Actual supported MFA/strong-auth enrollment/recovery/provider/session reviewed and provisioned before private Admin; no fake enrollment or AI custody of human session/OTP. Mobile secure OS token storage; no secretURL/deep-link auth. Recovery contact/verified owner actual pending, no invented second Admin.

## 10. CI/CD without local PowerShell

GitHub Linux Actions can build/verify/package/deploy server-side from approved UI-triggered workflow. Current CI only foundation build/check/transport, no deploy workflow/credentials installed. Production jobs added only assigned implementation/provisioning, no automatic deploy from docs merge.

Protected main/PR/required checks/CodeQL remain. Immutable SHA/digest/locks, least token permissions, newly introduced production actions pinned reviewed commit. Untrusted PR/fork cannot secrets/OIDC, no privileged pull_request_target executing untrusted code. Conditional short-lived OIDC trust exact repo immutable IDs where supported, expected protected ref/environment/workflow/event, not org wildcard or long-lived owner key.

Current first-party-only Actions policy may block google-github-actions/auth: exact trust/policy change needs review/authorization, no silent allowlist expansion. Actual GCP billing/resources/region/IAM/secret provisioning scope required; this design grants none.

Release PREPARED→VERIFIED→APPROVED→DEPLOYING→OBSERVING→COMPLETE or FAILED/ROLLBACK_REQUIRED. Concurrency1/environment, migration single writer lock, bounded health/drain/timeouts/observation, one canonical DB writer. App rollback only compatible artifact preserving data. Schema expand/migrate/contract, resumable backfill/compatibility; incompatible rollback → approved roll-forward/contained mode, no destructive auto down/restore. Three hot artifacts don't guarantee schema rollback. Graceful shutdown/drain resumes same idempotency refs without duplicate sends. Real assigned product release, no sandbox demo substitute.

## 11. Scale, maintenance và acceptance

Actual quota forecasts70/85/95% thresholds, stop optional jobs/admission before saturation; upgrade proposal observed size/compute/egress/connection/backup needs, projected cost/ownerbudget/cutover/fallback. No auto paid upgrade/delete customer/ledger/audit. Scale DB before unbounded workers; media/telemetry/AI memory not fill commerceDB. CloudSQL future migration with portability/DR contract not parallel balances.

Maintenance reviewed window/owner/grant/impact/backup/version: indexes/slow queries, bounded consistency/source checks, dependency patch PRs, key/cert expiry, archive read-back, drills/quota. No VACUUM FULL/DDL/data repair from AI chart alone. Optional AI separate quotas/backups/provider-isolated data, core/human management operates without AI; provider fallback cannot transfer private contexts across providers by default.

Before deployment actual evidence required: exact implementation/release assignment, hosting/domain/TLS/billingbudget/config/quotas/runtime roles, executable schema/data if used, D08 owner/session/MFA/grants, private secrets, monitoring/notification/duty, encrypted independent backups/keys/media/identity coverage and measured restore within scopeRPO/RTO, immutable artifact+CI+targeted acceptance, truthful policy/readiness and compatible rollback. Catalog release without payment onboarding possible only no commerce; private/payment gates independent.

Pending ledger: actual hosting/storage/log/backup/archive/key/alert destinations, cloudbudget, livequotas, verified principal/auth method/project, grants, retention/legalHold/deletion rules, backup duration/key/restore proof, dutycontacts, and payment/carrier/cost/policyconfigs for transactions. Unknown blocks dependent feature, not public-safe catalog planning.

Future acceptance: key/off-provider loss restore, checksum succeeds/logical datafails, missingbackup/monitor outage, oldrevokedsession restore, pool/storage exhaustion, split-brain, unknowncommit/provider duplicate replay, incompatible rollback, cachewithdrawal/private leaks, AIoffline humanops. None executed; docs CI doesn't prove runtime recovery/security. No new test source created in planning.

D01–D10 design baseline complete, not implemented/deployed commerce. Next proposed owner-assigned smallest catalog vertical slice with reviewed executable schema/constraints/publicprojection, actual data and readiness, then private management and transaction features only when actual dependencies ready; payment later for merchant approval. No automatic code/migration/provisioning after D10.

## 12. Primary references checked 2026-10-02

- [Neon plans, official source](https://github.com/neondatabase/website/blob/main/content/docs/introduction/plans.md): current Free limits/history/snapshot/scheduled backup/SLA distinctions; actual settings reverify.
- [Neon pg_dump guide, official source](https://github.com/neondatabase/website/blob/main/content/docs/manage/backup-pg-dump.md): export workflow, distinct from tested independent DR.
- [PostgreSQL18 pg_dump](https://www.postgresql.org/docs/18/app-pgdump.html): consistent single-DB exports/scope/tools/privileges; dumps alone not continuous production recovery.
- [GitHub OIDC Google Cloud](https://docs.github.com/en/actions/how-tos/secure-your-work/security-harden-deployments/oidc-in-google-cloud-platform): conditional short-lived identity/environment trust, requires actual provisioning.
