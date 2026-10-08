# API-04 — Real encoder / SQL recovery and Firebase follow-up
`EVD-REL04-VIDEO-SQL-001` · 2026-10-08 · rollout NOT STARTED.

Read [preflight checkpoint](API04_PREFLIGHT_ISOLATED_EVIDENCE_2026_10_08.md) and [deployment plan](API04_DEPLOYMENT_PLAN.md). This follow-up preserves their recorded source/environment boundaries.

## CI PASS — actual video encoder, HTTP and disposable PostgreSQL
Source `7e3f5ecdc663520e668d428be716ea19b258e4d9`; [Foundation37717767232](https://github.com/Cootton/CoottonPlatform/actions/runs/37717767232), job113118122562 SUCCESS: contracts12, API24/1SKIP, PostgreSQL2. Container37717772795 SUCCESS. Parallel PR Foundation37717772635 was still in progress when this record was prepared; do not infer its result.

[Harness](../../apps/api/verification/api04-video-sql-recovery.cjs) is invoked from the guarded localhost PostgreSQL HTTP helper in CI. It generates a solid-black 720×406 H264 clip locally, with no third-party/customer content. FFmpeg observed6.1.1-3ubuntu5; two normalizations produced identical video/poster bytes, bounded valid stream metadata and moov-before-mdat faststart output. This is reproducibility within this encoder environment, not cross-version determinism or human playback acceptance.

Actual HTTP uploadVideo and restricted-role PostgreSQL prove:
1. Injected poster save failure returns503 before SQL attachment; exactly one storage fixture object remains.
2. Same-key retry completes poster, then injected outbox SQL failure rolls back evidence/attachment/version/audit/outbox/receipt.
3. Same-key retry reuses both immutable outputs, COMMIT succeeds and an injected lost acknowledgement returns503. Independent connection sees exactly one new evidence/video_asset/product_video/audit/outbox/command and product version2.
4. Exact replay returns201/original result without video processing; changed payload/new-key stale version return409 without processing or duplicated effects.
5. Cooperating owner revocation denies video receipt replay403; runtime writer cannot UPDATE video approval42501.

Storage and identity in this CI run are **explicit transport fixtures**. The existing API video test's skip remains recorded; the new integrated helper actually runs the encoder and SQL scenarios.

## Real GCS follow-up — PASS, isolated SQL and operator ADC
Owner explicitly approved **two additional** private video/poster objects, bringing the total fixture budget to six, plus PostgreSQL16 temporary on Cloud Shell localhost only. Optional real-GCS mode is disabled in CI and requires exact project/bucket/scope flags, bucket uniform/PAP checks and exactly two precomputed output paths. No automatic rerun with fresh IDs, delete, IAM change, production database write or publication.

Manual launcher first stopped before any Docker/GCS operation because its task-directory variable was not exported to the child shell. Corrected invocation passes that variable explicitly. This failed launch created zero additional objects. The corrected invocation subsequently PASSed both PostgreSQL tests and REL04-VIDEO-SQL-001 with real GCS. Exactly two additional objects were retained: video generation1791426801241775,2204 bytes,video/mp4; poster generation1791426801948489,294 bytes,image/webp; both private,no-store. Total approved fixture count is six. Exact names remain in the local manifest. PostgreSQL was disposable/localhost; identity remained a transport fixture.

The real run observed repeatable encoder bytes, pinned generation reuse, partial poster recovery, SQL rollback with no attachment, durable COMMIT with one evidence/video attachment/audit/outbox/receipt, exact201 replay,409 without processing and cooperating canonical-owner revocation403. Source7e3f5ecd, Cloud Shell operator ADC; no Cloud Run service-identity operation or deployed application recovery claimed.

Nonfatal SDK/stream warnings reported11 error/close listeners on a PassThrough (MaxListenersExceededWarning). Passing this bounded run does not prove a leak or its absence. Preserve the warning for transport/dependency and repeated-workload investigation; do not suppress it with a larger listener limit to manufacture clean evidence.

## Firebase — OPEN, observed login blocker
The Admin page showed auth/network-request-failed; owner reported the same error in regular Chrome/Edge. No successful new human ID token or SDK verifyIdToken(...,true) evidence exists.
- Source uses inMemoryPersistence; opening a new Admin tab does not restore the former session.
- Read-only HTTP Admin response had no Content-Security-Policy header.
- A REST probe used the page's existing Firebase Web API key with no email/password, and actual Admin Origin/Referer. Firebase responded400 MISSING_EMAIL with Access-Control-Allow-Origin matching that Admin origin. Public authDomain was cootton-firebase.firebaseapp.com.
- This proves connectivity/CORS for that synthetic empty-credential probe only. It does not certify provider/key configuration, actual credential-bearing browser request, project/user admission, revocation, freshness, nonowner or SDK outage behavior.
- Browser logs exposed no request diagnostic; root cause remains unresolved. Next diagnosis needs the failing login request's HTTP status/network error and host, with no query key, token, password or response user data exported. Do not weaken restrictions, mint custom tokens, change credentials or revoke the production owner to fabricate a passing test.

REST probe behavior follows [Firebase Auth REST reference](https://firebase.google.com/docs/reference/rest/auth); the SDK error is documented by [Firebase auth errors](https://firebase.google.com/docs/reference/node/firebase.auth.Error). Transport evidence is not actual identity verification.

REL04-V01 and full Production Gates remain OPEN. REL04-V07 now has real encoder/GCS/isolated SQL recovery evidence for the stated scenarios; it does not certify production runtime service identity, human playback, cross-encoder determinism or release. ACT006 remains deployed authority; all ACCEPTED decisions and applied SQL001–006 are preserved.
