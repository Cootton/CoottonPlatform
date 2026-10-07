# API-02 evidence and remaining gates

`EVD-API02-001` · 2026-10-07 · prepared change; exact commit/CI recorded by PR.

Baseline main a2d893e3b9828cc42691ac1d9a4e299a7c41dec1; API-01 inventory PR20 head3c2158433c3dd30f5993f638482ac5bfa98834f1; RULE-API-001 PR19 head41011cb62257c677b70d7bbfef44f4f260630d68 remain unmerged dependencies. API-02 is stacked on PR20, without silently merging either.

Checks: http-contract.cjs uses real Nest/Express HTTP listener with isolated identity/service fixtures to exercise explicit201 (including same fixture response twice),401/409 safe envelope, malformed JSON400, oversize413, media type415 and400/404/503 media error headers. Its replay fixture proves transport serialization only, not persisted database deduplication. web-http.cjs executes actual handler code with controlled fetch/body streams, checking status propagation/body failure/media error headers. OpenAPI coverage assertion checks13 operations, response content/error references and13 actions. Both are included in pnpm verify:api in existing Foundation CI.

Local dependency installation hit Windows sandbox realpath/symlink errors; isolated npm dependency installation is being used for local checks. A failed setup is not a test failure or a PASS. Final results must be appended after execution; PR CI is independent.

No production credential, real Firebase sign-in, data mutation, migration or deployment. ACT006 remains runtime authority; API02 parser/proxy/source behavior is not claimed deployed. Contract records document remaining exact auth/resource matrix (API-03), durable receipt concurrency/transaction/media recovery (API-04), positive full-flow/HTTP boundary evidence (API-05). GATE-CONTRACT-001,SEC,DATA,RELEASE remain OPEN under complete criteria.
