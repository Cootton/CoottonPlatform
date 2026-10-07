# API-04 verification evidence

ID: `API04-EVIDENCE-001`. Date:2026-10-07. Base: API03 PR22 head f9557969fa978a4e77fe0e092b478a233a6cdd8b. Production authority remains ACT006; no runtime operation performed.

Prepared source: verified412 reuse, partial video/poster persistence helper, cache invalidation on replay, pooled connection discard on rollback failure. Tests: [storage recovery](../../apps/api/verification/media-recovery.cjs), [disposable PostgreSQL](../../apps/api/verification/admin-authorization-db.cjs). Trace: [API04 contract](../contracts/API_TRANSACTION_MEDIA_RECOVERY.md), [ADR0009](../adr/0009-command-media-recovery.md).

Local: Node syntax checks passed for both CJS files. Windows dependency installation remains unavailable from previous tasks; local build/runtime test success is not claimed. Linux CI results will be recorded against exact source SHA.

| Gate | Evidence / state |
|---|---|
| API04-T01–T04 | Prepared disposable PostgreSQL checks; CI pending |
| API04-T05 | Prepared actual persistence helper + Storage transport fixture; CI pending |
| Source build/contracts/API/containers | CI pending |
| Production transactions/media retry | OPEN; no deployment or production test |
| API04-RECOVERY-002 durable intents/cleanup/retention | PROPOSED/OPEN; no delete/worker/migration |
| Full Production Gates | OPEN; source CI cannot close launch, backup/DR, delegated authorization or commerce |

The PostgreSQL test executes real schema001–006 and writes only in a strictly checked loopback disposable database. Storage transport is stubbed; normalized video fixture bypasses ffmpeg only for persistence/retry testing. Optional real-video encoder test keeps its explicit SKIP when no fixture supplied.


## Repository checkpoint

Prepared source commit: `5d61f899ca5a8926401c8aac24e3814030556d4b`. Branch: `fix/api04-transaction-media-recovery-2026-10-07`, intended review base: PR22 branch. Relative Markdown targets checked: 100, missing:0. V001 and migration001–006 blob hashes unchanged from base.

PR creation initially failed: connector internal errors, and the GitHub web form returned HTTP500. No PR number, merge or Actions PASS is inferred from those attempts. Validation continues through branch-push Foundation checks; container checks require PR creation or separately authorized workflow dispatch.
