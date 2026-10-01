# Database-backed Cootton catalog

Owner assigned implementation2026-10-02 and chose empty catalog/real data later. Read ADR0003 for the exact projection schema/authority boundary.

## What runs now

Next buyer homepage, category filters, B2B entry, help, public product/SKU detail and canonical301 redirects. SSR reads Nest catalog API; Nest reads PostgreSQL public views using a restricted role. Unknown/nonpublic product404, invalid filter/cursor400 API, DB failure503 and unavailable UI. Noindex retained. No products/prices/stock/approvals or financial operations seeded. Private mutation/publisher/canonical write models/media uploads/payment/deployment follow separate readiness.

## Local run

Node24/pnpm10.34.6, install frozen lockfile, build shared contracts/API, then:
- API: `pnpm --filter @cootton/api start:catalog` using ignored private apps/api/.env.catalog.
- Web: `pnpm --filter @cootton/web dev`, optional private CATALOG_API_ORIGIN; localhost3000.
- Reader check: `pnpm --filter @cootton/api catalog:verify` prints privilege/count evidence, never credentials.

`catalog:migrate` is scoped maintenance, not app startup/deployment. Loads original private maintenance .env, verifies empty application database for first install, advisory-locks transaction, creates read schema/reader and records normalized SQL SHA256. Replay verifies digest, never resets credentials. Unknown commit/failure needs record+private-file reconciliation, not blind retry. Restricts runtime SELECT to visible views; no INSERT/source-table/CREATE grants. Original .env not overwritten. Windows mode0600 is not verified user-only ACL: treat local private files accordingly and use actual secret manager for hosting.

Migration001 applied to actual empty Neon cootton; digest5ce15497289ae15ededa61b31dbc4e3e7813094ae59a492dba91b43804b78c9e. Runtime privilege check passed: read-only, public-view-only, no source reads/inserts/schema creation; visible count0. Schema is a rebuildable read projection, not executable D01 canonical tables. No public importer/publisher; source validation/actual data input is a later task and cannot bypass D01/D02 publication requirements.

## Verification evidence

Type checks passed. Actual API B2C/B2B200 empty; limit51/invalid Raglan-category/cursor/UUID400; valid unknown product404. Local Web home/B2B/help/filter200, unknown product404; noindex and no DATABASE_URL in HTML. Desktop/390px responsive inspection, no horizontal overflow. Shared verification covers exact money/IDs plus public-private field stripping/media URL boundaries/slug contracts; fixtures are memory-only, not Neon seeds.

This Windows environment prohibits child-process spawning by Node. Next CLI dev and isolated Node test runner hit EPERM; documented Next custom server with local worker-thread setting and test-isolation=none allow equivalent local verification without modifying security permissions. Normal build/test commands stay in GitHub Linux CI; actual production build/CI must pass before merge. Custom preview is local validation of code connected to real Neon, not a public production deployment.

## Production blockers

Actual hosting/resource/billing cap/region, verified domain/DNS/TLS, secret manager/runtime identity, protected deploy workflow, independent encrypted backup/key custody+restore evidence, monitoring/duty contact and D10 release acceptance remain. No paid infrastructure provisioned or cootton.com release claimed. API has no authenticated write surface. Payment/points remain inactive. An empty catalog does not authorize fake data or relax production readiness.
