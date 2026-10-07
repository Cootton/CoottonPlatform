# Migration006 / source synchronization

`SYNC-PR16-006` · 2026-10-07 · source `56f80580e50b43c94df65d3ae79ef025ea957123` · stacked documentation PR #17.

## Authority and preserved history

PR16 fixes supersede source18768a1 for implementation. PR17 is synchronized by a merge commit with both prior PR17 head93a0c0a and PR16 head56f8058 as parents. All application code, package scripts, CI workflows and migrations use the PR16 tree exactly. V001 retains the complete latest PR16 source plus MP-ENG-001/MP-REVIEW-001; AGENTS retains the current owner assignment and reading order. ACCEPTED decisions are unchanged. Historical manifests/checkpoint records remain attributed to their original validation stage.

## Traceability and evidence

| Stable requirement / finding | Decision and implementation | Verification / limit | Gate impact |
|---|---|---|---|
| PR16-F001 / cold public media | [ADR0006](../adr/0006-catalog-review-fixes.md); apps/api/src/firebase-app.ts shared initializer used by admin-auth.ts and catalog-media.ts | firebase-media.cjs exercises cold media before Admin and project/emulator rejection; real SDK registry with stub storage transport | GATE-SEC-001 and GATE-RELEASE-001 receive bounded source evidence; live storage and deployment verification remain required |
| PR16-F002 / inactive chart dictionary withdrawal | ADR0006; catalog-publication.ts records measurement/size refs privately; [migration006](../../apps/api/migrations/006_catalog_measurement_visibility.sql) filters canonical chart for legacy/current snapshots | publication.cjs + measurement-db.cjs on disposable PostgreSQL16; actual CatalogRepository detail/list/media, warm/cold paths and legacy snapshot visibility | GATE-DATA-001 / GATE-RELEASE-001 remain open for maintenance activation and deployed revision evidence |
| FLOW-CATALOG-001 / previously observed withdrawal | [flow evidence](CATALOG_FLOW_EVIDENCE.md), checkpoint04/10 and browser07/10 | Boxy final DRAFTv23; source18768a1/reported old deployed revisions; does not validate006 or cold-media fix at runtime | Preserve bounded evidence; no full Production Gate PASS |

Source CI at56f8058: [Foundation run37605401243](https://github.com/Cootton/CoottonPlatform/actions/runs/37605401243), [verify job112739520677](https://github.com/Cootton/CoottonPlatform/actions/runs/37605401243/job/112739520677) and [Container run37605401224](https://github.com/Cootton/CoottonPlatform/actions/runs/37605401224) succeeded. API focused suite:11 pass/1 optional video check skipped; PostgreSQL regression:1 pass. Build, types and contract checks passed. These results certify the pinned source scope, not production readiness.

## Migration and release boundary

001–005 must remain byte-identical to PR16.006 is additive and **not applied to production** by this sync. [Activation procedure](../../CATALOG_MEASUREMENT_ACTIVATION.md) and [fix checkpoint](../planning/PR16_REVIEW_FIXES.md) are the implementation authority. Use the explicit maintenance runner catalog-measurement-migrate.cjs with migration digest validation, transaction and advisory lock; no startup migration, new grants or product reset. Older unpublished approvals need return-to-draft and fresh review before publish because the snapshot contract changed. Preserve already observed DRAFTv23; do not republish as a sync side effect.

Before release closure record the authorized maintenance execution/006 digest and idempotency evidence, deployed exact API revision/image/source, and live cold-image/inactive-measurement withdrawal checks. Do not rewrite the04/10 deployment checkpoint as current. Other security, restore/load and release gates retain their existing open states. A passing CI test does not close them.

## Review order

Read Master Plan → CURRENT_STATE → this record → TRACEABILITY/GATE_EVIDENCE → ADR0006 and activation procedure. Review/merge PR16 first; then retarget PR17 to main and recheck diff/source/evidence. This task updates the review branch only.
