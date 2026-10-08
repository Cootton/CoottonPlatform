# API-04 — Transaction, idempotency, version and media recovery

> **FIX04-READ-OPS-001 · 2026-10-09:** SDK body reads are replaced in source `988c8a83…` by the bounded native generation-pinned reader, retaining metadata/integrity/authorization and immutable SDK save semantics. Historical SDK `decompress:false`/stream-destroy descriptions below refer to the earlier implementation; current helper rejects non-identity encoding and cancels/releases native body in finally. [Latest runtime evidence](../operations/API04_SDK_HTTP_OPERATIONS_EVIDENCE_2026_10_09.md) gives scoped1.000read/0warning PASS; full identity/write/publication/operations gates remain OPEN. ACT006 has not received this source.

Stable ID: `API04-TX-001`. Status: source proposal for review, stacked on API-03; production validation OPEN. [ADR0009](../adr/0009-command-media-recovery.md) records implementation choices. [Evidence](../governance/API04_EVIDENCE.md) distinguishes CI from runtime.

## Reading order and authority

Read [Master Plan](../../COOTTON_MASTER_PLAN.md), [current runtime](../governance/CURRENT_STATE.md), [endpoint contracts](API_ENDPOINT_CONTRACTS.md), [authorization matrix](API_AUTHORIZATION_MATRIX.md), then this contract and evidence. RULE-API-001 remains ACCEPTED. V001, D01 and migrations001–006 remain unchanged. ACT006 is the runtime authority; this proposal does not deploy, publish, revoke, delete or close full Production Gates.

## Request/response, permission and data rules

The existing `POST /v1/admin/catalog/commands` contract remains: UUID-v4 `key`, exact allowed `action`, action-specific `payload`; product commands additionally require UUID-v4 `id` and decimal-string positive `expectedVersion`. Backend verifies current singleton human owner, operation capability and feature readiness before receipt admission, again inside the transaction. Client claims/role names confer no authority.

Success and exact replay return201 with the persisted result. Replay is an acknowledgement of the original command, not a fresh product detail; fetch detail to obtain current version.400 invalid input/limits;401 unauthenticated;403 denied;404 missing resource in the locked transaction;409 fingerprint/version/lifecycle/constraint conflict;413/415 parser errors;503 dependency/media/recovery failure. Media preflight currently maps absent or non-DRAFT/stale target to409. Safe envelope and no-store headers follow API-02.

| Action group | Version / business effects | Transaction boundary |
|---|---|---|
| createDraft | No target/version; creates DRAFT v1 under configured singleton seller | Product + audit + outbox + receipt |
| addDictionary | No target/version; controlled dictionary/source result | Dictionary/source writes + audit + outbox + receipt |
| saveDraft / saveIntake | Matching locked product version and DRAFT; sourced fields/SKUs, increment product version | All SQL writes + audit + outbox + receipt |
| uploadImage / uploadVideo / setImageColor | Matching DRAFT/version and owned attachment/active color; bounded media limits; increment version | Immutable private object preparation BEFORE SQL; attachment/evidence + version + audit + outbox + receipt IN SQL |
| submit / approve / publish / returnDraft / unpublish | Feature readiness + publication state machine, reviewed-version checks, matching expectedVersion | Canonical state/review/public projection + audit + outbox + receipt; no media/network in SQL |
| archive | Matching version, non-ARCHIVED, reason; increment version and withdraw visibility | State + public visibility + audit + outbox + receipt; immutable history retained |

Catalog commands do not execute payment/ledger writes. Outbox is a persisted intent, not evidence that a worker consumed or projected it. No worker/queue/Kafka is activated.

## Invariants and retry procedure

- `API04-I01`: SQL success commits the business effect, audit, outbox and durable receipt together. Failure before COMMIT rolls all back.
- `API04-I02`: receipt scope is principal + operation + key; fingerprint is SHA256 of canonical raw request with sorted object keys, preserving array order and values. Key/order-equivalent objects replay; changed fields, version or payload under the same key return409. Fingerprint is not a public secret/token.
- `API04-I03`: inside SQL, the subject advisory guard serializes singleton commands/cooperating owner revocation; then reauthorization, receipt lookup, product FOR UPDATE and expectedVersion validation. Receipt lookup precedes current product version so the exact original request remains replayable after the version advanced.
- `API04-I04`: response timeout/503 or lost COMMIT acknowledgement is an uncertain result. Retry the EXACT original request/key while authorization remains valid. Never create a fresh key automatically. A successful replay invalidates local public cache again. Other replicas continue existing canonical visibility/version revalidation.
- `API04-I05`: a new edit after409 must read latest detail, reconcile intent and issue a new command/key with current expectedVersion. Failed commands have no success receipt; changed retry under a previously failed key is not reserved by an intent ledger.
- `API04-I06`: object creation uses generation-match0;412 alone is insufficient. Reuse requires matching byte size, MIME, private/no-store metadata and exact bytes streamed from the pinned generation. Only absent Content-Encoding or identity is supported; gzip/other encodings are rejected before opening a stream. SDK decompression is disabled. A local byte counter enforces the exact expected output length regardless of Range behavior; mismatch/overflow immediately destroys the stream without accumulating a download buffer. Mismatch/unavailable verification returns503; never overwrite/delete the object to make retry pass.
- `API04-I07`: video and poster are separate immutable writes. On partial failure, exact retry verifies/reuses the video and creates the missing poster before attaching either in SQL. SQL failure may leave private unreferenced objects. No public access derives from storage existence.

The UUID supplied as key remains the historical asset ID/path component for uploads; no derived-ID algorithm replaces D01 UUID-v4 identity. The current singleton principal and separate media namespaces bound this design. Delegated writers, normalization upgrades or changed key policy require a compatibility design; do not silently treat process-local MEDIA_BUSY as cross-replica exclusion. SQL revalidation, generation preconditions and durable receipt are the correctness mechanisms.

## Media recovery runbook

1. Preserve exact request/key and safe requestId; do not log base64, tokens, private rights declarations or bucket credentials. Verify actual authorized operator and current deployment/source before inspecting production.
2. Retry transient503/uncertain response with the original command; if receipt exists, return it after authorization without reprocessing. If no receipt, repeat bounded normalization/object integrity checks and revalidate current data in SQL.
3. For409 stale version: read detail and reconcile. Reusing old expectedVersion cannot attach orphan bytes. If review/state changed, human review decides the next business command.
4. For503 MEDIA_RECOVERY_CONFLICT: quarantine logically by leaving object private/unattached; investigate generation/content/processor compatibility. Never overwrite an attached object, bypass hash checks or publish it.
5. Inventory/reconciliation, separately authorized, must compare storage names/generations against ALL canonical references: asset.path, media_thumbnail.path, video_asset.path/poster_path, plus historical publication/media references and in-flight requests. An unreferenced object is only a candidate, never automatically safe to delete. Repeated snapshot/quiescence, retention/backup/legal policy and reviewer approval are required before a generation-conditional deletion.
6. No deletion on transaction catch: another attempt may already have committed the object, or COMMIT outcome may be unknown. This patch intentionally performs no storage deletes.

`API04-RECOVERY-002` remains PROPOSED/OPEN: durable upload-intent ledger, operator reconciliation command/worker, retention window, backup/restore and safe orphan cleanup evidence. No new schema/grant or cleanup job is invented here. Until that gate is validated, the runbook supports retry recovery and preserves private orphans; it does not guarantee bounded orphan cost or automated crash cleanup.

## Verification and Production Gates

`API04-T01`: real disposable PostgreSQL, exact replay/key-order, changed fingerprint denial; SQL writes and counts inspected.
`API04-T02`: real COMMIT then simulated acknowledgement loss; retry returns original version and no duplicate audit/outbox/receipt.
`API04-T03`: injected outbox failure after business/audit SQL; rollback verified. Two independent connections using distinct keys/same version yield one winner.
`API04-T04`: media prepared before injected SQL failure leaves no DB asset/receipt; exact retry attaches once; receipt replay and stale new-key request perform no media preparation.
`API04-T05`: actual storage persistence helper with transport fixture verifies412 bytes/metadata/generation/bounded reads and partial-video/poster retry.

CI fixtures do not prove Firebase production admission, GCS IAM/real generations, real-video determinism across encoder versions, all13 action state transitions, replica crash/DB failover, backup restore or orphan deletion safety. Existing publication/measurement tests are retained. Production gates remain OPEN pending scoped deployment and these missing evidence items. Receipt retention has no deletion job/approved TTL; preserve durable receipts until an explicit compatibility and retention decision. Do not describe API-04 CI success as a full launch approval.
