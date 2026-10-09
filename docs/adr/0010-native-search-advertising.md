# ADR0010 — Native Cootton search and advertising simulation

2026-10-09. Status: source implementation within explicit owner assignment; business scoring/auction formula PROPOSED. No ACCEPTED algorithm or production activation inferred. Source/decisions: [SEARCH-ADS-001](../contracts/COOTTON_SEARCH_ADVERTISING.md).

Use existing Nest modular monolith, PostgreSQL visible views, shared TypeScript contracts and Next SSR/BFF. Add `/v1/catalog/search`, retain list/detail handlers and applied001–006 unchanged. Prefer bounded literal token matching and a version/filter-bound rank cursor over new indexing services or a WordPress plugin. This keeps backend publication and safe projections authoritative; queries still require performance assessment on actual catalog before release.

Owner chooses relevance, verified reviews, seller trust, CPM and Cootton-first operation. Owner expressly keeps 60/25/15 and first-price quality-adjusted auction as a trial proposal. Pure score/auction functions and an authenticated Admin simulation are added; no ratings ingestion, bidder write route, campaign persistence, impression endpoint, charging or public sponsored results are enabled. Missing verified signals remain null. Multi-seller admission remains future work with D07/D08 revision.

Consequences: no migrations/providers/new production dependencies; full catalog server filtering; no stale search-result cache; noindex/commerce=false preserved. Literal scanning and correlated SKU filters can cost more than an index; existing statement/query timeout and bounded page/token counts apply, but no workload budget claimed. Anonymous discovery requires rate-limit/logging review before public release. Query text is not persisted by app code; infrastructure access logs remain separate.

Recovery is source revert only. No runtime traffic change, IAM/grants or production SQL occurred. Actual release gates, future ad ledger/budget/evidence contracts and paused API04 dependencies remain open. No accepted architecture decision superseded.
