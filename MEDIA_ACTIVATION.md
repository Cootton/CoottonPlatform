# Product media activation

Apply only after owner approves this concrete scope at the reviewed commit.

- Apply additive004_product_media.sql to Neon cootton, verifying001–003 digests, preserve existing product/sample/stock/prices/rights evidence. Change image position maximum from20 to9, fail if existing gallery would violate it.
- Add four media tables, grant existing catalog admin SELECT/INSERT plus only color-association columns asset_id/source_id UPDATE. No DELETE, approval, IAM, ledger or payment grants.
- Existing private bucket and attached runtime identity retain create/read only; immutable thumbnails/videos/posters use same bucket. No public ACL/CORS/signing or new credentials.
- Cloud Build fixed public source using existing container builder permissions. Update same API/Web services, retain CPU1/512MiB/min0/max1, existing Auth/secret identities and exact Admin origin. May incur existing build/storage/runtime usage charges. API container adds Debian FFmpeg; max input8MiB,60s, one processing job per instance.
- After deployment assign existing four color photos to Boxy SKU colors and upload owner-approved first30s optimized clip. Current product draftv9/16SKU/1600 stock and sample draftv5 are preserved. Do not publish or activate commerce.
- Verify9-image bound, one-video relation, private previews, rejected unauthenticated requests and unchanged existing product fields. Record actual deployment/evidence separately.
