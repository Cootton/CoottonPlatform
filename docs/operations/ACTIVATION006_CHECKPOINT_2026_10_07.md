# Activation006 — production checkpoint 2026-10-07

`ACT006-RUNTIME-001` · owner-assigned activation and runtime verification · source `3c768d61b7687bd92a8564f42a34151f231eec62` (PR16/17 merged). This is newer than the04/10 checkpoint; prior records remain immutable history.

## Applied schema and recovery scope

Migration006 registered at2026-10-07T10:30:09.715Z with SHA256 `e77a71f447a523ac75aaba7c1b14960818cad816b7c4a0811e958126ab5ef375`. Explicit maintenance runner completed and idempotent rerun passed. Registered hashes001–005 matched fixed-source files; applied historical migrations were not edited. Public view grants retained, no new role/IAM/storage grants.

Before applying: captured existing visible_product definition and fingerprints of product, dictionary, immutable product_review, publication, stock_position and stock_movement in an ignored local recovery record; replaced view with006 then restored old definition inside a transaction and rolled back successfully. This is scoped view recovery evidence, **not a full independent backup/restore/DR drill**. Product states remained Boxy DRAFTv23 and sample DRAFTv5, catalog empty. Initial preflight42501 came from unsupported SET ROLE reader; corrected verification without granting membership. Reader access was subsequently verified by the real Cloud Run reader identity.

## Immutable artifact and deployed runtime

- [Cloud Build cd86ac5d-12eb-4f5d-a5fb-46be5390b9ba](https://console.cloud.google.com/cloud-build/builds;region=asia-southeast1/cd86ac5d-12eb-4f5d-a5fb-46be5390b9ba?project=524673981677): SUCCESS, exact Git-verified API build source; no credential files uploaded.
- API digest: `sha256:75065b4658ce021d8a7777f9261a9837759982954ff49b1b64b021538ee42d54` in existing cootton-containers repository.
- New ready revision: `cootton-api-act006-3c768d6`,100% traffic after no-traffic revision HTTP acceptance. Previous `cootton-api-00005-ff6` retained.
- Existing attached cootton-auth-verifier identity, environment/pinned secret refs, private bucket,1CPU/512Mi, max1, concurrency10 and timeout60s unchanged. Web artifact unchanged.
- Temporary verification tag removed and one-off read-only verification job deleted after successful execution. Cloud logs retain scoped results. Local copied CLI authentication state removed after task; original credentials remain unchanged.

## Verification and traceability

| Stable finding / evidence | Actual check | Result / precise scope |
|---|---|---|
| PR16-F001 / EVD-ACT006-COLD | Fresh Cloud Run job `cootton-activation006-verify-s2prx`, same immutable image and attached identity, completed2026-10-07T10:33:38.225396Z | No Firebase app/Admin request before reading existing real private image; shared initializer produced correct project app; valid WebP63,684bytes downloaded. No transport stub. Positive storage/helper runtime proof; **not public-image HTTP200**, because real product remains withdrawn |
| PR16-F002 / EVD-ACT006-MEASUREMENT | Actual production PostgreSQL with reviewed CatalogRepository/publication code; owner explicitly approved rollback-only mutation after automatic approval review initially blocked it | Existing legacy publication plus newly generated snapshot; inactive measurement hides product/SKU/chart/media on cold/warm reads; detail and image404/listempty; inactive size also hides. All writes inside BEGIN/ROLLBACK, no COMMIT. Independent connection checked DRAFTv23/empty catalog throughout. Protected fingerprints unchanged afterwards |
| EVD-ACT006-READER | Same Cloud Run job with existing restricted reader secret | All four public views readable/empty; private review SELECT rejected42501 |
| EVD-ACT006-HTTP | Correct `/v1` API routes on no-traffic revision, then service origin after100% rollout | Health200, catalog200/empty/commercefalse, hidden real image404 before Admin probe, withdrawn detail404, unauthenticated Admin401. Buyer Web withdrawn detail404. Initial missing-prefix URL check corrected and rerun |
| EVD-ACT006-FINAL | Final production fingerprint/state verification after rollout | Boxy DRAFTv23, sample DRAFTv5; original product/review/dictionary/publication/stock fingerprints unchanged |

Cloud logging record2026-10-07T10:33:33.517051Z has id ACT006-CLOUDRUN-COLD-STORAGE and the bounded successful checks above; no image payload, path, credential or private declarations logged. Existing source CI: [Foundation](https://github.com/Cootton/CoottonPlatform/actions/runs/37606667703), [Container](https://github.com/Cootton/CoottonPlatform/actions/runs/37606667783), security analyses all succeeded on8efafd4 prior docs merge; runtime image builds source3c768d6 with identical API source.

## Gate impact and next scope

ADR0006 → migration006/shared initializer → source CI → actual DB/storage/HTTP evidence now closes the **assigned activation006 patch scope**. GATE-DATA-001, GATE-SEC-001 and GATE-RELEASE-001 receive these bounded evidence records; full gate roll-ups remain open for their other requirements. No full release/security/backup readiness certification.

No real product republish, durable product mutation, new identity/grant, commerce/order/payment/points/indexing or public video activation. Existing older unpublished approvals still require return-to-draft/fresh review before publish. An approved future positive public-image buyer journey can provide additional HTTP200 evidence without being inferred from this task.

Rollback boundary: API rollback retains006 measurement guard but can reintroduce cold-media failure; rolling view back to005 alone reintroduces measurement revocation. Prefer contained mode/compatible roll-forward; do not edit005, delete review history or republish as recovery side effect. Full recovery/readiness remains governed by D10.
