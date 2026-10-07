# API-01 — Current endpoint inventory and HTTP table

`API-01` · `EVD-API01-SOURCE-001` · 2026-10-07 · source main `a2d893e3b9828cc42691ac1d9a4e299a7c41dec1`.

Status: VERIFIED for source inventory/documentation checks only.16 backend/route source files were verified against Git blob hashes at pinned main.13 explicit backend operations match13 OpenAPI paths. Web adds10 logical proxy operations through2 route-handler files (3 exported handlers); these proxy existing backend operations and do not create10 business capabilities. No application/schema/config change or live mutation in this task.

Owner rule RULE-API-001 is accepted in conversation; documentation [PR19](https://github.com/Cootton/CoottonPlatform/pull/19) remains a separate review dependency. Inventory is the input to API-02, not certification that every endpoint already satisfies all six fields. PLAN-API-001 is the requested learning/work sequence; later stages remain unverified.

## Backend operations

Prefix /v1 is registered in [main.ts](../../apps/api/src/main.ts). JSON successes normally use application/json; public media explicitly uses image/webp. Declared status sets below are source-derived expected domain outcomes, not exhaustive infrastructure/framework errors or a claim each status was exercised. Unexpected exceptions map500; malformed/oversize parser behavior is tracked separately.

| Stable ID | Method | Path | Access | Request | Response | Expected status | Data / semantics |
|---|---|---|---|---|---|---|---|
| HTTP-API-001 | GET | /v1/health/live | None | None | JSON status/contractVersion | 200 | process-only liveness |
| HTTP-API-002 | GET | /v1/catalog/products | None | mode B2C/B2B, category, limit default20/max50, cursor bound1024; rejects other query keys | JSON items,nextCursor,mode,commerceEnabled=false | 200;400;503 | keyset + visible_product |
| HTTP-API-003 | GET | /v1/catalog/products/{id} | None | UUIDv4 id; optional skuAfter; rejects other query keys | JSON product,chart,skus page;commerceEnabled=false | 200;400;404;503 | current visibility/version/reference guard; cached reads revalidated |
| HTTP-API-004 | GET | /v1/catalog/media/{seller}/{file} | None | UUIDv4 asset path segment named seller; sha256.webp file | image/webp binary | 200;400;404;503 | visible_media checked before private storage; seller param is asset ID in current path |
| HTTP-API-005 | GET | /v1/admin/session | Bearer + active canonical principal | No explicit query handling | JSON principalId,capabilities,commerceEnabled=false | 200;401;403;503 | capabilities reported; not proof per-operation capability enforcement |
| HTTP-API-006 | GET | /v1/admin/catalog/products | Bearer + active canonical principal | after UUIDv4; rejects other query keys | JSON items,nextCursor;20 rows | 200;400;401;403;503 | private management list |
| HTTP-API-007 | GET | /v1/admin/catalog/products/{id} | Bearer + active canonical principal | UUIDv4 id; query not explicitly handled | JSON private draft/intake/publication issues | 200;400;401;403;404;503 | repeatable-read read-only transaction |
| HTTP-API-008 | GET | /v1/admin/catalog/dictionaries | Bearer + active canonical principal | No explicit query handling | JSON active items,applicability,configured | 200;401;403;503 | dictionary rows limit501 |
| HTTP-API-009 | GET | /v1/admin/catalog/products/{id}/images/{asset} | Bearer + active canonical principal | UUIDv4 product + asset; query not explicitly handled | JSON mime/base64 | 200;400;401;403;404;503 | product-media/seller association before storage read |
| HTTP-API-010 | GET | /v1/admin/catalog/products/{id}/thumbnails/{asset} | Bearer + active canonical principal | UUIDv4 product + asset; query not explicitly handled | JSON mime/base64 | 200;400;401;403;404;503 | product-media/thumbnail association |
| HTTP-API-011 | GET | /v1/admin/catalog/products/{id}/video | Bearer + active canonical principal | UUIDv4 product; query not explicitly handled | JSON mime/base64 | 200;400;401;403;404;503 | private product/seller video association |
| HTTP-API-012 | GET | /v1/admin/catalog/products/{id}/video/poster | Bearer + active canonical principal | UUIDv4 product; query not explicitly handled | JSON mime/base64 | 200;400;401;403;404;503 | private product/seller video association |
| HTTP-API-013 | POST | /v1/admin/catalog/commands | Bearer + active canonical principal | JSON key,action,id,expectedVersion,payload;12MiB parser bound | JSON command result incl id/version | 201 inferred;400;401;403;404;409;503 | single command route; transaction/audit/outbox/receipt; replay uses same status default |

Source: [catalog.ts](../../apps/api/src/catalog.ts), [admin-catalog.ts](../../apps/api/src/admin-catalog.ts), [admin-auth.ts](../../apps/api/src/admin-auth.ts), [OpenAPI](../contracts/openapi.json). Active principal is the current source admission check; no finer resource/capability policy is inferred from the session labels.

## Headers and error boundary

- API middleware sets Cache-Control:no-store and X-Content-Type-Options:nosniff for requests reaching it. Parser is registered earlier; do not assert these headers on parser/edge rejection without evidence.
- Admin requires Authorization:Bearer token; verifies Firebase signature/project/revocation/disabled/age rules before principal admission. Backend routes do not themselves implement browser Origin validation; Web BFF performs it for POST.
- SafeErrors produces JSON {code,message,requestId}; code uses generic status mapping (400 INVALID_INPUT,401 AUTHENTICATION_REQUIRED,403 FORBIDDEN,404 NOT_FOUND,409 CONFLICT,503 UNAVAILABLE; otherwise INTERNAL_ERROR). Specific internal VERSION_CONFLICT/IDEMPOTENCY_CONFLICT reasons are not exposed by this filter.
- Content-Type enforcement on backend POST itself is not explicitly implemented beyond JSON parser behavior. Body shape validators still run.413 can arise before controller; its headers/error mapping need API-02 verification.
- No custom PUT/PATCH/DELETE/HEAD/OPTIONS handlers, cookies, CORS policy or rate-limiter observed in reviewed API bootstrap/routes. Framework-generated HEAD/OPTIONS and ingress policies are outside the explicit count and require a separate HTTP check; do not infer that they are absent globally.

## Web proxy surface

`HTTP-WEB-ADMIN-001…009`: GET /api/admin/session; GET /api/admin/catalog/products; GET /api/admin/catalog/products/{id}; GET /api/admin/catalog/dictionaries; GET image/thumbnail/video/poster paths with the same suffixes as backend; POST /api/admin/catalog/commands. They map respectively to HTTP-API-005…013 by path/method, not ID ordering.

[Admin BFF route](../../apps/web/app/api/admin/[...path]/route.ts): allowlisted paths; Bearer syntax required; POST only catalog/commands, exact configured Origin and application/json Content-Type. Limits body12MiB; timeout120s; forwards query and Authorization to /v1/admin. JSON response; Cache-Control:private,no-store; nosniff. Passes upstream200/201/400/401/403/404/409/503; other upstream statuses become503. Local body limit returns413. Local invalid path/method pairing404, missing bearer401, POST Origin/type failure403, dependency/config failure503. Body-reading exceptions before fetch try block remain an API-02 edge-case check.

`HTTP-WEB-MEDIA-001`: GET /media/{seller}/{file} → HTTP-API-004. [Media proxy](../../apps/web/app/media/[seller]/[file]/route.ts): bad path404; upstream404 retained, other upstream failures503; success200/image/webp/no-store/nosniff, bounded3MiB streaming read,20s timeout. Error responses do not explicitly set success security/cache headers. No private Admin video exposed by this public handler.

Rendered Web pages /,/admin,/b2b,/huong-dan,/p/{id}/{slug} are UI routes, outside the API-handler operation count. Command actions are payload variants, not separate HTTP endpoints.

## Command payload variants

Single HTTP-API-013 admits13 actions: createDraft,saveDraft,saveIntake,addDictionary,uploadImage,setImageColor,uploadVideo,submit,approve,publish,returnDraft,unpublish,archive. User-facing withdraw corresponds to unpublish action, not a standalone /withdraw endpoint. key is UUIDv4 in body, not an Idempotency-Key header. id/expectedVersion required except createDraft/addDictionary (which reject these fields). Payload schema depends on action. Actor+operation+key and canonical body fingerprint define receipt/replay conflict; product lock/version checks and durable receipt/audit/outbox run transactionally. Media processing/storage happens before DB mutation transaction; API-04 must document external-side-effect/unknown-outcome implications. Replay does not authorize a new action or reuse changed payload.

## Findings for API-02

| ID | Source gap | Required follow-up |
|---|---|---|
| API01-F001 | Command OpenAPI success200 vs controller default POST201, including replay | Choose/document intended statuses per command/replay and reconcile spec/source; add meaningful HTTP assertion. Source inference based on [Nest controllers](https://docs.nestjs.com/controllers#status-code), not a new authenticated runtime test |
| API01-F002 | Public media source validates bad path as400; OpenAPI lists200/404/503 | Document backend400 vs Web proxy404 separately; refine overly shared Admin status sets per route |
| API01-F003 | Backend parser413 and error/header behavior; BFF converts upstream413 to503 while local413 is preserved | Specify body-limit/error/cache behavior across layers; review headers on Web media error paths and body stream failures |
| API01-F004 | Session capability labels vs actual active-principal admission; complete per-operation/resource policy record absent from inventory | API-03 must map current authorization checks and expected scoped policy explicitly; do not claim fine-grained RBAC already verified |
| API01-F005 | Some private reads ignore unknown query parameters; backend content-type behavior not an explicit contract | Define whether ignored/rejected, supported content types and response negotiation; do not infer support from image roadmap |
| API01-F006 | Command action-specific request/response/errors and retry/storage side effects need separate records | Apply RULE-API-001 per action within shared endpoint; no fake separate routes |

Findings describe documentation/verification gaps or source/spec drift. This task does not silently fix status or widen authorization and does not mark all findings as production defects.

## Evidence, traceability and completion

REQ-API01-INVENTORY-001 → pinned decorators/bootstrap/BFF →13 backend /10 proxy operations → source/OpenAPI comparison → findings above → API-02 contract records.16 source-file Git hash checks and13 path/method coverage checks passed; source statuses/headers are not all runtime-tested.

Existing bounded runtime evidence: [ACT006-RUNTIME-001](../operations/ACTIVATION006_CHECKPOINT_2026_10_07.md) has health/catalog200, withdrawn detail/media404 and unauthenticated Admin401; cold storage helper and rollback-only DB revocation are distinct from public-image HTTP200. No new runtime reads/writes or full Production Gate PASS claimed. GATE-CONTRACT-001/SEC/DATA/RELEASE remain governed by their complete criteria.

API-01 completed for inventory scope; API-02 next: reconcile F001/F002 and create request/response/error/data-precondition records first. PR19 rule and this inventory must retain independent review/source provenance.
