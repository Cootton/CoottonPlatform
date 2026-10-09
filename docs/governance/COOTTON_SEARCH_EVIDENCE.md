# EVD-SEARCH-001 — Source implementation evidence

2026-10-09, Windows local workspace. Baseline main `02bfad3020f0265219055dd9991108cfa87f625c`; changed source fingerprints: [manifest](COOTTON_SEARCH_SOURCE_MANIFEST.json). Local code/tests are the evidence scope; no remote CI PASS or deployed source SHA inferred.

| Check | Result | Scope / limitation |
|---|---|---|
| Shared contracts/API build and Web type check | PASS | TypeScript5.9.3, Node24.19.0; dependencies from unchanged lockfile |
| Next production build | PASS | Next16.3.8 webpack, local workerThreads; source-only, no deployment |
| Declared contracts + API verification scripts | 50 PASS, 1 SKIP, 0 FAIL | Search parser/DTO/scoring/auction; actual Nest HTTP400/200/503; existing authorization/cache/media/HTTP regressions. Optimized video skipped without local FFmpeg fixture |
| Production Next HTTP/SSR | PASS,6 scenarios | Actual built Next listener with temporary empty backend fixture: SSR filters, B2B, noindex, duplicate400/no-store BFF, public200/no commerce, login-first Admin hiding. No Firebase login executed |
| Search SQL execution | PASS,10 scenarios | PostgreSQL18.3/PGlite0.5.8 in memory, rolled back. Vietnamese/literal punctuation, same-SKU, exact filters/SKU, B2B, cursor tie-break and withdrawal. Not PostgreSQL16/Neon proof |
| PostgreSQL16 canonical visibility/reader checks | PENDING CI | New `catalog-search-db.cjs` in DB suite; existing001–006 measurement test extended to verify search visibility. Loopback/cootton_api_test checks precede connection; no production SQL |
| Browser visual/responsive, live typing/races, screen reader and accessibility audit | NOT EXECUTED | Responsive CSS/labels/IME/cancellation implemented; HTTP/SSR tests do not validate browser interaction |
| Production relevance quality / latency / throughput / ad delivery/billing | NOT EXECUTED | No verified reviews/trust source, approved score policy, valid-impression contract or real ad financial flow |

Local runtime limitations: async realpath/mkdir and workspace symlinks failed with Windows EPERM. Dependencies were installed to an ignored workspace store using a hoisted layout, and built contracts copied into ignored node_modules. A local helper outside the repository used synchronous equivalents for realpath/mkdir during builds. These are verification accommodations, not application source or lockfile changes. PGlite was installed only in an external verification directory, not production dependencies.

The first HTTP check hit loopback EACCES before network permission was granted; rerun passed. An overly broad test glob accidentally included two real Firebase/GCS scripts; both failed at missing configuration and no credentials were provided. Reran only declared repository suites. No cloud resources/data/traffic were changed. Do not hide those failed exploratory runs or interpret the final scoped PASS as API04 runtime proof.

Reviewer signoff: absent. Owner decisions: three score criteria, CPM, Cootton-first; formulas remain PROPOSED by explicit owner choice “Giữ đề xuất để thử nghiệm”. Gates CONTRACT/source checks pass only for recorded cases; DATA/SEC full runtime, UX browser, PERF workload, OPS/RELEASE and ads finance remain OPEN. **NOT READY TO DEPLOY**. Paused API04 workflow and existing runtime authority remain unchanged.

Recheck triggers: changes to query/ranking/cursors, dictionary/visibility projection, scoring inputs/policy, bidder eligibility, Next/Firebase/pg versions, activation or ingress logging/rate limits. Source rollback is revert scoped code/docs; no runtime rollback executed.


Publication handoff: local implementation commit 13571a9a3aabc74bc7c3ea8cb24d33313d64c281. Remote feat/cootton-product-search was created at the unchanged main baseline only. Git push failed because the Windows credential-manager helper could not start; connector create_tree was then rejected before execution because the complete action/minimum review context exceeded its reviewer input budget. No source tree/commit/PR was published and main is unchanged. This is an approval-review capacity failure, not a determination that the code is unsafe. A full local format-patch is provided for review; publication requires resolving that review/authentication path, without bypassing approval checks.


## SEARCH-PUBLISH-002 — renewed owner assignment · 2026-10-09

Owner explicitly requested ‘merge hoặc deploy Ứng dụng tìm kiếm/quảng cáo’. This authorizes review/publication and source merge; use merge for the current search plus CPM simulation slice. It does not turn experimental formulas into ACCEPTED business policy or close missing release gates. The preceding publication failure is a historical checkpoint. Prepared source is rebased onto main 696a462f0c23da87c30c66f24401a7d0265617a2, retaining RULE-GITHUB-001 and all historical decisions. Publication uses standard Git with the complete reviewed patch and unchanged whole-file content; approval remains mandatory. No fragmented connector retry of the rejected large action.

Source review checked bound parameters, public projections/DTOs, visibility revalidation, cursor scope, UI cancellation and authenticated simulation boundaries. Conflict resolution preserves both rule and search documentation. SSR verification now resolves Next from the web package so pnpm isolated dependency layout is supported; final PostgreSQL16, build, contracts, HTTP/SSR and container evidence must come from CI on the exact PR head. Browser accessibility/performance and production deployment remain OPEN. Merge is source adoption only; no live ads, billing, migrations or production traffic changes.
