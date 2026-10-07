# Testing, evidence và Production Gates

Applicability hiện hành: [GOV-STATE-001](../governance/CURRENT_STATE.md). Knowledge guidelines không tự cấp adoption/runtime authorization; historical status được giải thích tại đó.

`ENG-VERIFY-001` · DEC-VERIFY-001: §106 cho phép targeted verification trong assigned task; không giữ absolute no-tests lịch sử. Task này chỉ document validation, không runtime/load/restore/payment tests.

## Verification layers theo rủi ro

Static/build/types/format kiểm source và transport compatibility. Unit tests bảo vệ pure domain rules (money rounding/state transitions/allocations), không mirror implementation vô ích. Integration kiểm actual PostgreSQL constraints/transactions/auth/provider adapters trong authorized environment. Contract tests kiểm OpenAPI/DTO/event schemas/consumer compatibility. E2E cho selected user journey; security negative/concurrency/replay/failure injection cho critical invariants. Load/soak và restore/reconciliation khi release/operations scope được giao.

Không tạo runtime test cho reversible text edit chỉ để có “test count”. Docs validation kiểm relative links, IDs, coverage và unchanged baseline. Mock/synthetic fixtures phải labelled, không public product/payment evidence; unit/mock pass không proof actual gateway/permissions/restore. Existing tests/checks chạy theo change scope, không broader unrelated testing khi không justified.

## Gate record và trạng thái

Gate states: `NOT_EVALUATED`, `BLOCKED`, `PASS`, `FAIL`, `NOT_APPLICABLE` (lý do+reviewer). Feature state `DISABLED/READY/ENABLED` riêng. Accepted design ≠ PASS; PASS của gate không tự cấp execution authorization. Evidence tối thiểu: release/source SHA+artifact digest, environment, version/config scope (redacted), scenario/input provenance, timestamp, actual vs expected result, evidence location, reviewer và expiry/recheck trigger. Missing evidence→NOT_EVALUATED/BLOCKED, không optimistic PASS.

| Stable gate ID | Scope và exit criteria | Reviewer/evidence cần | Trạng thái trong bundle |
|---|---|---|---|
| GATE-CONTRACT-001 | Reviewed versioned APIs/schema/events/state/ownership và no unresolved required business contract | Domain reviewer/owner; diff, ADR, compatibility decisions | NOT_EVALUATED per implementation |
| GATE-DATA-001 | Constraints/atomicity/idempotency, stock/ledger invariants, concurrent/unknown-commit replay; least-privilege writer | Domain+data reviewer; exact schema/replay/concurrency results | NOT_EVALUATED |
| GATE-SEC-001 | Auth/revocation/resource permissions, input/upload/SSRF/secret/cache boundaries, threat mitigations | Security reviewer/owner; actual negative scenarios and grants | NOT_EVALUATED |
| GATE-ASYNC-001 | Durable accept/outbox, duplicate/reorder/crash/retry/DLQ recovery, bounded backlog/admission | Domain+operations; delivery/consumer recovery evidence | NOT_EVALUATED; N/A only if no async effect |
| GATE-PERF-001 | D09/D10 actual workload SLO/error/pool/concurrency/payload targets và degradation | Operations; reproducible workload and metrics | NOT_EVALUATED |
| GATE-PAY-001 | Merchant/provider confirmation/refund/unknown recovery/reconciliation/funding and D04–D08 readiness | Owner+finance/provider reviewer; trusted evidence, no fake transactions | BLOCKED for activation |
| GATE-AI-001 | Isolation/no-egress policy/tool allowlist/budgets/audit/prompt-injection boundaries; core AI-off works | Owner+security; scoped tool and denial evidence | BLOCKED for unapproved inference/tools |
| GATE-OPS-001 | Actual budget/quota/roles/TLS/monitoring/duty, independent backups+keys+measured restore+reconciliation | Owner+operations; D10 evidence | NOT_EVALUATED |
| GATE-RELEASE-001 | Explicit release assignment, immutable verified artifact, applicable gates PASS, compatible rollback/drain/observation | Authorized owner/reviewer; release manifest and decision | BLOCKED by missing readiness evidence; conditional owner128 assignment preserved |
| GATE-PUBLISH-001 | Catalog facts/media/source review theo ADR0005 catalog-only; effective offering thêm trước purchase; public eligibility/no-private fields/withdrawal correctness | D01/D09 reviewer; approved product revisions/projections | NOT_EVALUATED tổng; selected Boxy flow có evidence, final DRAFTv23 |

Catalog-only release có thể không cần payment/AI implementation; excluded gates được NOT_APPLICABLE khi feature disabled và reviewer chốt rationale; mọi applicable gate phải PASS, vẫn giữ security/data/operations/release/catalog gates. Indexing không bật checkout. Gate list bổ sung traceability, không thay đầy đủ D10 checklist hoặc contract acceptance scenarios.

## Critical scenarios cho task tương lai

- D03: same-key simultaneous checkout; stale quote; oversell attempt; lock/deadline/release replay; process crash sau commit trước response.
- D04–D06: duplicate/late/out-of-order webhook; amount/merchant mismatch; provider timeout nhưng success; cumulative partial refund caps; refund success không restock; chargeback/recovery.
- D08: cross-principal/cross-seller IDs, revoked sessions/grants queued action, host spoofing, AI self-escalation, policy version stale.
- D09: private DTO/cache leakage, withdrawal không resurfaced stale, empty catalog truthful, canonical metadata không fake commerce.
- D10: pool/backlog exhaustion, missing backup/key, restore corruption/logical mismatch, post-restore revoked identity/payment replay, incompatible app rollback, AI-off operation.

## Release protocol

PREPARED→VERIFIED→APPROVED→DEPLOYING→OBSERVING→COMPLETE; failures FAILED/ROLLBACK_REQUIRED. Protected branch/required checks artifact digest, reviewed deploy permissions/OIDC, environment concurrency1, migration single writer, scoped backup/recovery và rollback compatibility. Expand→migrate/backfill→contract cho schema; không destructive automatic down migration. App rollback không rewind money/provider history. Post-restore reconciliation và identity revocation trước reopening writes. D10 authoritative cho actual values/runbooks.

Definition of done của engineering task: implementation đúng assigned scope, meaningful relevant checks pass, changed contracts/ADR/changelog/traceability synchronized, pending risks/decisions rõ và reviewer acceptance. Definition of production ready thêm all applicable gate evidence; không “all green” từ docs CI.




## Current scoped gate evidence

Đọc [GOV-GATE-EVD-001](../governance/GATE_EVIDENCE.md): bản roll-up cho pinned PR16 + checkpoint04/10 + browser07/10. Selected catalog flow thành công không tự đổi gate tổng thành PASS. Offering prerequisite áp trước purchase theo ADR0005; catalog-only presentation dùng reviewed reference prices. Trạng thái reviewer acceptance, missing evidence và recheck triggers được ghi rõ tại đó.