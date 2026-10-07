# ADR0007 — HTTP contract reconciliation

2026-10-07 · API-02 · Status: PROPOSED source change under owner assignment, pending PR review/merge; no deployment.

Context: API-01 at main a2d893e3b9828cc42691ac1d9a4e299a7c41dec1 found command success200 in OpenAPI but source default201, incomplete response/status schemas, parser/proxy error drift and unclear authorization/retry claims. Owner assigned completion and correction.

Decision: preserve command201 including receipt replay and make it explicit; reconcile OpenAPI and document all13 actions. Return safe400/413/415 parser/type errors with no-store/nosniff, preserve413/415 through Admin BFF, control body stream failure and add public proxy error headers. Document existing ignored-query behavior. Keep identity/principal checks unchanged; operation capability and external media transaction recovery require API-03/04 evidence. No new policy/grant/provider/schema/service.

Compatibility: no change to successful command status or body. Error code PAYLOAD_TOO_LARGE replaces local Web INVALID_INPUT at413; upstream413 no longer becomes503. Backend non-JSON415 is explicit. Existing UNAUTHENTICATED TypeScript alias retained, runtime AUTHENTICATION_REQUIRED added along with413/415 codes. Clients must branch on status/code and reuse exact command key/body for uncertain outcomes. Status meanings documented, no new version because changes reconcile established success behavior and controlled rejected input; review consumer error compatibility before deploy.

Validation: real local Nest HTTP with isolated service/identity fixtures and Web handler mocks; no runtime credentials/storage/DB. Existing tests remain in CI; gates not closed by mocks. See [contracts](../contracts/API_ENDPOINT_CONTRACTS.md) and [evidence](../governance/API02_EVIDENCE.md).
