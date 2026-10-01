# Instructions for AI contributors

- Start with COOTTON_WORKING_V001.md, docs/contracts/CORE.md and docs/adr/0001-foundation.md. The owner authorized repository foundation and core transport contracts on 2026-10-01. Owner additionally authorized secure Neon connectivity, read-only SELECT 1 and GitHub publication on 2026-10-01. This scope does not authorize schema/migrations, production commerce, runtime owner-role use or deployment.
- Follow the latest explicit owner decisions and section 106 overrides; do not interpret historical no-tests phrases as the current absolute rule.
- Do not invent executable schemas, business policies, providers, rates or missing actual data. Mark unresolved decisions explicitly.
- No application coding, provisioning, migrations, financial actions or deployment until the owner assigns that scope.
- Keep stable IDs, canonical backend ownership, ledger integrity, idempotency and authorization boundaries.
- AI is optional; core services must function without it. Preserve per-model isolation and data-processing restrictions.
- Use only necessary scoped permissions. AI_SUB_ADMIN cannot self-escalate.
- Never commit secrets, owner private identifiers, customer data or banking login information.
- Maintain V001 in place. Do not create a new working version without explicit owner instruction.

- Owner authorized D01 Product/Catalog/SKU contract and logical schema design on 2026-10-01. Read docs/contracts/D01_PRODUCT_CATALOG_SKU.md before catalog work. This authorization does not execute DDL/migrations, publish actual catalog data or expose business handlers.

- Owner authorized D02 pricing/MOQ/quote design on 2026-10-01 and confirmed PIECE quantities, no packs. Read docs/contracts/D02_PRICING_MOQ_QUOTE.md. Logical schema/documentation only; do not activate unspecified financial policies or execute database migrations.

- Owner authorized D03 cart/checkout/stock-reservation design on 2026-10-01 with D04 financial contracts required before execution. Read docs/contracts/D03_CART_CHECKOUT_INVENTORY.md. No migrations, actual holds/orders/payments or fake financial ports from this scope.

- Owner authorized D04 financial contract/logical design on 2026-10-01. Read docs/contracts/D04_FINANCE_PAYMENT_RECONCILIATION.md. CP_MILLI precision, single tender and seller-net commission floor are owner-approved; VC/VCS activation explicitly blocked pending source/rate/backing. No real ledger/payment/top-up/migration or D03 execution from this task.

- Owner authorized D05 direct-sale order/shipping design on 2026-10-01. Read docs/contracts/D05_ORDER_SHIPPING.md and V001 section 117: one Cootton seller, website before payment, CP top-up paused and points inactive for launch. Refund baseline updated; no real order/carrier/payment writes or migrations authorized.

- Owner authorized D06 return/refund/restock design on 2026-10-01. Read docs/contracts/D06_RETURN_REFUND_RESTOCK.md and V001 section 118. Owner approved inclusive delivery+15x24h request cutoff and clothing/complaint conditions. No actual refund/restock/return booking or migrations authorized; points remain inactive.

- Owner authorized D07 single-seller Cootton management/business-reporting design on 2026-10-01. Read docs/contracts/D07_SELLER_BUSINESS_REPORTING.md and V001 section 119. Unknown costs/COGS must remain incomplete, no fake profit/self-commission/payout. No actual staff/seller/cost/report jobs, migrations or application handlers authorized.

- Owner authorized D08 Admin/RBAC/policy design on 2026-10-01. Read docs/contracts/D08_ADMIN_RBAC_POLICY.md and V001 section 120. No actual accounts/grants/claims/policy activation or security-sensitive access provisioned. Admin/AI roles do not bypass feature readiness, immutable contracts, evidence or owner bootstrap.

- Owner authorized D09 UX/SEO/help documentation and logical design on 2026-10-01. Read docs/contracts/D09_UX_SEO_HELP.md and V001 section 121. Keep current noindex until assigned release readiness; indexable catalog does not enable purchase. No runtime UI/metadata/robots/sitemap/accounts/migrations or deployment authorized by D09.

- Owner authorized D10 operations/monitoring/backup/DR/release-readiness documentation on 2026-10-02. Read docs/contracts/D10_OPERATIONS_BACKUP_RELEASE.md and V001 section 122. App release count is not financial/data retention. No cloud/backup jobs, actual grants, migrations, restore/delete, secrets, deployment workflow or runtime changes authorized. Recovery evidence remains unexecuted; no automatic coding task after D10.

- Latest owner authorization 2026-10-02: implement empty database-backed catalog website, actual product data later. Read docs/adr/0003-catalog-read-slice.md and CATALOG_SETUP.md/V001 section123. Additive read projection migration001 and restricted reader executed; no canonical write/publisher/private CRUD or payment/stock seed authorized. Preserve current noindex and D10 production gates. Original maintenance .env must not serve the API; runtime uses ignored .env.catalog/public-view-only role. Production backup/deploy/billing/access actions require their actual scope/readiness; no auto data publication.
