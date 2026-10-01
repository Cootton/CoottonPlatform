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
