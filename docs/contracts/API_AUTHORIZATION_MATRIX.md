# API-03 — Endpoint/action authorization matrix

`API-03` · `REQ-API-AUTHZ-003` · 2026-10-07.
Source baseline [PR21](https://github.com/Cootton/CoottonPlatform/pull/21) head `b2a72dd6f16660ce63f597ea7ddb7785c9c9cdc5`; main remains `a2d893e3b9828cc42691ac1d9a4e299a7c41dec1`. Prepared source/tests only. [D08](D08_ADMIN_RBAC_POLICY.md), [ADR0004](../adr/0004-admin-catalog-workflow.md), [ADR0008](../adr/0008-owner-catalog-authorization.md), [API-02](API_ENDPOINT_CONTRACTS.md) and [evidence](../governance/API03_EVIDENCE.md) govern interpretation.

## Effective owner boundary

Migration002 has UNIQUE(singleton) + CHECK(singleton) on both principal and seller. Therefore the current catalog is a one-human-owner/one-Cootton-seller slice, not a database of staff/AI principals or per-operation delegated grants. An active principal is the separately bootstrapped owner binding, never a role from a token/request. API-03 makes the existing operation boundary explicit without adding accounts/grants/schema or ratifying full D08 implementation.

Admission: valid Bearer syntax → Firebase SDK verifyIdToken(token,true) → configured issuer/audience/project + matching uid/sub + human provider (anonymous/custom/missing rejected) + auth_time not future and <=3600s → active singleton canonical principal → fixed read/action allowlist → publication readiness where applicable → resource association/state/version → existing mutation/receipt/audit/outbox. Token role/email/capabilities/host and client product IDs do not grant authority. Current custom-token Admin admission is intentionally removed to keep service/AI custom credentials outside the human endpoint; review any future custom-token consumer through a separate explicit identity decision.

Both session labels and command decisions are derived from the same fixed owner policy, but capability strings are not provisioned D08 grants. All allowed owner actions still enforce their domain validators and readiness. Catalog intake may contain explicit owner inventory inputs from the existing assigned workflow; this does not grant AI physical-stock attestation or activate commerce.

## Endpoint matrix

| Stable ID / operation | Anonymous / invalid identity | Verified buyer, unbound staff or AI subject (even claim ADMIN) | Active bound human owner | Resource / state restriction | Evidence |
|---|---|---|---|---|---|
| HTTP-API-001 GET health/live | Public200 | Public200 | Public200 | Process only, no private access | Real HTTP test with private DB unavailable |
| HTTP-API-002 GET catalog/products | Public safe reads | Same public projection | Same public projection | Current visible/version/active references, bounded query | Existing cache + measurement DB tests; no new auth coupling |
| HTTP-API-003 GET catalog/products/{id} | Public safe reads | Same public projection | Same public projection | Hidden404/current refs; excludes private facts | Existing withdrawal/cache/DB evidence; positive full HTTP still API-05 |
| HTTP-API-004 GET catalog/media/{seller}/{file} | Public safe media | Same public projection | Same public projection | Current visible_media before private Storage; label seller is asset UUID | Existing firebase-media and ACT006 hidden404; no blanket public image200 proof |
| HTTP-API-005 GET admin/session |401 |403 | catalog.read | Current active singleton owner, no enrollment/role assignment | AUTH03-HTTP-001 + owner-policy |
| HTTP-API-006 GET admin/catalog/products |401 |403 | catalog.read | Single canonical seller enforced by schema; bounded list; no arbitrary sellerId filter | HTTP negative + allowed list200; PostgreSQL singleton constraints |
| HTTP-API-007 GET admin/catalog/products/{id} |401 |403 | catalog.read | Existing canonical product; read-only repeatable snapshot | HTTP deny before business reads; owner missing404 |
| HTTP-API-008 GET admin/catalog/dictionaries |401 |403 | catalog.read | Active canonical dictionaries, bounded | HTTP denied matrix + owner200 |
| HTTP-API-009 GET product images/{asset} |401 |403 | catalog.read | Asset attached to requested product and matching seller | Real PostgreSQL A/B media associations + Storage stub call count |
| HTTP-API-010 GET product thumbnails/{asset} |401 |403 | catalog.read | Thumbnail attached through requested product media; single seller schema | Same A/B PostgreSQL checks |
| HTTP-API-011 GET product video |401 |403 | catalog.read | Product/video seller association | PostgreSQL missing A404/attached B preview |
| HTTP-API-012 GET product video/poster |401 |403 | catalog.read | Same association; never public via Admin path | PostgreSQL A/B poster checks |
| HTTP-API-013 POST commands |401 on well-formed JSON |403 on valid envelope | Exact action mapping below | Canonical admission again before receipt/write; no arbitrary command | All13 denied/replay admission; real createDraft + revoke race |

401 assumes configured identity verifier; unconfigured/outage503. Parser/schema failures may occur before authorization and return400/413/415. Tests use valid envelopes for authorization assertions so these boundaries are not confused. No resource ID/product query is used as an authorization substitute.

## Action matrix

All13 actions require active bound human owner. Buyer/staff/AI subjects are denied403 before any successful receipt or canonical business mutation, even if token/request advertises ADMIN/catalog.publish. Unknown payload action400 by input allowlist; unknown internal policy operation403; payment/refund/grant/SQL actions are unavailable, not extensions of owner catalog authority.

| Action ID | Action | Owner capability alias | Additional readiness/resource/state | Authorization evidence |
|---|---|---|---|---|
| CMD-001 | createDraft | catalog.draft | Singleton seller configured; title validator | Actual PostgreSQL authorized write + audit/outbox/receipt; denied/revoked tests |
| CMD-002 | saveDraft | catalog.draft | Existing product,DRAFT,current version,owned evidence | Per-action admission/replay/denial; complete domain HTTP API-04/05 pending |
| CMD-003 | saveIntake | catalog.draft | Existing product,DRAFT; sources/typed stock/pricing bounds | Same admission tests; no AI stock attestation or commerce permission |
| CMD-004 | addDictionary | catalog.draft | Typed kinds/sources/capacity; no product id/version | Same admission tests; uniqueness/domain integration API-04/05 |
| CMD-005 | uploadImage | catalog.draft | Existing DRAFT/current version,cap9; preflight admission before Storage | Same admission tests; external-prep race remains API-04 |
| CMD-006 | setImageColor | catalog.draft | Attached asset + active SKU color/source | Same admission tests; thumbnail prep race API-04 |
| CMD-007 | uploadVideo | catalog.draft | Existing DRAFT/current version,one video,media limits | Same admission tests; external-prep race API-04 |
| CMD-008 | submit | catalog.review | Publication flag,complete facts,DRAFT | Enabled owner admission; disabled409 even replay; publication state validators |
| CMD-009 | approve | catalog.review | Publication flag,IN_REVIEW,human confirmation + exact snapshot | Same admission/readiness; no AI self-review |
| CMD-010 | publish | catalog.publish | Publication flag,APPROVED,unchanged reviewed snapshot | Same admission/readiness; commerce stays disabled |
| CMD-011 | returnDraft | catalog.review | Publication flag,not DRAFT/ARCHIVED | Same admission/readiness; source retained |
| CMD-012 | unpublish (withdraw) | catalog.publish | Publication flag,current visible/not DRAFT/ARCHIVED | Same admission/readiness; immutable history retained |
| CMD-013 | archive | catalog.draft | Existing product/not already ARCHIVED | Same admission/replay checks; no hard delete |

Owner positive policy/admission tests for all13 actions do not prove each action's complete business success. Replay fixtures exercise the **real service** receipt paths and authorization before the receipt; they do not replace API-04 fingerprint/retention/concurrency acceptance. A concrete authorized createDraft is executed against disposable PostgreSQL, not production.

## Revocation and resource evidence boundaries

AUTH03-DB-001 exercises actual001–006 migrations in the dedicated loopback cootton_api_test under cootton_test, creates explicitly synthetic data then cleans only this isolated fixture. It refuses unknown preexisting catalog schema/roles. Runtime-style SELECT-only principal permission cannot change active state; no new production grant is introduced.

Commands retain the existing subject advisory transaction guard before owner recheck/receipt/product locks. The controlled maintenance revoker must take that **same subject guard** before changing principal.active. Tests show both orders: revoke-first→403/no additional receipt; command-first→revoker lock timeout while admission/write held, then command commits and revoke becomes effective for subsequent requests. This proves the cooperating guard protocol, **not** safety against a privileged maintenance writer that ignores it. No owner-revoke endpoint or last-owner recovery workflow is added.

Private reads recheck admission per request; reads already admitted under a snapshot may finish. Firebase verify/revocation is checked at request entry, not by a network call inside retried database transactions. Revoke cannot recall bytes already delivered.

Media preparation precedes the final database transaction. Final canonical reauthorization prevents attachment/receipt after principal revocation; a preparation already admitted can still write an unreferenced private object. Strong external side-effect recovery/cleanup/idempotency requires API-04; no zero-orphan/instant external revocation claim.

## Findings and completion

| Finding | Resolution / remaining status |
|---|---|
| API01-F004 / AUTH03-F001 | Clarified actual singleton owner boundary; explicit operation/action policy; all read/action deny cases covered. Full D08 staff/AI grant scope/expiry/membership engine is LATER and remains an adoption gate, not silently granted |
| AUTH03-F002 | Reject custom/anonymous/missing provider and uid/sub mismatch; recheck canonical identity freshness at service admission |
| AUTH03-F003 | Publication readiness now checked before receipt replay; disabled publication command409 even if previously completed |
| AUTH03-F004 | Existing cooperating subject guard verified with real PostgreSQL revoke/write ordering; unrestricted maintenance bypass remains outside protocol |
| AUTH03-F005 | Cross-product private image/thumbnail/video/poster associations checked with actual SQL and zero Storage calls on rejection |
| AUTH03-F006 | Live Firebase/provider configuration, actual runtime role/grant introspection, incident recovery/denied-read audit/MFA and media external race not certified; relevant production gates remain OPEN |

API-03 completion means the assigned **current human-owner endpoint/action authorization scope** is reviewed and tested in prepared source/CI. It does not mean full D08, live security acceptance or deployment. [API03_EVIDENCE](../governance/API03_EVIDENCE.md) pins exact CI and separates doubles from real SQL. Accepted contracts, inactive commerce and ACT006 runtime remain unchanged.
