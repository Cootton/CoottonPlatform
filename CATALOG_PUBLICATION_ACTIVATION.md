# Catalog publication activation — exact scope

Prepared 2026-10-04. Pending owner activation approval and deployment evidence.

1. Verify migration005 in a rollback-only transaction on the existing Neon cootton database; validate view compatibility, permissions, lifecycle/snapshot rejection and hiding. Leave no fixture or permanent DDL from that check.
2. Apply migration005 explicitly: two catalog-only tables, replacement of two public views, addition of two public views, INSERT/SELECT immutable review grants and scoped publication-pointer UPDATE grants to existing catalog Admin. Reader receives only public-view SELECT. Retain all current products, images, stock, legacy projection rows and financial tables.
3. Build the reviewed fixed commit with existing Cloud Build identity, then update existing API and Web images. Enable COOTTON_PUBLICATION_ENABLED=true only on API. Retain all existing secrets, service identities, origins, min0/max1, CPU/RAM and access configuration. No IAM/bucket public-access changes.
4. On the owner's actual Boxy product only: save the care advice and truthful source declaration; review supplied product facts, 16 variants, four-color image associations, size chart and confirmed commercial image permission; submit, approve and publish catalog information through authenticated Admin. This exposes only approved gallery image bytes through the allowlisted proxy. Video remains private. The sample product remains a draft.
5. Verify public catalog/detail/16 SKUs/reference prices/chart/gallery, unauthenticated Admin denial and hide/republication behavior. Record actual evidence in V001. No order/payment/points/seller transaction activation or search indexing.

Build/storage/runtime can incur the existing usage charges. No new service or paid tier is provisioned. Approval is needed for these additional database grants and the exposure of reviewed product images; source/build preparation can proceed beforehand.
