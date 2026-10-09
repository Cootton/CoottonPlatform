# TASK-SEARCH-001 — Native Cootton catalog search

2026-10-09. Source baseline: `02bfad3020f0265219055dd9991108cfa87f625c`.

Owner messages: “chốt tông tím -trắng” and latest “viết ứng dụng cho riêng cootton”. These authorize application implementation and the color direction. The supplied WooCommerce marketing text is inspiration, not verified capabilities or approval of each algorithm/infrastructure choice.

Scope: native bounded public product search, Vietnamese text matching, same-SKU color/size filters, live search with accessibility controls, SSR fallback and purple/white storefront. Follow-up includes pure three-criteria scoring and authenticated Admin CPM simulation. Implementation status: SOURCE_IMPLEMENTED, REVIEW_PENDING. Contracts: D01, D09, CORE, API-02, SEARCH-ADS-001; ADR0001/0003/0004/0005/0006/0010. Gates: CONTRACT, DATA, SEC, UX, PERF, RELEASE.

Invariants: restricted visible views only; stable IDs; public DTO allowlist; current publication visibility; noindex; commerceEnabled=false; no fake catalog, production database writes, migrations, grants, deployment or change to paused API04 work. Existing list/detail contracts stay compatible.

Technical ranking and bounds are implementation defaults, not ACCEPTED business policies. AI, external search providers, analytics retention, price/stock commerce filters and production performance budgets remain outside this slice. No search text persisted by the application; ingress log policy must be reviewed separately before release.

Evidence: [EVD-SEARCH-001](../governance/COOTTON_SEARCH_EVIDENCE.md); actual production/visual/performance evidence absent. Recovery: source revert only; runtime rollout NOT_READY. No reviewer signoff or release approval recorded. Owner kept weights/auction formulas as a trial proposal; they are not live ranking, billing or release approval.

GitHub handoff: source publication blocked by automatic approval-review input capacity; no PR created. Local code and full patch prepared. Remote task branch remains at original baseline; main unchanged. See EVD-SEARCH-001 for exact failures and reviewer limits.
