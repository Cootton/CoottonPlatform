# D01 — Product / Catalog / SKU

Contract ID: `D01.catalog.v1`. Owner authorized D01 on 2026-10-01. This document locks the technical catalog design for the minimal product. It does not authorize database execution, business routes or production launch. Latest explicit owner decisions override historical planning text. No actual catalog facts are seeded by this document.

## 1. Ownership and identity

Product is a seller-owned listing of one model with consistent category, brand, form, design and material construction. Sellers with similar titles retain independent products; no automatic cross-seller deduplication. Brand means the actual product brand, not automatically Cootton. Seller identity is a reference owned by D07/D08, not defined here.

Variant and SKU describe the same sellable entity in this minimal system: one `catalog_sku` row, not two competing identities. Product has one or more SKUs. One SKU represents one color and one size. An explicit approved `ONE_SIZE` or `NOT_APPLICABLE` dictionary value is distinct from missing data; do not silently fill it. A different physical material construction or form requires a new product; descriptive corrections retain identity with evidence. Colors may vary but cannot change the declared fabric construction. Product reclassification requires admin review.

Every product/SKU/dictionary/media link has a server-generated UUID v4. Stable IDs never derive from name, SKU code, price, stock, email or phone. No reuse of archived IDs. A SKU is shared across B2B/B2C offerings and inventory references. D03 owns stock/reservations; D01 stores no competing stock count.

## 2. Controlled catalog

Initial category codes: `CREWNECK_TSHIRT`, `HOODIE`, `SWEATER`, `SHORTS`, `TROUSERS`. Display labels respectively Áo thun cổ tròn, Hoodie, Sweater, Quần short, Quần dài. These are planning definitions, not seeded database rows.

`RAGLAN` is a construction/design attribute, separate from category, form, size and SKU axes. Seller declares it only when correct. Design attributes do not generate variants or public pages.

Initial form definitions owned by Cootton: `BOXY` is a box-shaped, roomy cut; `REGULAR` a standard cut without intentional close fit; `SLIM_FIT` a closer cut. These are Cootton labels, not universal measurements or a fit guarantee. Real size chart remains authoritative. Alias Slimfit/Slim Fit maps to one value. Applicability is category-controlled: do not force shirt form onto trousers. `CLEANFIT` is reserved/inactive until admin supplies an approved, unambiguous definition and category applicability; seller cannot use inactive values. Seller cannot add custom forms. Further form/category/size/color/material values require controlled admin dictionary changes with audit, version and source; no free-text fallback enum.

## 3. Field dictionary

Unless noted, attributes below are product-level. Drafts may omit content fields; publish cannot. Database null means missing, never a fabricated fact. API patches distinguish omitted (unchanged) from null (clear when allowed). Empty text is not a valid substitute for missing.

| Field | Type / rule | Publish requirement / owner |
|---|---|---|
| id, sellerId | UUID, immutable; ownership server-derived | Always; backend |
| title | trimmed plain text, 1–160 Unicode characters | Required; seller |
| description | plain text, 1–10,000 characters; HTML rendered as text | Required; seller |
| categoryId | active approved category UUID | Required; seller selection/admin definition |
| brandId | approved brand UUID, including explicit unbranded dictionary entry when true | Required; no default Cootton |
| formId | approved applicable form UUID or null | Required where category requires form |
| designIds | unique approved applicable IDs, maximum 10 | Optional; no inferred Raglan |
| manufacturedIn | approved country code, distinct from shipping origin and fabric origin | Required sourced declaration |
| originEvidenceRef | private verified attachment or private declaration record reference | Required; never public link |
| careInstructions | plain text, 1–2,000 characters | Required sourced instructions |
| fabrics | 1–10 components with stable ID, role (MAIN/LINING/TRIM), material facts/source | Required main fabric |
| gsm | per fabric: UNKNOWN, EXACT or RANGE; decimal g/m², up to 2 decimals, positive, range min ≤ max | Explicit UNKNOWN allowed; never show 0 as missing |
| composition | optional sourced materials and decimal percentages up to 2 decimals; unique material IDs; total exactly 100.00 if supplied | If unknown, publish only truthful material description; no invented percentages |
| materialDescription | plain text 1–1,000 characters for each fabric | Required sourced description |
| factSourceRef | private source/declaration ref for material, composition and GSM claims | Required for supplied claims; unknown claims not generated |
| sizeChart | approved chart with named measurements, size IDs, unit CM, positive decimal values up to 2 decimals | Required for the initial clothing categories; no guessed measurements |
| media | 1–20 ordered approved public media references, alt 1–300 characters; lead image required | Asset processing/rights approval from D04 media boundary; no external hotlink as evidence |
| skuIds | server-owned child references | ≥1 eligible SKU required |
| lifecycle | DRAFT / IN_REVIEW / APPROVED / ARCHIVED | Backend transition commands |
| version | positive bigint serialized decimal string | Optimistic concurrency; backend |
| createdAt, updatedAt | timestamptz, server-generated RFC3339 API strings | Always |

Media processing belongs to the asset contract, not the D04 financial ledger package: historical package labels are ambiguous; always identify dependencies by contract name. D01 only references assets. Media URLs must be derived from approved storage records; evidence attachments remain private.

SKU fields: `id`, `productId`, `sellerId` (same as parent), `colorId`, `sizeId`, immutable `code`, `lifecycle` ACTIVE/ARCHIVED, `version`, timestamps. Color label alone does not guarantee displayed color fidelity; approved image mapping is explicit. SKU cannot override product origin/form/material to represent a different item. SKU physical changes create a replacement SKU/product; existing orders retain snapshots.

All scalar lengths and collection limits are v1 technical bounds, not claims about actual products. Decimal values travel as strings and use exact decimal arithmetic, not JavaScript floating-point sums. Database financial prices remain outside D01.

## 4. SKU code

Server generates `SELLER-MODEL-COLOR-SIZE`, uppercase ASCII tokens separated by hyphens, maximum 64 characters. SELLER and MODEL are server-allocated immutable public-safe catalog tokens; COLOR/SIZE use immutable dictionary tokens. Token grammar `[A-Z0-9]{1,16}`; codes contain no PII, price, GSM, mutable form names, channel or stock. Example `S8H2-M104-BLK-M` is illustrative only. Token allocation is collision-checked, never inferred from private identifiers.

SKU code is globally unique for the lifetime of the platform, including archived SKUs. Product/color/size tuple is unique, including archived rows. Concurrent creation must use database uniqueness, not a prior lookup alone. Codes are immutable in v1; no rename/alias subsystem is needed. Display-label corrections do not regenerate code or ID. Draft invalid SKU is corrected before creation; erroneous persisted SKU is archived and explicitly replaced, never reused. A SKU cannot be duplicated for different sales modes.

## 5. Logical PostgreSQL schema specification (not a migration)

Tables belong to one modular monolith database. Names/types below are locked design; generating executable DDL requires a separately authorized migration task and its dependencies. No tables are created now.

| Relation | Main columns / PostgreSQL types | Constraints / indexes |
|---|---|---|
| catalog_dictionary | id uuid PK; kind text; code text; label text; definition text; token text; active boolean; version bigint; applicable category refs | unique(kind,code), unique(kind,token); uppercase codes/tokens; version >0; FK applicability; dictionary archival rather than hard delete |
| catalog_product | id uuid PK; seller_id uuid reference D07; model_token text; title/description/care text; category_id/brand_id/form_id uuid; manufactured_in text; private origin ref; lifecycle text; version bigint; created_at/updated_at timestamptz | unique(seller_id,model_token), unique(id,seller_id); scoped seller ownership; bounded fields; lifecycle check; index(seller_id,updated_at,id); public listing index only approved candidates |
| catalog_product_design | product_id uuid; design_id uuid | composite PK; restrictive FKs; correct dictionary kind/application validated transactionally |
| catalog_fabric | id uuid PK; product_id uuid; role text; description text; source_ref uuid; gsm_kind text; gsm_min/gsm_max numeric(8,2) nullable | kind-specific nullability and positive values; exact min=max; range min≤max; product/role index; MAIN existence validated on publish |
| catalog_fabric_composition | fabric_id uuid; material_id uuid; percent numeric(5,2) | composite PK; 0<percent≤100; exact total validated in one publish transaction under parent lock; no floating-point CHECK sum across rows |
| catalog_size_chart_row | product_id uuid; size_id uuid; measurement_id uuid; value_cm numeric(8,2) | composite PK; positive values; approved measurement definitions; completeness by category reviewed on publish |
| catalog_product_media | id uuid PK; product_id uuid; sku_id uuid nullable; asset_id uuid reference media boundary; position smallint; alt text | unique(product_id,position), valid positive position; SKU if supplied must belong to product; asset rights/status/ownership verified; restrictive FKs |
| catalog_sku | id uuid PK; product_id uuid; seller_id uuid; color_id/size_id uuid; code varchar(64); lifecycle text; version bigint; timestamps | FK(product_id,seller_id) to product; unique(code); unique(product_id,color_id,size_id); index(product_id,id), index(seller_id,updated_at,id); no price/stock columns |

Dictionary kinds category/brand/form/design/color/size/material/country/measurement are separate semantic values in one controlled registry, not arbitrary JSON enums. Foreign key existence alone does not prove correct kind: backend verifies expected kind and active applicability within the write transaction; migration must enforce kind-safe references through composite constraints or equivalent database design. Dictionary keys never change semantic kind. Country dictionary uses approved country codes; no invented list is seeded.

PostgreSQL constraints must bound version/integer/decimal values and validate UUID references. `ON DELETE RESTRICT` for business references; archive instead of deleting used entities. Cascaded destruction of order/stock/evidence references is prohibited. Publish counts and aggregate composition constraints require transactional validation; do not pretend row CHECK constraints cover cross-row rules. Seller/media tables are dependencies, not placeholders created by D01.

D02 owns one offering per SKU/mode with unique(sku_id,mode), effective versioned all-unit SKU price tiers, integer VND and permissions. D03 owns one canonical inventory identity per SKU/location. No separate B2B/B2C product or stock row. MOQ unit, financial rounding, seller minimum interaction and quantity packaging remain D02 decisions; D01 does not silently resolve them.

## 6. Commands, states and publication

Specification only; these endpoints are not exposed by current API. Future /v1 commands: create draft, patch draft, add/archive SKU, submit, approve/reject, archive product; list/get public projections. Seller principal supplies no trusted sellerId. All mutations require authentication, seller ownership or explicit admin scope, request idempotency and expected product version. Version mismatch → CONFLICT; stale idempotency key with different payload → CONFLICT. Locks/order of writes must serialize SKU creation against approval/archival and avoid publishing partial children.

DRAFT → IN_REVIEW requires complete source data. IN_REVIEW → APPROVED requires authorized moderator and validation; IN_REVIEW → DRAFT is rejection with reason. APPROVED → DRAFT withdraws publication before a seller edit; edit increments version and must be reviewed again. ARCHIVED is terminal in v1 and blocks new sale; historical orders remain available. Privileged archive can transition any nonarchived state with reason and audit. No client sets lifecycle directly. SKU ACTIVE is only catalog eligibility, not in-stock or purchasable proof.

Publication requires: approved product, approved/applicable dictionaries, seller active and allowed mode, valid sourced fields, complete size chart, approved image, active eligible SKU, effective valid D02 offering for the requested mode. Missing dependent eligibility yields unpublished/unavailable, not fake prices or automatic approval. Zero stock may still expose a truthful out-of-stock approved page; order creation is blocked by D03. Archiving the last eligible SKU withdraws purchase eligibility. Dictionary/seller/asset revocation must invalidate dependent projections and be rechecked at checkout, even before caches catch up.

Atomic mutation: validate principal/idempotency/version → lock product → write aggregate + audit + persisted idempotency result + outbox in the same transaction → commit → project asynchronously. Outbox and audit implementations depend on the locked core mutation contract; no workers created here. Version increments once per accepted aggregate command. SKU writes also increment parent version. Consumers dedupe event ID; obsolete aggregate versions cannot overwrite newer state. Event payload uses IDs/version/action, no origin evidence/customer data/model memory.

## 7. Public URL and read contract

One canonical product URL `/p/{productId}/{slug}` for both B2C and B2B. Slug is a descriptive projection, not identity; resolve by UUID, redirect obsolete slug to current canonical with 301. Product titles normalize deterministically to a bounded 120-character Vietnamese-transliterated URL-safe slug; empty resulting slug uses `san-pham`. Different products may share slug because ID ensures uniqueness. No customer data or private evidence appears in path/query. Opaque UUID is not encryption or authorization.

Buyer B2C is default; B2B entry `/b2b` is a public navigation context for eligible offerings, not a duplicate product identity. Mode query `?mode=B2B` and SKU selection query do not create independently indexable product pages; canonical remains product URL. Only approved eligible public product pages enter sitemap; accounts/seller/admin/private evidence and arbitrary facets are noindex. Real URL handlers, redirects and metadata will be implemented in D09; current Web stays noindex. Structured data must reflect actual visible eligible price, never wholesale lowest tier as retail price; D02/D09 owns its final mapping.

Public DTO allowlists approved product facts, public seller identity, media, size chart, selected SKU options and eligible mode offering references. Excludes evidence refs, private declarations, moderation reasons, internal audit, vendor costs and private seller finance. Public GET cannot reuse the private seller DTO.

List contract: limit 1–50, default 20; deterministic keyset (updatedAt,id), filter/sort-bound opaque cursor validated server-side, no OFFSET or full-table loading. Stale/invalid cursor returns INVALID_INPUT. Ordering descending uses strict tuple comparison; concurrent updates may move rows and listing is not a frozen snapshot. Clients dedupe IDs. SKU child lists have separate bounded pagination; product detail does not load unlimited variants. Media count ≤20, design count ≤10. Indexes follow these actual query predicates; no speculative search service/partition/sharding.

Cache only public projections, keyed by product/version and mode eligibility. Private responses no-store. Cache/search/SEO never authorize prices/stock; checkout rechecks canonical backend. Core functions without AI. AI can suggest catalog changes only from sourced facts and scoped grants; cannot publish unsupported facts or change schema from admin settings.

## 8. Input/error and acceptance

| Input/event | Required result |
|---|---|
| Empty title, required null, invalid decimal/unit/dictionary | Controlled INVALID_INPUT; preserve draft only if explicitly allowed |
| Duplicate SKU/code/concurrent tuple creation | CONFLICT; one persisted entity, retry returns recorded result |
| Another seller's product/SKU | Resource authorization denial without leaking private existence |
| Client price/stock/role/lifecycle/unknown input fields | Reject; no mass assignment |
| Composition supplied but total ≠100.00 | Publish denied; no normalized/fabricated percentages |
| Missing GSM | Explicit UNKNOWN; no fabricated SEO claim; other requirements still apply |
| Cleanfit inactive/custom seller form | INVALID_INPUT; use approved applicable dictionary |
| Approval revoked/asset no longer approved/stale cache | New publication/purchase denied after canonical revalidation |
| B2B/B2C same SKU | Same stable SKU/inventory identity, separate D02 offering |
| Schema needs new field | Versioned GitHub contract change, not arbitrary admin JSON |

D01 acceptance: every field has owner/type/source/null rules; product/SKU/seller identity and uniqueness scopes are explicit; material/GSM/form semantics separated; publish state and cross-domain gates defined; public/private fields separated; canonical URL/indices/pagination bounded; no schema or business writes executed. Review examples use illustrative IDs/facts, not seeded products.

Next D02 locks SKU price tiers, quantity/MOQ unit, minimum precedence and versioned quote. D01 schema can only become a migration after seller/media/dictionary constraints, idempotency/audit/outbox storage and safe rollback have their executable contracts. Financial D04 dependencies must be ready before checkout, not before this catalog design. No claim of end-to-end commerce readiness.
