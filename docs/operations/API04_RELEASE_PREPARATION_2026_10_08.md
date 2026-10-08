# API-04 — PR25 merge and release preparation
`PREP-REL04-001` · 2026-10-08 · Asia/Saigon · **NOT READY TO DEPLOY**.

## Authority and reading order
[Master Plan](../../COOTTON_MASTER_PLAN.md) → [current state](../governance/CURRENT_STATE.md) → this checkpoint → [deployment plan](API04_DEPLOYMENT_PLAN.md) → [transaction/media contract](../contracts/API_TRANSACTION_MEDIA_RECOVERY.md).
Owner assigned review/merge PR25, release-condition checks and preparation of a concrete rollout/rollback proposal. No traffic change, new IAM, migration, production fault injection, product command or additional GCS fixture was executed. Full Production Gates and API04-RECOVERY-002 remain OPEN.

## REVIEW-PR25-001 — merged, scoped acceptance
[PR25](https://github.com/Cootton/CoottonPlatform/pull/25), reviewed head `25388315cc08257f17e617cc608ffd12bc89ecb6`, merged into main at **`e06d3de8e74bc7cb431734d32d339ef63e1824ef`**. Review found no blocking finding in its 13 verification/CI/documentation files. Application/contract source and SQL migration blobs were compared with base e667bec1 and unchanged.
- Foundation [37719063355](https://github.com/Cootton/CoottonPlatform/actions/runs/37719063355) SUCCESS: build/check, contracts12 PASS, API24 PASS/1 SKIP, disposable PostgreSQL2 PASS including real encoder helper.
- Container [37719063295](https://github.com/Cootton/CoottonPlatform/actions/runs/37719063295) SUCCESS: actual API container video tests2 PASS/0 SKIP, cache3/media2/publication4 PASS. This confirms encoder availability in that built container, not equality with Ubuntu6.1.1 or a pushed release digest.
- Merged-source Foundation [37742425087](https://github.com/Cootton/CoottonPlatform/actions/runs/37742425087) and main push [37742423811](https://github.com/Cootton/CoottonPlatform/actions/runs/37742423811) SUCCESS. Separate Dependabot update jobs failed; those are not Foundation or artifact certification.
- [Real encoder/GCS/SQL and Firebase evidence](API04_VIDEO_SQL_FIREBASE_EVIDENCE_2026_10_08.md): scoped PASS using existing operator ADC and isolated SQL; six retained private fixture objects total. Actual revocation-aware Firebase admission and deployed ACT006 owner read PASS. No Cloud Run service-identity operation is inferred.

## WEB-AUTH-OBS-001 — observed recovery, root cause OPEN
At09:47 Asia/Saigon owner retried the existing Web Admin form; browser displayed “Đã xác minh quyền quản trị”, authenticated controls and existing product list. A subsequent read-only reload completed with controls enabled, without an error. Error/warning capture returned no entries. No application/configuration/deployment change caused this recovery.
This supersedes the older assertion “Web login still fails” only for this observed session. Historical network-request-failed remains evidence; root cause and sustained recurrence testing remain OPEN. No email/password/token/UID was collected or published. This observation does not close the full identity matrix.

## Release-condition checks
| ID | Evidence observed | Decision / work required |
|---|---|---|
| PREP04-SA | Earlier bucket IAM lists cootton-auth-verifier with Object Creator + Viewer; private/PAP/uniform checks passed under operator ADC | **OPEN:** current API revision's attached service account and effective generation-pinned object operations need proof. Do not infer runtime permission from operator success or add grants automatically. |
| PREP04-ENC | Dockerfile.api uses node24-bookworm-slim, installs ffmpeg; container video checks PASS; isolated Ubuntu FFmpeg6.1.1-3ubuntu5 repeatability PASS | **OPEN:** build/push exact release digest, record base digest + ffmpeg/ffprobe/package versions and hashes, run identical-input repeatability on candidate. Same unfinished media retry across encoder versions must not create a different hash/path. Persistent conflict stops for reconciliation. |
| PREP04-SDK | Local Node24.21.0 + Storage8.2.0,100 bounded generation/range reads,0 warnings; each completed stream destroyed; error/close listeners first/last1/3, max1/3 | **OPEN:** actual GCS run previously warned11 listeners. Local transport is not real GCS or exact repository transitive lockfile. No proof of absence of a leak; repeat read workload against already-retained fixtures under intended identity with warning stack and bounded RSS/handles review. No listener-limit suppression. |
| PREP04-ACCESS | Local gcloud could not refresh its private credentials cache: filesystem write permission not granted; Cloud Console project selector did not load resources and reported request errors | Live cloud checks **BLOCKED**, not zero/absent resources. Do not bypass this by copying credentials or inventing live state. Restore authorized operator access before continuing. |

Local listener probe uses actual Storage SDK with HTTP server on127.0.0.1 and no cloud auth/objects. Initial reporting failed because SDK package.json is not an exported subpath; no PASS was reported then. Corrected reporting reran all100 reads successfully. The fixture does not test actual gaxios/ADC error/retry paths or prove bounded process memory; only per-stream listener observations are claimed.

## Candidate release record — PLAN, not an artifact
| Field | Frozen value / acceptance requirement |
|---|---|
| Source | e06d3de8e74bc7cb431734d32d339ef63e1824ef; this preparation PR changes documentation only |
| Target | project cootton-firebase, region asia-southeast1; existing cootton-api and compatible cootton-web |
| API build | Dockerfile.api from frozen source; registry asia-southeast1-docker.pkg.dev/cootton-firebase/cootton-containers/api |
| Web build | Dockerfile.web from same source; compare API02–04 proxy/status compatibility before deciding whether existing Web may be retained |
| New API/Web digest and build ID | **UNBUILT/UNRECORDED — mandatory STOP**; never use a mutable tag as the approved release |
| Runtime identity | Existing configured identity only, exact attached service account must be re-read; no privilege expansion |
| Environment | FIREBASE_PROJECT_ID=cootton-firebase; COOTTON_MEDIA_BUCKET=cootton-catalog-media-524673981677; publication flag true is historical baseline and must be re-read |
| Database secrets | Existing restricted reader/admin references; exact secret version pins must be re-read without exposing values; no maintenance credential in runtime |
| Data/schema | SQL001–006 unchanged; hash/applied-state read-only verification required; no migration as part of application deployment |
| Resources | Prior baseline1CPU/512MiB/port8080; actual concurrency, timeout, max instances and encoder memory/latency must be recorded and accepted before traffic |
| Product visibility | Preserve Boxy DRAFTv23/sample DRAFTv5, public catalog empty, noindex and commerce/points inactive; verify live rather than treating historical values as current |
| API rollback | Last verified cootton-api-act006-3c768d6; historical100% traffic. Retain and re-read revision before rollout |
| API rollback digest | asia-southeast1-docker.pkg.dev/cootton-firebase/cootton-containers/api@sha256:75065b4658ce021d8a7777f9261a9837759982954ff49b1b64b021538ee42d54 — historical preflight record, not revalidated here |
| Web rollback | Actual current Web revision/digest/traffic **UNRECORDED — STOP** |
| Traffic proposal | Existing100% ACT006 until no-traffic candidate checks pass; proposed5%→25%→100%, operator hold after each step. Schedule/observation window/error/latency thresholds unapproved: **STOP**, no automatic progression |

## Ordered execution and stop criteria
1. Restore authorized cloud access; read exact service/revision/traffic/identity/env/secret-version/resource and existing registry metadata. Preserve a sanitized manifest. Prove current SQL hashes and restricted-role capabilities without production writes.
2. Freeze candidate digests and encoder/base versions. Verify repeated normalization and original-key recovery with candidate container and isolated SQL. Compare old/new encoder bytes before resuming any unfinished media command; source success is not cross-encoder compatibility.
3. Under the intended service identity, read only the six retained fixture objects using pinned generation; confirm identity encoding, exact bytes and private metadata. A creator permission check and actual create-if-generation-match0 write require a separately bounded fixture authorization if not already in the release scope. Do not grant Token Creator or Storage Admin to manufacture evidence.
4. Investigate real SDK warning using existing-object reads, safe warning stacks, listener/active-handle/RSS observations over repeated workload; no new random fixture IDs, secrets, token logging or limit suppression. Unexplained growth/failed integrity is a STOP. Local100-read result alone cannot close this gate.
5. Complete required isolated identity/concurrency/publication-withdrawal checks and backup/restore/monitoring/threshold signoff. This plan does not close V01…V08 automatically. Full gates stay OPEN.
6. Present exact candidate API/Web digests, configuration diff, rollback manifest and allowed production checks for scoped release approval. Then deploy no-traffic revisions; existing IAM only, no new public tag/invoker exposure. Verify permitted readiness/read-only auth/public-denial checks before approved traffic steps.
7. At each step stop on authorization/visibility invariant failure, duplicate effects, overwrite/integrity mismatch, leaked transaction, incompatible Web status, unavailable encoder or required check failure. Missing baseline/threshold/signoff also stops progression.
8. After authorized rollout, verify exact201 replay, changed-fingerprint/new-key stale409, no duplicate version/audit/outbox/receipt and media recovery on the named nonpublic controlled product/prefix. Injected poster/SQL/COMMIT failures remain isolated unless explicitly approved for production. Never republish Boxy or replace a retry key after unknown503.
9. On STOP restore the recorded compatible traffic configuration to retained ACT006 (historically100%) and recorded Web rollback revision, after re-reading both. ACT006 predates API02–04 authorization/retry improvements: review this regression and contain affected Admin commands where necessary. Preserve SQL006, receipts, review history and private objects; no database rollback or orphan deletion. Observe independent durable state before retrying.
10. Append a deployment checkpoint with exact digests/revisions/timestamps/statuses/counts/limits; update traceability and gates only for observed scenarios.

## Gate disposition and handoff
**Merge complete; release preparation incomplete at cloud/artifact gates.** Immediate dependency is restored authorized cloud access, then service-identity proof and immutable candidate artifacts. No rollout approval is requested while these blockers remain. All ACCEPTED decisions, V001 and applied SQL001–006 remain unchanged; Kafka/microservices/orphan cleanup remain outside this scope.
