# Catalog review and publication contract

Status: implementation prepared; production activation not yet executed.

Historical status above describes the PR16 source snapshot before reported04/10 activation. The07/10 review fix source is prepared; migration006 is NOT applied by this change. Read ADR0006 and CATALOG_MEASUREMENT_ACTIVATION.md for the additive rollout boundary.

New snapshots retain chart measurement/size dictionary IDs privately. Migration006 checks canonical chart references too, so older visible snapshots missing those IDs fail closed after measurement/size deactivation without rewriting immutable reviews. An unpublished old approval must be reviewed again before publish because the snapshot shape has changed. Public chart fields stay labels/values only; public media uses the shared backend identity initializer independently of Admin requests.

## One authoritative flow

`DRAFT → submit → IN_REVIEW → approve → APPROVED → publish → visible catalog`

`returnDraft(reason)` or `unpublish(reason)` hides publication and returns to DRAFT. Archive also hides publication. Every command requires verified human Admin, exact expectedVersion and idempotency key. Product locking, source mutation, version increment, receipt, audit and outbox are atomic. Cache invalidation occurs after commit.

Review must confirm name, description, controlled category/brand/form/country, sourced main fabric, garment chart, reference retail price and gallery rights/color mappings. First activation supports CREWNECK_TSHIRT, 1–100 active SKUs, one B2C reference tier starting at one piece per SKU, 1–9 processed gallery images and at most the existing one private video. BODY_LENGTH and CHEST_FLAT are mandatory for each size. Height/weight recommendations are not garment measurements.

`approve` payload: `{confirmed: true, declaration: nonempty text ≤10000 characters}`. The private declaration records what the reviewer checked and the sources/permission. `publish` requires the current version's review and exact JSONB equality with fresh source facts. Missing/changed review or invalid transition returns a controlled conflict; no partial publication. Care changes require a nonempty careDeclaration and create a new immutable source evidence record.

## Read boundary

Public product DTO contains only product ID/version/slug/category/title/brand/description/form/material/origin/care/gallery. Public SKU DTO contains ID/code/color/size and approved reference VND price. Public garment chart contains size/measurement/cm. No reviewer identity, evidence declarations, costs, stock balances or credentials are exposed. `commerceEnabled` is always false. B2B remains unavailable. Existing noindex remains until release readiness is separately approved.

`GET /v1/catalog/media/{seller}/{file}` accepts only UUID plus SHA256.webp. The reader must find that exact path in visible_media before the API's existing scoped identity reads the private object. Next serves it through `/media/{seller}/{file}`. Both routes are no-store. Unpublished/draft objects return not found. API and Web use bounded timeouts/response sizes and safe errors. Public video/poster delivery is deferred; the clip stays private.

Memory cache retains its bounded LRU/TTL/coalescing design. Positive hits validate current visible product versions. Fresh detail loading rechecks visibility/version after loading SKUs/chart. Hiding or canonical version changes invalidate visibility even on another runtime instance; in-flight responses that already passed authorization may complete. No financial decisions use this cache.

## Database and permissions

005 adds product_review and publication, replaces visible_product/visible_sku and adds visible_media/visible_size_chart. Reviews are INSERT/SELECT only for catalog Admin, never UPDATE/DELETE. Publication permits SELECT/INSERT and scoped UPDATE of pointer/version/visibility/snapshot/time. Reader receives SELECT only on public views. No owner credential enters the API, no IAM/Storage changes, no financial grants, no deletion of legacy projection rows.

Applied migrations001–004 must match registered hashes and are never edited. Migration005 runs explicitly under a maintenance transaction and advisory lock, not on application startup. Its idempotent rerun checks the hash. Rollback verification must succeed before permanent activation.
