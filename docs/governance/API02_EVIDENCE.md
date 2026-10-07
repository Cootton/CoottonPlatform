# API-02 evidence and remaining gates

`EVD-API02-001` · 2026-10-07 · prepared change; exact commit/CI recorded by PR.

Baseline main a2d893e3b9828cc42691ac1d9a4e299a7c41dec1; API-01 inventory PR20 head3c2158433c3dd30f5993f638482ac5bfa98834f1; RULE-API-001 PR19 head41011cb62257c677b70d7bbfef44f4f260630d68 remain unmerged dependencies. API-02 is stacked on PR20, without silently merging either.

Checks: http-contract.cjs uses real Nest/Express HTTP listener with isolated identity/service fixtures to exercise explicit201 (including same fixture response twice),401/409 safe envelope, malformed JSON400, oversize413, media type415 and400/404/503 media error headers. Its replay fixture proves transport serialization only, not persisted database deduplication. web-http.cjs executes actual handler code with controlled fetch/body streams, checking status propagation/body failure/media error headers. OpenAPI coverage assertion checks13 operations, response content/error references and13 actions. Both are included in pnpm verify:api in existing Foundation CI.

Local dependency installation (pnpm and isolated npm) was blocked by Windows sandbox filesystem/realpath/symlink errors; no local execution PASS claimed. Linux CI independently built and executed the patch successfully.

No production credential, real Firebase sign-in, data mutation, migration or deployment. ACT006 remains runtime authority; API02 parser/proxy/source behavior is not claimed deployed. Contract records document remaining exact auth/resource matrix (API-03), durable receipt concurrency/transaction/media recovery (API-04), positive full-flow/HTTP boundary evidence (API-05). GATE-CONTRACT-001,SEC,DATA,RELEASE remain OPEN under complete criteria.

## Verified source/CI result — 2026-10-07

Source commit `fe4fdd0da073cb7188b5538844fdc4daf548b6f7` on PR21. [Foundation run37651726765](https://github.com/Cootton/CoottonPlatform/actions/runs/37651726765) SUCCESS: build/check, contracts12PASS, API14PASS/1SKIP/0FAIL (all3 new transport/schema/Web tests passed), disposable PostgreSQL regression1PASS. The skipped existing test is not converted to PASS. [Container run37651726789](https://github.com/Cootton/CoottonPlatform/actions/runs/37651726789) SUCCESS for API and Web builds without credentials/deployment.

All87 relative links in the changed Markdown resolve against source tree plus proposed additions. Existing V001 remains byte-for-byte untouched in this PR; index/contracts/ADR/changelog/traceability carry the additive update. CI proves bounded prepared source checks, not production Firebase/DB command replay/full gates. Recheck after source/dependency/base changes; documentation-only follow-up records this result without changing tested source.
