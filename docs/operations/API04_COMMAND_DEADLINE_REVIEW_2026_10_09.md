# API04 command deadline source review · 2026-10-09

Status: **45s COMMAND DEADLINE ACCEPTED BY USER — SOURCE CHECKS PASS at 92f4ec0; draft review/runtime evidence separate; API04 NOT READY FOR DEPLOY**.

## Authority and baseline

The user's latest instruction, “tiếp tục workflow”, continues API04 source/tests work after authorized review and merge of PR28 then PR29. PR29 merged at `02bfad3020f0265219055dd9991108cfa87f625c`; this change starts from that main commit. The implementation was proposed by the assistant. The user then explicitly accepted the 45s Admin command deadline; remaining operating thresholds and implementation/runtime evidence have separate states. No new deployment, traffic switch, IAM, production SQL, object write or object deletion is included.

The previously frozen API digest `sha256:7a053d1292af650ec14f207c4bc16562d5be5493209e2d655988ce35ba640017` predates this source change. Its SDK/read-only runtime evidence cannot certify this new source. ACT006 remains the serving checkpoint. See [SDK/HTTP evidence](API04_SDK_HTTP_OPERATIONS_EVIDENCE_2026_10_09.md), [configuration and threshold register](API04_RUNTIME_CONFIG_AND_THRESHOLDS_2026_10_09.md) and [rollback runbook](API04_ROLLBACK_RUNBOOK.md).

## Explicit approval evidence

Decision ID: **API04-DEADLINE-45-001**. Source: direct human user message in the current Work thread, 2026-10-09 (Asia/Saigon). Exact wording: **“chấp nhận mốc 45s”**. It replies to the preceding proposal of a 45-second Admin command deadline. This approval covers that value; it does not approve other thresholds, the implementation without review, an upward override, merge/deployment, production writes or a traffic switch. No message ID/export timestamp was provided; none is invented.

## Prepared behavior

- One monotonic request budget begins before the Admin command JSON parser. It includes parsing, identity verification, pool acquisition, SQL, media preparation, native reads and immutable uploads. Scope: `POST /v1/admin/catalog/commands`; other endpoints retain their existing behavior.
- User-approved Admin command deadline: **45,000ms**, below the last observed 60s API serving timeout. `COOTTON_COMMAND_DEADLINE_MS` rejects malformed values and values outside 1,000–150,000ms. An upward override needs coordinated API/Web timeout review; this patch neither applies nor approves such a configuration. The earlier 150s command budget is superseded by this 45s decision. The 180/195/210s extension scenario is historical and unapproved; other performance/monitoring thresholds remain unapproved.
- Deadline expiry produces one safe HTTP503 envelope with `no-store` and `nosniff`. A late verifier result cannot authorize a command; later errors cannot write a second response. Disconnection also cancels the command context.
- Pool acquisition completing late destroys its acquired lease. Deadline, connection failure or SQL error discards the checked-out lease; later SQL cannot reuse it. TLS, credentials, role grants, schema and existing transaction/idempotency rules are preserved.
- Encoder subprocesses receive the shared abort signal and the remaining stage budget. Direct processes are killed with SIGKILL and awaited through close before media slot release or temporary-directory removal. No shell or new input protocol is introduced.
- Native pinned media reads abort their transport and dispose readers/listeners. Read-only opaque waits may settle later but cannot start subsequent command work.
- Immutable SDK saves keep generation-zero preconditions. A dispatched opaque SDK write may settle after HTTP503: the media slot stays occupied until settlement, and the shared budget forbids the next poster/SQL/COMMIT step. The SDK per-call timeout is capped by the remaining budget and 10s; it is not proof that all remote writes/retries were physically cancelled.

## Uncertain outcomes and retry

Disconnection or timeout after sending COMMIT is not proof of rollback. Never delete media on SQL catch or uncertain COMMIT. Reauthorize and retry the exact original request and key; a durable receipt returns the original result without duplicating command/audit/outbox rows. If upload completed but no receipt exists, immutable generation/bytes verification still governs recovery. Retention, durable external intent, orphan cleanup and restore remain **API04-RECOVERY-002 OPEN**.

Physical cancellation of in-flight opaque SDK writes and Sharp work is not claimed. A source HTTP deadline bounds admission and response, not guaranteed provider quiescence; deadline-sensitive downstream effects are gated and uncertain dispatched effects retained for reconciliation.

## Verification scope and observed results

`verification/command-budget.cjs` exercises compiled production helpers: concurrent contexts, late identity/read completion, delayed pool acquisition, discarded SQL leases, real child-process termination, native-reader cancellation, opaque immutable-write late settlement, actual Nest late-verifier response, and a stalled body parser. No Firebase or GCS operation occurs in these tests.

`verification/command-deadline-db.cjs`, invoked by the existing database fixture, requires localhost, database `cootton_api_test` and user `cootton_test` before connecting. It checks an actual `pg_sleep` lease timeout and healthy replacement, then a restricted-role actual COMMIT with delayed acknowledgement followed by exact-key receipt replay and stable atomic counts. All DDL/grants/data are disposable fixture work inherited from the existing test; no production maintenance credential is used.

Existing Foundation CI continues the full authorization, HTTP, media recovery and database verification. Container CI compiles the actual API image and keeps native-read and real short-video checks. Check results must be recorded against the final source head; pending tests are not PASS.

Remaining release evidence: a new frozen build of this exact source, real Firebase identity matrix, service-account positive public media and immutable 412 recovery, paired API/Web HTTP evidence, maximum video/input and concurrency/load under serving constraints, approved thresholds/monitor ownership, full role/column/function denial proof, rollback/backup restore, schema/config recheck and the unresolved recovery policy. No production gate is closed by this proposal alone.

## Implementation references

- [Node24 child-process documentation](https://raw.githubusercontent.com/nodejs/node/v24.21.0/doc/api/child_process.md): AbortSignal and kill signal support. Tests must still observe child close.
- [node-postgres pool API](https://node-postgres.com/apis/pool): `client.release(true)` discards a pooled connection. This does not establish the outcome of a dispatched COMMIT.

## Evidence register

| Item | State | Meaning |
| --- | --- | --- |
| User continuation | EXPLICIT USER REQUEST | Source workflow continuation; no numerical operating signoff |
| 45s Admin command deadline | ACCEPTED — EXPLICIT USER APPROVAL | Current Work thread, 2026-10-09: “chấp nhận mốc 45s”; no runtime configuration applied |
| Implementation of the accepted deadline | ASSISTANT PROPOSAL / UNDER REVIEW | Requires final-head CI and separate exact-build/runtime evidence |
| New source tests and CI | PASS — OBSERVED SOURCE CHECKS | Exact tested source92f4ec0; run/log references below; no runtime acceptance implied |
| Old 7a053 candidate probes | HISTORICAL OBSERVED | Different source; cannot transfer certification |
| Real deployment, maximum-load and operating signoff | MISSING / OPEN | API04 remains NOT READY |

## Reviewed source checkpoint

Exact tested source: `92f4ec008d9c773b09a2d327dd75ae6206a105ed`, tree `fdce9ae3f83674e7c9490e07aa4bd22cf5007feb`, base main `02bfad3020f0265219055dd9991108cfa87f625c`. [PR30](https://github.com/Cootton/CoottonPlatform/pull/30) remains draft/unmerged. A later evidence-only commit may update this document; these observed results refer specifically to the source checkpoint above. PR checks record the latest head status.

- [Foundation37861076535](https://github.com/Cootton/CoottonPlatform/actions/runs/37861076535): SUCCESS. Full build/type checks, contracts12/12; API38 passed,0 failed,1 skipped; disposable database2/2 passed. The skipped API short-video fixture was not supplied to that general suite; the actual playable encoder/SQL recovery check ran successfully in the database suite and the actual short-video container check also passed.
- [Container37861076464](https://github.com/Cootton/CoottonPlatform/actions/runs/37861076464): SUCCESS for API and Web, no credentials/deployment. API native-read5/5 and actual short-video2/2 passed. These are ephemeral CI builds, not a registry-frozen serving candidate.
- `REL04-DEADLINE-DB-001`: actual pg_sleep lease discarded; replacement lease healthy; actual restricted-role COMMIT completed before delayed acknowledgement/deadline503; exact request/key replay preserved one command/audit/outbox. This is a disposable local PostgreSQL fixture, not a production write or real Firebase identity acceptance.
- Nine new compiled-helper/HTTP deadline tests passed. Native-read cancellation and encoder child-close proof passed; late upload fixture retained its one immutable object and did not start poster/deletion. Opaque media-slot lifetime follows awaited settlement in source; no provider-wide physical-cancellation proof is claimed.
- Compared15 changed files with base main: source, fixtures, package verification script and two operations documents only. V001, business contracts, lockfile, Dockerfiles, applied migrations001–006, credential/TLS pool construction and feature flags unchanged. Two updated documents contain seven valid local file links.

Failures preserved: initial source `cd45015a` failed Foundation37860759487 / Container37860759483 on proxy-handler syntax; corrected `2b40174a` built/type-checked but Foundation37860878573 failed an existing HTTP fixture lacking EventEmitter lease methods. Final source updates corrected the fixtures instead of weakening the production pool adapter. Legacy borrowed-writer fixtures emulate disposal through test-only rollback; new deadline tests exercise actual pooled lease destruction separately.

**No blocking source finding remains in this scoped review.** This is assistant review, not independent reviewer signoff or release acceptance. Maximum-video/concurrency/resource behavior under45s and all separately listed release gates remain OPEN.
