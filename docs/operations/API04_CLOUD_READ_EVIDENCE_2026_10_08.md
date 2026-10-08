# API-04 — Cloud Shell read checkpoint
`PREP04-CLOUD-READ-003` · `EVD-REL04-CLOUD-001` · 2026-10-08 · **configured service/revision/IAM read COMPLETE; NOT READY TO DEPLOY**.

## Authority, source and evidence boundary
Owner assigned reauthentication and read-only preflight, then synchronization of PR26. The agent ran the existing reviewed helper from commit `a137fbd2fda6c21658f3b184c7f89e82c17abf25` directly in the operator's Cloud Shell. No cloud resource writes, IAM grants, deployment, product commands, secret-value retrieval or additional fixtures occurred.
Read order: [current state](../governance/CURRENT_STATE.md) → [release preparation](API04_RELEASE_PREPARATION_2026_10_08.md) → this checkpoint → [deployment plan](API04_DEPLOYMENT_PLAN.md).

The directly observed run started at **2026-10-08T08:14:00.346561+00:00** (15:14:00 Asia/Saigon). The complete filtered helper output was saved to a temporary Cloud Shell report; a compact projection parsed it successfully and returned to the terminal prompt. The agent read the resulting service/traffic/identity/IAM summary in the browser. No terminal account identifiers, OAuth URL, auth code, token or raw service JSON are included here.

The helper emits no `status` field on success. A summary using `get("status")` therefore showed null; this is not a failed or incomplete success report. Failure output explicitly contains STOP and a reason. Earlier requests to obtain a success status field were incorrect.

## Observed service and rollback identifiers
| Field | API | Web |
|---|---|---|
| Project / region | cootton-firebase / asia-southeast1 | same |
| Service | cootton-api | cootton-web |
| Latest ready revision | cootton-api-act006-3c768d6 | cootton-web-00006-7c9 |
| Traffic | 100% to cootton-api-act006-3c768d6 | 100% to cootton-web-00006-7c9; latestRevision=true |
| Attached service account | cootton-auth-verifier@cootton-firebase.iam.gserviceaccount.com | cootton-web-runtime@cootton-firebase.iam.gserviceaccount.com |
| Configured immutable image | `asia-southeast1-docker.pkg.dev/cootton-firebase/cootton-containers/api@sha256:75065b4658ce021d8a7777f9261a9837759982954ff49b1b64b021538ee42d54` | `asia-southeast1-docker.pkg.dev/cootton-firebase/cootton-containers/web@sha256:92d914e98c00088a35cc32042c6300c62eb526f7fece7f9b2d534f78122aeb2a` |

The API digest matches ACT006. This is current baseline evidence at the recorded time, not an API-04 deployment. API traffic is pinned to its named revision; Web traffic follows latestRevision. Preserve this distinction in the rollback manifest: restoring a named Web revision at100% may pin traffic and change the previous latestRevision behavior, so the intended rollback mapping requires review.

Prior operator-pasted filtered fragments reported the same ready-revision resolved digests, API Ready/Active/container conditions True, Web service Ready/ConfigurationsReady/RoutesReady True, and both services'1CPU/512MiB/port8080, concurrency10, timeout60seconds, maxScale1. They also reported API FIREBASE_PROJECT_ID=cootton-firebase, COOTTON_MEDIA_BUCKET=cootton-catalog-media-524673981677 and COOTTON_PUBLICATION_ENABLED=true; database secret references pinned to version1. These details are **operator-reported**, distinct from the compact fields independently read above. Secret values were neither supplied nor retrieved. Re-read full configuration and confirm capacity/encoder workload before release; metadata does not certify application behavior.

## Configured IAM — current bounded observation
Bucket `cootton-catalog-media-524673981677` has unconditional `roles/storage.objectCreator` and `roles/storage.objectViewer` bindings for the attached API account. Project IAM has unconditional `roles/firebaseauth.viewer` for that account.
This proves matching configured bindings, not effective runtime create/read/generation-precondition operations. The helper uses operator credentials; it does not impersonate or execute as the API account. Inherited policies/deny constraints, object integrity, Firebase admission and private storage enforcement are not certified by these bindings.

## History and explicit supersession
- PREP04-CLOUD-READ-002: operator-reported STOP at07:37:59Z, followed by AUTH_REQUIRED at07:40:22Z and07:50:30Z; failed before obtaining services. These remain historical failure evidence, not absent resources.
- Operator subsequently reported the direct service-name read returning cootton-api. A partial successful helper report at08:11:51.003100Z preceded the direct run above.
- PREP04-CLOUD-READ-003 supersedes “Cloud Shell execution pending/live cloud reads blocked” only for this completed operator configuration read. The local Windows gcloud credential-cache permission limitation is unchanged. No specific session-policy/network root cause was established.
- Existing PREP-REL04-001, ACT006-RUNTIME-001, ACCEPTED decisions and source freeze `e06d3de8e74bc7cb431734d32d339ef63e1824ef` remain. The previously missing Web revision/digest/traffic baseline is now recorded; actual rollback availability, compatibility and execution are unverified.

## Traceability and remaining gates
| Requirement / check | Evidence | Disposition |
|---|---|---|
| PREP04-ACCESS: authorized operator config read | PREP04-CLOUD-READ-003 | COMPLETE for this run; recheck before release |
| PREP04-SA: actual attached account and configured IAM | EVD-REL04-CLOUD-001 service + bindings | Config evidence COMPLETE; effective runtime GCS operations OPEN |
| Rollback baseline identifiers | current API/Web revision/digest/traffic above | Recorded; rollback validation and API02–04 protection regression review OPEN |
| PREP04-ENC | exact candidate registry digest, encoder/base versions and compatibility not obtained | OPEN / mandatory STOP |
| PREP04-SDK | actual SDK warning/repeated workload under intended identity not resolved | OPEN |
| API04-RECOVERY-002 / full Production Gates | this read adds no runtime recovery, restore or release signoff | OPEN; no gate-wide promotion |

SQL hash/applied-state checks, restricted database-role capabilities, current product/public visibility, complete identity/withdrawal matrix, monitoring/SLO/stop thresholds and reviewer approvals remain required as applicable. Candidate images remain UNBUILT/UNRECORDED. No rollout approval follows from this checkpoint.
