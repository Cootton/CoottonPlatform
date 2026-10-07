# API-04 — Separate deployment and runtime verification plan
`PLAN-API04-DEPLOY-001` · 2026-10-08 · PROPOSED; execution NOT STARTED.

## Authority and reading order
Read [merge checkpoint](API04_MERGE_CHECKPOINT_2026_10_08.md) → [transaction/media contract](../contracts/API_TRANSACTION_MEDIA_RECOVERY.md) → [API-03 authorization](../contracts/API_AUTHORIZATION_MATRIX.md) → [source evidence](../governance/API04_EVIDENCE.md) → this plan. Preserve RULE-API-001 and prior ACCEPTED decisions. Merge/source CI is distinct from deployed evidence. This plan authorizes no deployment, IAM grant, migration, publication, production fault injection or object deletion.

ACT006 is the last verified production checkpoint: API `cootton-api-act006-3c768d6`, source `3c768d61b7687bd92a8564f42a34151f231eec62`. Re-read actual revision, traffic, flags and data before execution; these recorded values are not a live observation on 08/10. Boxy DRAFTv23/sample DRAFTv5 and empty public catalog are preserved expectations pending that check.

## Release preflight — REL04-P01
- Freeze the merged source SHA recorded in the checkpoint; build API and Web immutable artifacts from that source. Record real build IDs/digests, dependency/encoder versions and compatibility. GitHub container checks prove builds, not registry artifacts or deployment.
- Verify hashes and applied status of SQL001–006; this patch contains no migration. Do not rerun maintenance merely to deploy application code.
- Compare runtime environment and pinned secret references without exposing values. Confirm existing restricted writer/reader roles, human Firebase provider and matching project, singleton owner admission, SELECT-only principal access, private bucket create/read and generation preconditions. Missing rights/configuration are a STOP, not permission to widen grants.
- Retain noindex, inactive commerce/points/public video and existing feature flag values. Match API/Web response compatibility:201 replay, safe400/401/403/404/409/413/415/503. Record resource/concurrency limits and observed baseline latency/errors; do not invent an SLO.
- Retain previous API and Web immutable revisions/digests and actual traffic settings for rollback. Current old API may lack new authorization/retry protections; review that regression before calling rollback safe.
- Execution requires a scoped release assignment naming target services, artifacts, traffic change and operator. Production test writes/faults need their own explicit scope, product/object IDs and cleanup policy.

## Isolated runtime verification — REL04-V01…V08
Use an isolated database with001–006 and the normal restricted roles, a dedicated private storage prefix/bucket, a verified human test owner and synthetic nonpublic products. Fault controls stay in the isolated harness; do not add a production bypass. Persist receipts and use independent SQL connections for counts. A rollback-only transaction cannot prove durable HTTP COMMIT recovery.

| ID | Scenario | Required evidence |
|---|---|---|
| REL04-V01 | Actual Firebase SDK admission; missing/invalid token, verified nonowner, revoked owner, anonymous/custom provider; publication flag off |401/403 or readiness409 as contracted; no receipt/media access or mutation for denied request; verifier outage fails closed503 |
| REL04-V02 | Exact successful command replay and reordered object keys; same key with changed payload; new key with stale version |201/original result; no duplicate version/audit/outbox/receipt;409 conflicts; replay result distinguished from current detail |
| REL04-V03 | COMMIT completes but HTTP acknowledgement is lost through isolated transport control; retry exact request/key | Durable result from independent connection; recovery201, exactly one business effect/audit/outbox/receipt and cache revalidation. No arbitrary new key after503 |
| REL04-V04 | Fail after business/audit before outbox/receipt; two independent concurrent commands with same expectedVersion | Full rollback for failed transaction; one winner/one409 for concurrent commands; no leaked pooled transaction |
| REL04-V05 | Real GCS immutable object already exists; retry image/thumbnail; generation/content/MIME/cache/size mismatch | Generation-match0/412 verified; exact bytes accepted, mismatch503; object never overwritten/deleted; DB attachments/receipt counted |
| REL04-V06 | Real gzip/unsupported-encoding object and bounded-read fault transport that ignores Range or truncates | Encoding rejected before stream; decompress=false; local overflow/mismatch destroys stream and stops tail consumption. Actual GCS test and injected transport proof are labeled separately |
| REL04-V07 | Real private video write succeeds, poster write fails; retry; media prepared then SQL fails; stale new-key retry | Exact video reused, missing poster created; one attachment/receipt after recovery; no SQL references before success, no processing on receipt replay/stale request. Use controlled licensed fixture and pinned encoder to assess deterministic output |
| REL04-V08 | Public cache cold/warm withdrawal in isolated complete publication journey | Detail/media404 and product absent from catalog after withdrawal; private object existence confers no public visibility. Outbox persistence does not certify worker consumption |

Record endpoint/action, exact source and artifact, environment/date, fixture identity alias, safe requestId, generation, status, version and SQL counts; do not record tokens/base64/private rights/secret values. Cover retries with bounded operator attempts; persistent503/409 stops for reconciliation, never automatic overwrite/key replacement. Enumerate which actions were tested; these scenarios do not certify every transition of all13 actions.

## Production rollout — REL04-R01
After isolated evidence and release scope approval: deploy a no-traffic API revision, verify readiness and permitted health/catalog/withdrawn/private-denial HTTP checks using its actual revision route. Check corresponding Web artifact separately. Apply the explicitly approved canary/traffic schedule; record actual percentages and timestamps. Do not expose a new public service/tag or grant invoker access as an implicit test workaround.

Production acceptance first compares read-only baseline: catalog empty/commercefalse, withdrawn detail/media404, no private fields, expected401 for unauthenticated Admin. Valid owner checks require a current owner session. Positive media-upload/retry/withdraw verification requires a separately named controlled product/prefix and approved durable writes; do not republish Boxy or invent business facts. Do not infer production retry success from isolated evidence.

## Stop, recovery and evidence — REL04-R02
Stop rollout on authorization/visibility invariant failure, duplicate effects, media overwrite, integrity bypass, transaction leak, incompatible Web errors or failed required checks. For availability/performance, compare the recorded baseline and release-approved thresholds; missing thresholds keep that acceptance item OPEN.

Restore the recorded compatible API/Web traffic configuration or contain affected commands while preserving receipts, migrations and private objects. Re-read independent durable state after an unknown COMMIT; retry the original request only while still authorized. Do not roll006 back, purge receipts, remove review history or delete orphan bytes as a recovery side effect. Observe existing attached grants/flags after rollback and record any protection regression.

Append exact pass/fail evidence and limits in a new deployment checkpoint and link CURRENT_STATE/TRACEABILITY/GATE_EVIDENCE/CHANGELOG. Plan or merge never substitutes for that checkpoint. `API04-RECOVERY-002` (intent ledger, retention, orphan reconciliation/delete, backup/restore) and full Production Gates remain OPEN. No cleanup worker, Kafka or delegated staff/AI access is introduced.
