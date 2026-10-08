# API-04 — Preflight and isolated verification checkpoint
`EVD-REL04-PREFLIGHT-001` · 2026-10-08 · Asia/Saigon · observed scoped evidence; rollout NOT STARTED.

## Reading order and authority
Read [merge checkpoint](API04_MERGE_CHECKPOINT_2026_10_08.md) → [deployment plan](API04_DEPLOYMENT_PLAN.md) → this checkpoint → [transaction/media contract](../contracts/API_TRANSACTION_MEDIA_RECOVERY.md).
Owner assigned preflight/isolated verification and explicitly approved the existing Cloud Shell session and at most four new private GCS fixtures. No production database write, deployment, IAM change, publication or deletion occurred in this verification. Preserve RULE-API-001 and all ACCEPTED decisions; this is evidence, not a new architectural decision.

## Source and CI
- Frozen main after documentation PR24: `e667bec1cd73d14721e57b20379719866a8b60ba`; API04 implementation merge: `d2b34490385c20de773a81fdc1e6f58ca8d4ef08`.
- Verification source: PR25 `3439c676b0b776066712af00605d37a72431cb5f`. Application source, contracts source and applied SQL001–006 were previously compared with frozen main and unchanged. Verification files are additive; this does not certify applied production schema hashes.
- [Foundation run37691552907](https://github.com/Cootton/CoottonPlatform/actions/runs/37691552907), job113032715506: build/check SUCCESS; contracts12 PASS; API24 PASS/1 SKIP; disposable PostgreSQL2 PASS. [Container run37691552756](https://github.com/Cootton/CoottonPlatform/actions/runs/37691552756) SUCCESS. CI image build is not a deployed registry digest.
- Initial verification head4e3f8d24 failed because its fixture expected six bootstrap grants; actual source contains five. Correction c8d9a480 used those five source grants and publication-disabled scope; Foundation37690964601 passed. Final head3439c676 added the manually executed GCS harness and passed again. The fixture failure was not a production failure.

## REL04-HTTP-DB-001 — PASS, isolated scope
[HTTP/database helper](../../apps/api/verification/api04-runtime-retry.cjs) is called by [existing disposable PostgreSQL verification](../../apps/api/verification/admin-authorization-db.cjs) in CI, using localhost cootton_api_test and its existing fixture guard/cleanup.

Actual Nest HTTP, restricted writer role and real PostgreSQL COMMIT prove:
- Missing bearer401 without effects; SELECT-only principal policy enforced by a denied UPDATE42501.
- COMMIT succeeds, then an injected lost acknowledgement returns503. An independent connection observes the durable version1 and receipt.
- Exact request/key replay, including reordered object keys, returns201 and the original result; cache is invalidated and counts do not duplicate.
- Changed fingerprint409; archive increments to version2; replay of original create still returns original version1 rather than current detail.
- New command key with stale expectedVersion409; cooperating owner revocation makes receipt replay403; version/audit/outbox/receipt counts stay atomic.

Identity admission is a **transport fixture**, not a real Firebase ID-token test. These particular commands run with publication disabled and the five minimal bootstrap grants. This evidence partially addresses REL04-V02/V03; it does not prove every one of the thirteen actions, actual Firebase admission, all media/publication grants, concurrent full journeys or worker consumption.

## REL04-GCS-001 — PASS, real GCS with isolated unattached fixtures
[Manual harness](../../apps/api/verification/api04-real-gcs.cjs), deliberately excluded from credential-free CI, ran once in the existing authorized Cloud Shell with source3439c676, Node24.21.0, frozen pnpm10.34.6 lockfile install and contracts/API build. No DATABASE_URL or ADMIN_DATABASE_URL was supplied to the process.

Existing Cloud Shell ADC was used; bucket `cootton-catalog-media-524673981677`, project `cootton-firebase`. This uses the operator's existing ADC, **not a claim of exercising the Cloud Run service account**. The active session was observed without exporting tokens. Bucket metadata assertions confirmed uniform access and enforced Public Access Prevention.

| Fixture alias | Generation observed | Stored bytes | MIME / encoding | Assertion |
|---|---|---:|---|---|
| GCS04-IMAGE |1791425769639898|44|image/webp, identity|Create-if-generation-match0; real existing-object retry accepted exact bytes through one pinned-generation stream; generation unchanged |
| GCS04-GZIP |1791425770023745|64|image/webp, gzip|Retry returned503 before any read stream |
| GCS04-VIDEO |1791425770282338|42|video/mp4, identity|Private persistence object reused; generation unchanged after recovery and subsequent retry |
| GCS04-POSTER |1791425770538335|44|image/webp, identity|First poster save deliberately failed before SDK call; retry created missing poster |

All four metadata records have `private, no-store`; four new objects were retained. No overwrite/delete/DB attachment/receipt/publication occurred. Exact synthetic object names and the one-run manifest are retained in the operator's evidence record; no personal account identifier or token is included here. Do not rerun with fresh random IDs under this four-object authorization.

Limits:
- The gzip fixture has a different stored size; the observed result proves compressed-object rejection before stream, not that the encoding branch alone caused rejection.
- Ignored-Range, local overflow destruction and truncation are injected transport tests in source CI, not a claim that actual GCS ignored Range.
- The video bytes are an opaque synthetic persistence fixture labelled video/mp4, **not playable video or real encoder output**. Poster failure is injected; subsequent storage calls are real. Encoder determinism, licensed-video processing, SQL attachment/receipt recovery and stale-version processing avoidance remain OPEN.
- No new real Firebase human token, nonowner/revoked token or provider admission was exercised. Firebase initialization/ADC/GCS access is not REL04-V01 completion.

## REL04-P01 — observed read-only cloud baseline, incomplete
Cloud Console preflight observed API revision `cootton-api-act006-3c768d6` with100% traffic; prior `cootton-api-00005-ff6` retained at0%. API image:
`asia-southeast1-docker.pkg.dev/cootton-firebase/cootton-containers/api@sha256:75065b4658ce021d8a7777f9261a9837759982954ff49b1b64b021538ee42d54`.

Observed settings: port8080,1CPU/512MiB; Firebase project cootton-firebase; media bucket as above; publication flag true. DATABASE_URL and ADMIN_DATABASE_URL reference reader/admin secrets; values were not read and pinned secret versions were not verified. Bucket Console lists cootton-auth-verifier with Object Creator/Object Viewer. This is configured IAM evidence, not a successful operation under that service identity.

Read-only current API checks at `https://cootton-api-524673981677.asia-southeast1.run.app`:
- GET /v1/health/live200, alive/contractVersion0.1.0, no-store.
- GET /v1/catalog/products200, empty items/nextCursor null/B2C/commerceEnabled false, no-store.
- GET /v1/admin/session without bearer401.

ACT006 remains the deployed application checkpoint; API02–04 source merge and isolated verification do not mean new runtime deployment. Product versions DRAFTv23/DRAFTv5 remain historical ACT006 expectations; no new canonical SQL read of those versions is claimed here.

## Traceability and gate decision
| Required scenario | New evidence | Remaining |
|---|---|---|
| REL04-V01 / GATE-SEC-001 |CI transport policy negatives; existing IAM observed|Actual human Firebase tokens/provider/revocation/outage under intended runtime identity |
| REL04-V02/V03 / GATE-DATA-001 |REL04-HTTP-DB-001|All actions, required concurrent scenarios and production retry remain unverified |
| REL04-V05/V06/V07 |REL04-GCS-001 plus source transport tests|Actual runtime service identity, playable encoder output, SQL attachment/receipt recovery; full mismatches |
| REL04-V04/V08 / GATE-PUBLISH-001 |Prior source and ACT006 evidence preserved|New complete isolated publication/withdrawal race journey |
| REL04-P01 / GATE-OPS/PERF/RELEASE |Frozen source/CI and current read-only baseline|Applied schema hash/status recheck, secret-version pins, compatible API/Web artifacts and rollback review, resource/concurrency/SLO acceptance, monitoring/restore/signoff |

**Decision: no rollout from this checkpoint.** Scoped PASS does not close REL04-P01, all REL04-V01…V08 or any full Production Gate. API04-RECOVERY-002 intent/retention/reconciliation/cleanup/backup-restore remains OPEN. Next work: finish the listed isolated/authentication/preflight gaps, then prepare separately assigned artifacts and rollout scope. Do not widen IAM or invent business facts to close a gap.

Recheck on app/schema/auth/encoder/grant/flag/artifact changes, changed source SHA or traffic revision. Record a new checkpoint after deployment; retain this observed evidence with its source/environment limits.
