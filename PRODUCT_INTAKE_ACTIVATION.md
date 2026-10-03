# Product intake activation — reviewed scope

Source: ADMIN_PRODUCT_INTAKE.md, migration003 and the Admin/API intake implementation. Not yet applied to Neon or deployed at preparation time.

1. Apply migration003 to the existing Neon cootton database through explicit maintenance, verifying migration001/002 digests. Add relational draft price versions/tiers, shared stock/location/movements and form applicability. Preserve existing product/sample/principal, no blanket deletion. Grant existing cootton_catalog_admin only SELECT/INSERT and bounded stock/product updates; DELETE restricted to replaceable draft fabric/chart rows. No role creation, owner runtime, payment, publication or Auth grants.
2. Create private Google Cloud Storage bucket cootton-catalog-media-524673981677 in asia-southeast1, uniform bucket access and enforced public-access prevention. No public objects. Configure API COOTTON_MEDIA_BUCKET.
3. Grant cootton-auth-verifier only roles/storage.objectCreator and roles/storage.objectViewer on that bucket. This allows new processed image uploads and authenticated private previews; no object deletion/overwrite, IAM or bucket administration. Expand existing container-builder writer to no new repositories; builder still cannot read database or image data.
4. Build fixed public source commit via already-approved Cloud Build identity; update existing API/Web images, retaining exact HTTPS origin, identities, pinned secrets, max1/min0 and inactive commerce. No custom-domain cutover.
5. Verify migration idempotency, catalog empty/read authorization, existing draft preservation; then owner login and sample-only intake/preview. No invented real product declarations or publication.

Potential usage charges: image storage/read operations and existing build/Cloud Run usage. Do not create a local service-account key. Historical receipt-based publication is not activated by this slice.
