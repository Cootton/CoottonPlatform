# Instructions for AI contributors

- Before GitHub reads/review/publication, follow [RULE-GITHUB-001](docs/governance/GITHUB_REVIEW_CAPACITY_RULE.md): pin SHA, inventory metadata and read scoped ranges/diffs; measure serialized write payload and prepare a complete review package. Prefer authenticated standard Git for large source changes when the approval path permits. Treat truncation, GitHub limits and reviewer-capacity failures separately. Never bypass approval through alternate transport, opaque hashes or fragmented writes after rejection. Rule thresholds are conservative Cootton defaults, not vendor limits; publish/merge/deploy states require their actual evidence.

> **MERGE-API04-001 · 2026-10-08:** PR19–23 đã merge theo dependency; source baseline `d2b34490385c20de773a81fdc1e6f58ca8d4ef08`. Đọc [merge checkpoint và kế hoạch triển khai riêng](docs/operations/API04_MERGE_CHECKPOINT_2026_10_08.md). Các ghi chú open/stacked/source proposal trước đây là lịch sử. ACT006 vẫn là runtime checkpoint đã kiểm chứng gần nhất; task này chưa triển khai hay kiểm chứng retry/media recovery trên production. API04-RECOVERY-002 và full Production Gates vẫn OPEN.

- Latest owner assignment 2026-10-03 supersedes historical design-only scope for this task: synchronize V001/OpenAPI and implement minimal human Admin plus canonical catalog draft/review/publication workflow. Owner has no actual product data yet; do not seed fictional products or publish invented facts. Bootstrap requires verified Firebase subject/project, never email authority. Existing D01/D08/D10 boundaries and inactive commerce remain. Read ADR0004 before implementation; no unrestricted runtime SQL/owner role or public deployment from this assignment.

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


- Owner assignment2026-10-07: fix PR16-F001 cold public media and PR16-F002 measurement withdrawal; run related API checks in CI. Read ADR0006/PR16_REVIEW_FIXES.md. Preserve applied001–005; new006 requires explicit maintenance/release execution. No product/stock reset, republish, new grants, commerce or indexing from source/CI fixes. Runtime evidence is separate from this prepared patch.

- Master Plan reading order: COOTTON_MASTER_PLAN.md → docs/governance/CURRENT_STATE.md → DECISIONS.md → TRACEABILITY.md → GATE_EVIDENCE.md → scoped contracts/ADR and V001. Preserve ACCEPTED decisions and appendices MP-ENG-001/MP-REVIEW-001; newer owner decisions and scoped evidence supersede historical planning/pending notices explicitly.
- Source/evidence overlay SYNC-PR16-001: source18768a1 through V001141; checkpoint2026-10-04 reports activation/publicationv22; browser2026-10-07 observed withdrawal to DRAFTv23 and public detail/catalog removal. Do not infer payment/AI/indexing/release approval from this journey. Record exact source SHA, reported vs observed evidence, reviewer signoff and recheck triggers before closing gates.

- SYNC-PR16-006: implementation authority is PR16 56f80580e50b43c94df65d3ae79ef025ea957123; read docs/governance/MIGRATION006_SOURCE_SYNC.md before migration/release work.006 is prepared, not production-applied;001–005 immutable. CI does not certify deployment. Earlier source18768a1 overlay is historical.

- **MERGE-PR16-001 · 2026-10-07:** PR #16 đã merge vào `main` tại `6205aa2ff1eee6c750fa277bb1faf5ae397c6ff6`; source fixes56f8058 được giữ nguyên. PR #17 đã chuyển base sang `main` và đang kiểm tra trước merge. Các ghi chú PR16 open/unmerged/stacked bên dưới là lịch sử. Migration006 vẫn chưa áp dụng production; merge không chứng minh runtime/deployment hoặc đóng Production Gates.


- ACT006-RUNTIME-001: owner assigned activation006 and explicitly authorized maintenance credential use/rollback-only production verification.006 applied/idempotent; API cootton-api-act006-3c768d6 receives100% traffic. Read docs/operations/ACTIVATION006_CHECKPOINT_2026_10_07.md. Boxy remains DRAFTv23; evidence closes only assigned patch scope, no full gates/commerce/republish.


- API02-CONTRACT-001: owner assigned endpoint contract completion and confirmed HTTP source/spec reconciliation. Read docs/contracts/API_ENDPOINT_CONTRACTS.md, ADR0007 and API02_EVIDENCE.md. Source/tests/PR scope only: no runtime migration/deploy/grant/data action. Command201/replay preserved, explicit parser/proxy errors prepared; API-03 authorization and API-04 transaction proof remain open. ACT006 remains runtime authority until scoped deployment.


- API03-AUTHZ-001: owner assigned endpoint/action authorization verification. Read API_AUTHORIZATION_MATRIX.md, ADR0008 and API03_EVIDENCE.md. Current source scope is a separately bootstrapped singleton human owner; never provision staff/AI grants from session labels. Exact allowed operations/action/readiness and canonical reauthorization apply before replay. Tests/PR only; applied migrations/V001/runtime unchanged. Subject-guard revocation proof assumes cooperating maintenance; custom-token human admission intentionally denied; media external recovery remains API-04.


- API04-TX-001: owner assigned transaction/idempotency/version/media-recovery verification. Read API_TRANSACTION_MEDIA_RECOVERY.md, ADR0009 and API04_EVIDENCE.md. Source/tests/PR scope only. Preserve exact-request retry with durable receipt and reauthorization;412 requires pinned-generation integrity checks. Never delete media on SQL catch/uncertain COMMIT. API04-RECOVERY-002 retention, durable intents and orphan cleanup remain OPEN; do not invent policy, execute migrations, grants or production deletes. Applied001–006/V001/runtime remain unchanged.
