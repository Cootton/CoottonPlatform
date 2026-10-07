# PR16 review remediation checkpoint

2026-10-07 · PR16-F001/F002 source fixes; migration006 not applied to production.

- Shared Firebase initializer allows cold public media before any Admin request, with project/emulator/mismatched cached app rejection. Storage transport is stubbed in the cold-start regression; no cloud access.
- New snapshots retain measurement IDs privately; additive006 checks current chart measurement/size dictionary activity for legacy snapshots without rewriting immutable history.
- Focused API checks are wired into Foundation CI after build/contracts. A disposable PostgreSQL16 service executes the schema/view regression, verifies reader permissions, cold/cached catalog withdrawal and private media404. The test accepts only loopback cootton_api_test database; DDL/fixtures are rolled back.
- Runtime deployment and migration006 require their concrete maintenance/release scope; no owner product edits, re-review, republish, new grants, private video, orders/payments/points or indexing activation.

Read ADR0006 and the exact CI results on the current commit. Prior activation pending headers and deployment checkpoints describe their historical stages, not proof this patch is deployed. PR17 documentation references older18768a1 and must be reconciled after PR16 source changes before merging the stacked docs PR.
