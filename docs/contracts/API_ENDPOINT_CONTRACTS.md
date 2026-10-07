> API04-TX-001 · prepared follow-up: [transaction/media contract](API_TRANSACTION_MEDIA_RECOVERY.md) and [evidence](../governance/API04_EVIDENCE.md) bound retry/version/recovery behavior. Earlier API-04 pending notices remain historical; production and durable orphan cleanup are OPEN.

> **API03-AUTHZ-001 · 2026-10-07:** [Authorization matrix](API_AUTHORIZATION_MATRIX.md) and [ADR0008](../adr/0008-owner-catalog-authorization.md) supersede the prior API-03-pending checkpoint below for the current singleton owner slice only. Prepared policy explicitly maps read/action admission, rejects custom provider and rechecks readiness before receipt; full D08/live gates remain open. ACT006 runtime is unchanged.

# API-02 — Endpoint contracts and HTTP reconciliation

`API-02` · `REQ-API-CONTRACT-002` · 2026-10-07.
Source baseline main `a2d893e3b9828cc42691ac1d9a4e299a7c41dec1`. This change is prepared source/spec/tests; production remains ACT006 until a separately authorized deployment. Read [API-01](../engineering/API01_HTTP_INVENTORY.md), [OpenAPI](openapi.json), [ADR0007](../adr/0007-http-contract-reconciliation.md) and [runtime checkpoint](../operations/ACTIVATION006_CHECKPOINT_2026_10_07.md).

Owner-accepted RULE-API-001: **Mỗi endpoint phải mô tả request/response, quyền truy cập, điều kiện dữ liệu, tác động nghiệp vụ, hành vi khi retry hoặc xung đột, và bằng chứng kiểm thử.** Its full template/knowledge ADR is under separate [PR19](https://github.com/Cootton/CoottonPlatform/pull/19), not assumed merged. This record implements the rule within existing catalog scope.

## Common transport and data rules

- All backend routes use /v1. OpenAPI has machine-readable request/response schemas and per-operation expected statuses; default covers unexpected safe application failures, not ingress/platform responses. Successful JSON uses application/json. Public media is binary image/webp; private previews are JSON mime/base64.
- Cache-Control:no-store and X-Content-Type-Options:nosniff are installed before parsing, including recognized parser failures. Admin Web adds private,no-store. Application error body is exactly {code,message,requestId}; message equals safe code. Internal VERSION_CONFLICT/IDEMPOTENCY_CONFLICT and validation details remain private; generic409 CONFLICT does not tell the client which conflict occurred.
- Backend command POST requires application/json (optional charset parameters), maximum12MiB. Wrong media type/unsupported parser encoding or charset415 UNSUPPORTED_MEDIA_TYPE; oversize413 PAYLOAD_TOO_LARGE; malformed JSON/aborted or size-invalid body400 INVALID_INPUT. Parser rejection can precede authentication. Non-parser errors retain normal safe exception handling; no raw parser body/message logged or returned.
- GET is read-only: no canonical business mutation, no receipt/version increment; internal derived cache population is permitted. Safe retry re-evaluates current visibility/authorization; subsequent response can change. Unknown outcomes of command requests must reuse the same key and unchanged body, never assume timeout means rollback.
- Public catalog projections/DTOs are derived from PostgreSQL. Current visible ID/version and active references are checked; unavailable authority yields503, not stale private data. Withdrawn detail/media404 and list omission follow D09/ADR0005/0006. No-store cannot recall an already downloaded image.
- Admin identity: fresh nonanonymous Firebase ID token, configured project, signature/revocation/disabled checks; then active canonical principal from database. Session capability labels are reported UI capabilities, **not proof of action-level grants**. API-03 must reconcile D08 operation/resource policy with current single-owner admission. No new grants or auth bypass in this change.
- Public list/detail and private list reject unknown query keys. Other current private reads, liveness and media ignore query parameters; they never use query values to authorize/filter. API-02 documents this compatibility behavior rather than changing callers silently.
- OpenAPI is the serialization reference; TypeScript/parser validators remain execution authority. UUID input is v4 and normalizes case; versions are positive decimal strings capped at9223372036854775806 for commands. VND/reference prices use strings. No request/response implies purchase, stock availability or payment readiness.

## Read endpoint records

Each row uses the API-01 stable ID; HTTP request/output/status details are in [OpenAPI](openapi.json) and [inventory](../engineering/API01_HTTP_INVENTORY.md). Below completes authority, preconditions, effect/retry and evidence per endpoint.

| ID / operation | Request → response | Access / data preconditions | Business effect / retry or conflict | Verification evidence |
|---|---|---|---|---|
| HTTP-API-001 GET health/live | No body → status=alive,contractVersion | Public; process only, no DB readiness | Read only; retry safe; no409 | ACT006 health200; HTTP harness starts real Nest listener |
| HTTP-API-002 GET catalog/products | mode/category/limit/cursor → items,nextCursor,mode,commerceEnabled=false | Public; valid bounded query; restricted visible_product query, current ID/version checks on positive cache hits | No mutation; bounded keyset50max; retry may reflect newer visibility; bad query400/dependency503 | Existing cache/measurement-db tests and ACT006 catalog200; full parameter HTTP matrix pending API-05 |
| HTTP-API-003 GET catalog/products/{id} | UUID + skuAfter → product,optional chart,SKUs page,commerceEnabled=false | Public; current visibility/version/active refs; at most20SKU and201 chart cells | No mutation; hidden404; cache revalidation; no409 | cache/measurement-db checks; ACT006 withdrawn detail404; full positive HTTP schema test pending |
| HTTP-API-004 GET catalog/media/{seller}/{file} | asset UUID (legacy seller label) + SHA.webp → binary WebP | Public; publication flag; current visible_media association before private storage | No mutation; invalid input400 when enabled; disabled/hidden404; storage503; safe retry rechecks association | http-contract400/404/503 fixture; firebase-media helper; ACT006 hidden404. Positive public HTTP200 still unverified |
| HTTP-API-005 GET admin/session | No defined query → principalId,capabilities,commerceEnabled=false | Verified Firebase + active canonical principal | Read only; current admission rechecked, no grant mutation | Source record; transport401 fixture/shared guard only; full revoked/fresh identity matrix API-03/05 pending |
| HTTP-API-006 GET admin/catalog/products | after UUID → items,nextCursor | Same admission; no caller sellerId filter; page20 | Read only; invalid query400, dependency503 | Source/DTO contract; full authenticated HTTP pagination tests pending |
| HTTP-API-007 GET admin/catalog/products/{id} | UUID → product fields,intake,publication issues | Same admission; existing product; repeatable-read read-only transaction | No mutation; snapshot read; missing404; invalid400 | Source/schema contract; authenticated production-like HTTP checks pending |
| HTTP-API-008 GET admin/catalog/dictionaries | No defined query → items,applicability,configured=true | Same admission; active dictionaries limit501 | Read only; no dictionary mutation or409 | Source/schema; actual lookup outage/capacity tests pending |
| HTTP-API-009 GET admin/catalog/products/{id}/images/{asset} | product/asset UUID → JSON mime/base64 | Same admission; product/asset seller association | No mutation; missing association404; storage503 | Existing media tests; source checks; full cross-product HTTP evidence API-03/05 pending |
| HTTP-API-010 GET admin/catalog/products/{id}/thumbnails/{asset} | product/asset UUID → JSON mime/base64 | Same admission; thumbnail attached to product media | Read only; missing404; invalid400; storage503 | Existing media checks; full association HTTP test pending |
| HTTP-API-011 GET admin/catalog/products/{id}/video | product UUID → JSON video/mp4+base64 | Same admission; product/video seller association | Read only; private video never public via this route | Existing video checks; full authenticated association HTTP test pending |
| HTTP-API-012 GET admin/catalog/products/{id}/video/poster | product UUID → JSON image/webp+base64 | Same admission; product/video seller association | Read only; absent404, storage503 | Existing video/media checks; full association HTTP test pending |

## HTTP-API-013 — Command envelope

POST /v1/admin/catalog/commands receives {key,action,payload} for createDraft/addDictionary; all other actions also require {id,expectedVersion}. Unknown envelope/payload fields are rejected by action validators. **Success201 for both original completion and identical receipt replay**, explicitly preserving source behavior; no Location because one shared command resource has no new receipt URL.

Access is verified identity + active principal, with publication actions additionally gated by COOTTON_PUBLICATION_ENABLED=true and their canonical prerequisites. No operation-specific grant enforcement is claimed. All product commands lock current product and require matching version before mutation. Principal+action+key receipt and canonical input fingerprint are stored with result, canonical writes, audit and outbox in one transaction. Same key with changed body409; concurrent same-key race may surface409 from uniqueness rather than successful replay, so retry identical request after backoff/reconciliation. Receipt read occurs before version mutation: successful replay can return prior version even after later edits, and must not overwrite newer UI state. No guaranteed replay-retention duration is defined here.

Responses are AdminProductSummary (id,title,lifecycle,version; updated_at where selected) or {id,version:"1"} for addDictionary. Full schemas and13 discriminated payloads are in OpenAPI. Errors:400 input,401 identity,403 principal,404 product,409 version/receipt/lifecycle/constraint/readiness,413 body,415 type,503 dependency. Failures do not persist a successful receipt; audit/outbox failure rolls back database mutations.

| Action ID | Payload schema / conditions | Canonical business effect | Retry/conflict specifics / evidence |
|---|---|---|---|
| CMD-001 createDraft | title1–160; singleton seller configured | New DRAFT/product token; result product | Same-key receipt avoids another product; source checked, actual concurrent replay DB test pending API-04/05 |
| CMD-002 saveDraft | All draft fields; typed/null IDs; careDeclaration required when replacing nonempty care; active dictionaries/form applicability and seller-owned evidence | Replace draft fields, optional care evidence, version+1 | DRAFT/version guard; generic400/409; existing contract validators; DB HTTP checks pending |
| CMD-003 saveIntake | AdminIntakePayload: sourced declaration, fabric/GSM, <=100 variants,<=200 cells, typed stock/prices/tiers/location; active refs and no duplicate selections | Sourced intake/SKU/pricing and explicit inventory inputs; version+1; no implicit stock reset | DRAFT; invalid refs/stock below reserved rejected; no new actual merchandise data entered; existing intake tests, DB command integration pending |
| CMD-004 addDictionary | AdminDictionaryPayload; supported kind, code/token patterns, source; capacity500 | New dictionary with source; id/version1 result | No product id/version; uniqueness conflicts409; source/validators only |
| CMD-005 uploadImage | AdminImagePayload; valid bounded base64/image, rights+alt; DRAFT and gallery cap9 | Preprocess/store private image then transactional attachment/evidence/version | Media prep before transaction; failure may leave unreferenced object. Same-key retry cannot be treated as distributed exactly-once; existing media tests; API-04 recovery review pending |
| CMD-006 setImageColor | ImageColorPayload; asset attached to product, active SKU color, source declaration | Color-image association, private thumbnail/evidence/version | DRAFT/version; thumbnail prep before transaction; no arbitrary object path; existing media tests |
| CMD-007 uploadVideo | VideoPayload; optimized MP4 limits8MiB/60s; rights/alt; one video; DRAFT | Private normalized video/poster storage then association/evidence/version | External prep before transaction; existing video tests; orphan/concurrent retry recovery API-04 pending |
| CMD-008 submit | Empty payload; complete publication facts; DRAFT | IN_REVIEW,version+1 | Readiness/current facts conflict409; publication tests reject bad state/incomplete facts |
| CMD-009 approve | confirmed=true,declaration1–10000; complete facts; IN_REVIEW | Immutable human review snapshot; APPROVED,version+1 | No fabrication/self-grant; snapshot/version contract; publication tests |
| CMD-010 publish | Empty payload; APPROVED,complete current facts,exact reviewed snapshot still matches,not already visible | Current publication pointer/snapshot and version+1; commerce remainsfalse | Changed review/state/readiness409; only same-key replay returns receipt without another publish. Full HTTP transaction/replay proof pending API-04/05 |
| CMD-011 returnDraft | reason1–2000; not DRAFT/ARCHIVED | Hide publication and return DRAFT,source/evidence retained | Version/state guards; new-key duplicate fails409; existing lifecycle tests/source |
| CMD-012 unpublish (withdraw) | reason1–2000; currently visible; not DRAFT/ARCHIVED | Atomically hide and return DRAFT,version+1 | Identical replay returns prior receipt; fresh wrong version/state409; ACT006 rollback revocation + historical browser withdraw evidence, full replay HTTP pending |
| CMD-013 archive | reason1–1000; not already ARCHIVED | ARCHIVED,version+1; hide public projection/pointer; preserve immutable history | No hard delete; replay receipt vs new-key409; source contract, dedicated HTTP transaction proof pending |

## Web contracts

HTTP-WEB-ADMIN-001…009 map the same9 Admin operations through /api/admin. Bearer syntax and path allowlist precede forwarding; POST also requires exact configured browser Origin and application/json. Web keeps existing403 for Origin/type rejection; backend directly returns415 for unsupported command content type. GET-command/POST-read pairings404. Other framework methods/HEAD/OPTIONS are outside explicit inventory.

Web buffers at most12MiB; oversize413 PAYLOAD_TOO_LARGE, body stream read failure400 INVALID_INPUT and no backend call. Upstream200/201/400/401/403/404/409/413/415/503 are preserved; unexpected upstream status/network/timeout/config error503. All controlled responses are private,no-store/nosniff JSON. web-http tests cover201/409/413/415 forwarding, declared oversize, body stream failure and error headers. Live BFF/edge limits not certified by these mocks.

HTTP-WEB-MEDIA-001 GET /media/{seller}/{file}: legacy asset UUID+SHA.webp allowlist. Bad path404 (intentional Web concealment versus backend400); upstream404 retained, other failure503; empty error body. Success200 WebP, max3MiB bounded read,20s timeout,redirect denied. Both success/error responses no-store/nosniff. Tests cover invalid404/upstream404/503 and headers; no public video added.

## Finding disposition, traceability and gates

| API-01 finding | API-02 resolution | Remaining |
|---|---|---|
| F001 | Explicit HttpCode201; OpenAPI201 and replay documentation; real Nest HTTP fixture assertion | Actual DB replay/unique-race proof API-04/05 |
| F002 | Backend media400 added; per-route Admin statuses narrowed; Web404 distinction documented | Disabled publication/edge matrix and actual positive mediaHTTP |
| F003 | Headers before parsing; safe parser400/413/415; BFF preserves413/415; stream failure controlled; public error headers fixed | Full ingress/browser/streamed-limit acceptance API-05 |
| F004 | Current identity/principal admission explicitly separated from reported capabilities | OPEN API-03; no RBAC policy weakened or declared complete |
| F005 | Ignored/rejected query policy documented; backend JSON requirement implemented | Full query/content negotiation/auth ordering matrix API-05; ignored-query behavior retained |
| F006 |13 action records plus shared transaction/retry/storage effects and schemas | OPEN API-04 deeper transaction/media recovery proof |

REQ-API-CONTRACT-002 → RULE-API-001 / CORE / ADR0004–0007 → OpenAPI + this record + transport source → http-contract.cjs / web-http.cjs + existing scoped tests → GATE-CONTRACT-001,SEC,DATA,RELEASE. Test doubles certify transport and schema structure, not Firebase/grants/database correctness. Exact test/CI result is recorded in API02_EVIDENCE.md; pending is never PASS. Full Production Gates remain open. ACCEPTED business decisions and ACT006 runtime evidence retain original scope.
