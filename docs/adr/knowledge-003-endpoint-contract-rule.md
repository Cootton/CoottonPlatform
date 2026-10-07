# knowledge-003 — Endpoint contract and data control

`ADR-KNOWLEDGE-003` · ACCEPTED · 2026-10-07.

Owner explicitly instructed the following rule be recorded in Cootton Plan:

> Mỗi endpoint phải mô tả request/response, quyền truy cập, điều kiện dữ liệu, tác động nghiệp vụ, hành vi khi retry hoặc xung đột, và bằng chứng kiểm thử.

Decision: adopt RULE-API-001 for every endpoint, including buyer reads and private commands. [Required fields and reusable record](../engineering/ENDPOINT_CONTRACT_RULE.md) make HTTP behavior, authorization, canonical invariants, mutations, retries/conflicts and verification evidence reviewable together.

Preserve all prior ACCEPTED decisions; this additive documentation rule refines endpoint review criteria. Existing endpoint compliance is not asserted: audit and remediation remain scoped work with actual evidence. Read-only endpoints document no mutation/retry/cache semantics; inapplicable fields require rationale. No new architecture, provider, schema, grant, deployment or full Production Gate PASS follows from this decision.

Traceability: REQ-API-CONTRACT-001 → RULE-API-001 → endpoint contract/source/tests/runtime evidence → applicable gates. Future amendments require an explicit owner decision and ADR/changelog, never a silent replacement.
