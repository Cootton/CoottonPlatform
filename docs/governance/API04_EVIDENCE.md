# API-04 verification evidence

ID: `API04-EVIDENCE-001`. Date:2026-10-07. Base: API03 PR22 head f9557969fa978a4e77fe0e092b478a233a6cdd8b. Production authority remains ACT006; no runtime operation performed.

Prepared source: verified412 reuse, partial video/poster persistence helper, cache invalidation on replay, pooled connection discard on rollback failure. Tests: [storage recovery](../../apps/api/verification/media-recovery.cjs), [disposable PostgreSQL](../../apps/api/verification/admin-authorization-db.cjs). Trace: [API04 contract](../contracts/API_TRANSACTION_MEDIA_RECOVERY.md), [ADR0009](../adr/0009-command-media-recovery.md).

Local: Node syntax checks passed for both CJS files. Windows dependency installation remains unavailable from previous tasks; local build/runtime test success is not claimed. Linux CI results will be recorded against exact source SHA.

| Gate | Evidence / state |
|---|---|
| API04-T01–T04 | PASS on source7a3aa187; real disposable PostgreSQL, API04-T01–T04 assertions |
| API04-T05 | PASS on source7a3aa187; actual helper with Storage transport fixture |
| Source build/contracts/API/containers | PASS on source7a3aa187; scoped CI only |
| Production transactions/media retry | OPEN; no deployment or production test |
| API04-RECOVERY-002 durable intents/cleanup/retention | PROPOSED/OPEN; no delete/worker/migration |
| Full Production Gates | OPEN; source CI cannot close launch, backup/DR, delegated authorization or commerce |

The PostgreSQL test executes real schema001–006 and writes only in a strictly checked loopback disposable database. Storage transport is stubbed; normalized video fixture bypasses ffmpeg only for persistence/retry testing. Optional real-video encoder test keeps its explicit SKIP when no fixture supplied.


## Repository checkpoint

Prepared source commit: `5d61f899ca5a8926401c8aac24e3814030556d4b`. Branch: `fix/api04-transaction-media-recovery-2026-10-07`, intended review base: PR22 branch. Relative Markdown targets checked: 100, missing:0. V001 and migration001–006 blob hashes unchanged from base.

PR creation initially failed: connector internal errors, and the GitHub web form returned HTTP500. No PR number, merge or Actions PASS is inferred from those attempts. Validation continues through branch-push Foundation checks; container checks require PR creation or separately authorized workflow dispatch.


## Resumed2026-10-08 (Asia/Saigon)

GitHub recovered; [PR23](https://github.com/Cootton/CoottonPlatform/pull/23) was created on PR22 base. Initial source Foundation[37687525008](https://github.com/Cootton/CoottonPlatform/actions/runs/37687525008) failed only the DB fixture's Date-vs-JSON-string deep comparison; build/check/contracts and API21PASS/1SKIP passed. Container[37687525021](https://github.com/Cootton/CoottonPlatform/actions/runs/37687525021) SUCCESS. Documentation head78eae803 reproduced the fixture failure (Foundation37687555720), Container37687555595 SUCCESS. Historical initial branch-push37655553936 was startup_failure during GitHub outage, not an application test result.

The fixture now compares the JSON transport representation, retaining exact result equality and effect-count checks. The repaired source subsequently passed CI below; failed history preserved. No production activity occurred.


## EVD-API04-001 · Verified2026-10-08 (Asia/Saigon)

Exact tested source: `7a3aa18739e18a1e931efd348982695bcd79abb2`. [Foundation37687748134](https://github.com/Cootton/CoottonPlatform/actions/runs/37687748134) SUCCESS: build/check, contracts12PASS, API21PASS/1SKIP, PostgreSQL2PASS/0SKIP. [Container37687748147](https://github.com/Cootton/CoottonPlatform/actions/runs/37687748147) SUCCESS for API and Web. PostgreSQL count is two suites, with API04-T01–T04 assertions within the owner/transaction suite; do not label it as only two individual scenarios.

The optional real-video encoder fixture is the one SKIP; partial video persistence/retry uses bounded normalized fixture bytes with a Storage transport stub. CI is not actual Firebase/GCS IAM, DB failover or production media cleanup evidence. Current PR23 includes a documentation-only evidence follow-up; the tested source remains this SHA. Review/merge and scoped deployment/runtime proof are pending. Full gates and API04-RECOVERY-002 remain OPEN.


## PR23-F001 · 2026-10-08 · prepared fix

Review identified that byte-range alone does not ensure bounded memory for existing encoded objects. Source now denies gzip/unsupported encoding before opening storage stream, disables SDK decompression and incrementally compares bytes with an exact local length limit. Overflow/mismatch/error/EOF release the stream; no whole-object recovery Buffer is allocated.

Regression tests: gzip/br/deflate/unknown/empty encoding deny without any stream; absent/identity remains supported; transport ignoring range is destroyed without consuming a1MiB tail; truncated stream fails. Existing pinned generation/integrity/partial-video checks retained. Node syntax passed; CI for this fix pending. Earlier PASS evidence applies to the earlier source and does not certify this new patch. No production operation or gate promotion.
