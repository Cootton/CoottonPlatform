# Endpoint contract and data control

`RULE-API-001` · ACCEPTED · owner instruction2026-10-07 · applies to every endpoint.

> Mỗi endpoint phải mô tả request/response, quyền truy cập, điều kiện dữ liệu, tác động nghiệp vụ, hành vi khi retry hoặc xung đột, và bằng chứng kiểm thử.

## Required endpoint record

| Field | Required content |
|---|---|
| Request / response | Method and path; path/query/header/body schema, bounds and validation; success/error status and response schema; safe public/private fields |
| Access | Public or authenticated audience; identity verification and resource/capability authorization; denial behavior; no permissions inferred from possession of a token |
| Data preconditions | Authoritative source, allowed lifecycle, expected version, current active references and invariants; cache/projection freshness and withdrawal guards |
| Business effects | Reads or mutations, allowed transitions, atomic transaction boundary, side effects/audit/outbox when applicable; no external call inside a DB transaction without a reviewed reason |
| Retry / conflict | Method semantics, idempotency behavior and key scope/payload matching when needed, duplicate/concurrent requests, version conflict, timeout/unknown-outcome reconciliation and bounded retry rules |
| Verification evidence | Traceable requirement → implementation → meaningful test/scenario → exact source/results/environment/date/limits; source CI and runtime evidence remain distinct |

For read-only endpoints, state no mutation and document retry/cache behavior; do not mandate an idempotency key for GET. Inapplicable command/side-effect fields require an explicit rationale. An endpoint change must have these fields reviewed in its scoped contract before acceptance. Existing endpoints require a documented audit; this policy does not claim that audit has already passed.

## Reusable record

- Endpoint ID / method / path / owner module:
- Requirement and scoped contract / ADR links:
- Request and success/error response schemas / limits:
- Identity / capability / resource scope / denial:
- Canonical data source / lifecycle / version / active-reference predicates:
- Read or mutation / transaction / side effects / audit:
- Retry / idempotency / conflict / unknown outcome:
- Cache / projection / withdrawal behavior:
- Test/source/runtime evidence links / exact SHA / environment / date / limitations:
- Review status and applicable Production Gates:

## Cootton read example

`GET /v1/catalog/products/{id}`: validate ID and supported query parameters; return only buyer-safe contract fields. PostgreSQL public views must enforce publication visibility, source version and active references. Warm cache must revalidate visibility. Invalid input400, hidden/missing product404 and dependency failure503 are distinct; a successful response200 still requires all contract/data preconditions. GET has no publish/order/payment effect. Verify cold/warm reads and withdrawal/measurement revocation without exposing private review/source fields.

Implementation/evidence references: [ADR0006](../adr/0006-catalog-review-fixes.md), [activation006 checkpoint](../operations/ACTIVATION006_CHECKPOINT_2026_10_07.md), [networking module](02_NETWORKING_API.md). These are bounded existing evidence, not a complete endpoint audit.

## Adoption and gates

`REQ-API-CONTRACT-001` maps RULE-API-001 → [knowledge ADR003](../adr/knowledge-003-endpoint-contract-rule.md) → endpoint records/scoped contracts → implementation and test evidence. Supports GATE-CONTRACT-001/GATE-DATA-001/GATE-SEC-001/GATE-RELEASE-001 without automatically closing any gate. Accepted business contracts and runtime checkpoints retain their authority. This is a documentation policy; it neither creates routes nor changes runtime permissions/data or enables a feature.
