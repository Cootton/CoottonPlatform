# ADR0009 — Verified immutable media reuse and command retry recovery

> **FIX04-READ-OPS-001 · 2026-10-09:** SDK body reads are replaced in source `988c8a83…` by the bounded native generation-pinned reader, retaining metadata/integrity/authorization and immutable SDK save semantics. Historical SDK `decompress:false`/stream-destroy descriptions below refer to the earlier implementation; current helper rejects non-identity encoding and cancels/releases native body in finally. [Latest runtime evidence](../operations/API04_SDK_HTTP_OPERATIONS_EVIDENCE_2026_10_09.md) gives scoped1.000read/0warning PASS; full identity/write/publication/operations gates remain OPEN. ACT006 has not received this source.

ID: `ADR-0009`. Date:2026-10-07. Status: PROPOSED implementation, pending review/merge. Owner assigned API-04. Prior ACCEPTED domain decisions are preserved.

## Problem

Media objects are written before the PostgreSQL transaction. Existing412 handling trusted any object already at the path. A failed second video/poster write or failed SQL attachment can leave private objects; uncertain COMMIT acknowledgement can make a committed result appear failed.

## Decision

Preserve principal/operation/key receipt, raw canonical fingerprint, singleton subject guard, product version lock and atomic business/audit/outbox/receipt. Reauthorize before replay. On replay, invalidate local public cache. Discard a pooled connection if rollback fails.

Use one create-only immutable persistence helper for image, thumbnail and video/poster. On412, verify metadata and exact bounded bytes of the pinned generation before reuse. Resume video/poster preparation without overwrite. Keep external media processing outside SQL; retain private orphan objects rather than deleting during uncertain/racing outcomes.

[API04 contract](../contracts/API_TRANSACTION_MEDIA_RECOVERY.md) specifies request/retry rules, trace IDs, recovery runbook and gates. No migration, changed UUID identity, retention policy, storage-delete endpoint, grant, public deployment or background worker is included.

## Trade-offs / deferred work

Retry repeats normalization; changed encoders can produce different private hashes and orphans. Current MEDIA_BUSY is per process. Durable pre-upload intent/reconciliation and retention/bounded orphan-cost evidence remain API04-RECOVERY-002 OPEN, subject to reviewed schema/policy and separate production activation. New delegated writers require ID/path compatibility review. Never assert exactly-once network delivery; the proven unit is one persisted business effect for successful receipt replay.


## PR23-F001 follow-up · 2026-10-08

Range is an optimization, not the memory bound. Existing objects must use absent/identity encoding; deny compressed/unknown encodings before read, disable SDK decompression and verify content in a generation-pinned stream with local byte enforcement and immediate destruction on failure. This refines API04-I06 without changing object paths, SQL schema, rights or cleanup policy.
