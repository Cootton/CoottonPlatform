# Admin catalog implementation checkpoint — 2026-10-03

Owner assigned V001/OpenAPI synchronization → minimal Admin → actual product draft/review/publication. Owner confirmed no actual product facts/images yet; build input first. No product seeded.

## Prepared source, not an enabled private system

- V001 current status supersedes historical design-only entries; OpenAPI describes actually implemented public catalog reads.
- Firebase Admin SDK verifies identity/issuer/audience/expiry/revocation. Human principal requires explicit canonical mapping, not email match or client role. No public bootstrap endpoint.
- `/admin` uses the existing Firebase email/password provider with in-memory persistence; no browser token localStorage. Owner enters password directly on the page. Exact-origin JSON mutation BFF, bearer-only private API, no-store, bounded request body.
- Private draft list/detail/create/save and archive source uses expected versions, actor-bound persisted idempotency/fingerprint, one transaction for domain/audit/outbox. Unknown identity/configuration is denied. Runtime writer must be separately scoped and cannot use maintenance owner connection.
- Migration002 and the owner-approved bootstrap were applied on 2026-10-03. Digest: 0347dc146e889ddcf78ac7482f8d211ddff97599a374c6ad70366cdd0156bf12. One verified owner principal and one Cootton seller exist, commerce disabled. Runtime role cootton_catalog_admin cannot update principal or delete product. No product/dictionary seed or publication.
- Submit/approve/publish are explicitly NOT READY; no successful placeholder state or fictional source/media/offering attestation. These commands must be completed with actual dependencies before the workflow is described as finished.

## Required configuration and remaining implementation

1. Owner Firebase subject was verified in the console against the owner-confirmed account and mapped by the explicitly approved bootstrap. Private subject record and runtime credentials are ignored by Git.
2. Firebase Web configuration is saved privately in apps/web/.env.local. Email/password is enabled; Google is not used. Owner explicitly approved creating cootton-auth-verifier with only roles/firebaseauth.viewer on 2026-10-03; Google Cloud confirmed creation and policy update. No service-account keys existed on the Keys page. Local runtime credential is still missing. Owner must complete credential creation themselves and save .env.auth-verifier.json privately; never send the contents to chat/GitHub. Future Cloud runtime should use attached identity rather than downloaded keys.
3. Complete and review migration/grants runner, seller/dictionary/evidence provisioning, product SKU/fabric/size-chart/media input, rights/processing/storage and D02 effective offering pipeline. Mandatory foreign-kind/source/ownership invariants and approved applicability/required measurement definitions remain.
4. Implement complete-state validation → human review → source-authoritative public projection/revocation. Remove renewal-60s dependency through additive reviewed migration, not by bypassing source approval. Current001/schema/reader remain unchanged.
5. Verify authenticated transitions, concurrent replay/version conflicts, rejection/withdrawal, media privacy and actual public output. No products published until supplied facts/images meet contracts.

Current identity guard / draft source compiled and Web type-checks passed. Sample docs/fixtures/catalog-sample.json is one labelled incomplete synthetic draft, verified with shared draftFields and the Admin contract checks. It is not seeded into the public catalog. Actual restricted runtime permissions verified: one active principal, zero products, no principal update or product deletion. Successful Admin login, publication and public hosting remain unverified until backend credential and owner sign-in are completed. No payment/points/order activation. Continue the same task; this is not full completion.

Primary auth references: https://firebase.google.com/docs/auth/admin/manage-sessions and https://firebase.google.com/docs/web/setup.

## Historical local verification path, superseded by owner keyless choice

From apps/api, build API and run `node admin-start.cjs` after the owner saves the private verifier file. The launcher checks exact project/service-account metadata and loads only .env.admin, never maintenance .env. If a local API already occupies port3001, stop that known API session first. Rebuild/restart Web to load apps/web/.env.local. Owner enters email/password directly on /admin. Successful Firebase login alone is insufficient: require /session authorization and catalog load. Then create/save exactly the fixture draft through authenticated API/UI and verify its absence from public catalog. Publication and commerce stay inactive. Source is still local/unpublished; PR15 contains earlier plan only.
## Current owner choice: keyless deployment

Owner declines a local JSON key and chooses attached Google Cloud identity. No key is created; do not run admin-start.cjs or ask for a local key again. Follow CLOUD_RUN_ADMIN_SETUP.md. Containers, version-pinned Secret Manager credential delivery and narrow secret-reader grants still require verification and explicit owner authorization. Successful deployed Admin login and sample draft integration remain pending. Created verifier has only Firebase Authentication Viewer; no additional secret access or deployment performed yet.
