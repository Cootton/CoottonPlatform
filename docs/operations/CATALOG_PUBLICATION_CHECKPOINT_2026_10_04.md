# Catalog publication checkpoint — 2026-10-04

Owner approved CATALOG_PUBLICATION_ACTIVATION.md for source18768a1ded3be76d4df9a0960369170b50c72850.

- Migration005 view compatibility/scoped grants verification passed with all changes rolled back. Applied005 explicitly, idempotent rerun passed. Restricted public reader verified all four views; catalog remained empty.
- Rollback flow on existing Boxy draft passed: submit/approve, changed source rejected at publish, publication returned16 SKUs/12 chart rows/5 image paths, hiding removed public product/images. Every temporary change rolled back and original DRAFTv14 restored. This is database verification, not authenticated live acceptance.
- Cloud Build a84b5e2f-d8e9-4774-95d0-60b265032ff9 SUCCESS from fixed18768a1 source. API sha256:431d00d0ac0348246ee894e7f5f46e4d2f09ab603617a62cab2c3a664e5efe0d. Web sha256:92d914e98c00088a35cc32042c6300c62eb526f7fece7f9b2d534f78122aeb2a.
- API cootton-api-00005-ff6 and Web cootton-web-00006-7c9 deployed,100% traffic. Publication flag enabled on API only. Existing pinned secrets, identities, private bucket and runtime limits retained.
- Owner reauthenticated directly on Admin. Actual authenticated sequence: care save v15 → submit v16 → approve v17 → publish v18 → unpublish v19 → submit v20 → approve v21 → publish v22. Final state APPROVED and visible; one real product only. The eight commands each have matching audit, outbox and idempotency receipt records. Source and review declarations remain private.
- Care advice is Cootton-authored at owner's request, label takes priority. Owner confirms commercial permission for full black shirt image. No external image substitution.
- No commerce, orders, payments, points, seller transaction modes, search indexing, legacy deletion or public video enabled. Sample stays private DRAFTv5.

Live acceptance passed: catalog links to real Boxy detail;16 SKUs with correct reference prices,12 garment measurements,5 gallery images loaded. Hiding returned404 for detail and image and emptied catalog despite prior cache population. Re-review/republication restored detail and image. Restricted reader independently verified one visible product v22,16 SKUs,12 chart rows,5 gallery paths and B2B disabled. HTTPS health200 and unauthenticated Admin401. Buyer robots metadata remains noindex,nofollow. Proof: outputs/COOTTON_BOXY_PUBLISHED.png retained locally, not uploaded to public repository.

Next tasks require owner assignment: improve buyer presentation/selectors, complete remaining order/checkout readiness, intended-domain routing and release/SEO readiness. Do not activate purchasing or indexing just because catalog is visible.