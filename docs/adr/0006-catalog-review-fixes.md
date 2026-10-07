# ADR0006 — Cold media identity and measurement withdrawal

2026-10-07 · Owner assigned fixes for PR16-F001/F002 and related API CI checks.

Both auth and private media use a shared backend Firebase app initializer with the existing attached/application-default identity and fixed project checks. Buyer image delivery does not depend on an earlier Admin request. No new identity/grant or public bucket access is introduced.

New publication snapshots retain chart size/measurement dictionary IDs privately; public chart DTO still contains labels/values only. Applied migrations001–005 remain byte-identical. Additive migration006 replaces the existing visible_product view with the same columns and retained grants, adding an active canonical chart-reference guard. It covers snapshots published by older source which omitted measurement IDs; immutable reviews are not edited or backfilled.

Re-enabling a dictionary restores visibility only when all other existing eligibility/version/publication predicates pass. Changing snapshot shape means an unpublished review created by older source must return to draft and be reviewed again before publish; no automatic approval. The current owner product was last observed DRAFTv23, not republished by this fix.

CI runs focused cache/publication/media/video/initializer tests and a loopback-only disposable PostgreSQL fixture that demonstrates005's original omission, applies006, and checks product/SKU/chart/media withdrawal and cached reads. No production credentials/data or maintenance runner is used in CI. Video fixture normalization remains skipped without an explicitly supplied clip.

Source fix is not runtime activation. Migration006 must be reviewed and run explicitly using catalog-measurement-migrate.cjs under assigned maintenance scope; it verifies hashes001–006 and uses the existing migration lock/transaction. Never edit005, run006 on startup, expose private media, or enable commerce/indexing from this change. Deployment/backup/restore gates remain separate.
