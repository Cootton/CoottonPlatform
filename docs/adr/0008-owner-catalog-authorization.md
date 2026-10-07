# ADR0008 — Explicit human-owner catalog authorization

2026-10-07 · API-03 · PROPOSED source change under owner assignment, pending review/merge; no deployment.

Current migration002 enforces one singleton principal and seller. The current implementation is an explicitly bootstrapped human-owner catalog slice, not staff/AI RBAC. Preserve this scope rather than invent a new grant schema or provision users from a security audit.

Use a central fixed allowlist for all8 private reads and13 command actions, backed by active singleton principal lookup and verified fresh human identity. Derive UI capability aliases from the same owner policy; token email/role/capability/host does not confer access. Reject custom and anonymous/missing provider and uid/sub mismatch. Reauthorize/readiness-check before receipt replay; publication-disabled actions return409 even for previous receipts. This intentionally tightens custom-token and disabled replay admission while retaining valid owner command201.

Preserve existing subject advisory transaction guard; maintenance revocation must participate in that protocol. Do not add SELECT FOR SHARE on principal: current runtime is SELECT-only there, and that would require privileges not authorized/provisioned by this source task. Disposable PostgreSQL verifies cooperating order and current principal privilege boundary. Privileged bypass, Firebase mid-request revocation and external media preparation remain explicit limits.

Tests cover real HTTP guard/service denial paths with only Firebase verification transport mocked, pure identity/operation policy, real receipt admission paths, singleton/resource SQL and actual command/revoker ordering in dedicated CI PostgreSQL. No live identity/credential/storage, actual accounts/grants, migrations or deployment. D08 delegated grants/MFA/recovery and full gates remain open. See [matrix](../contracts/API_AUTHORIZATION_MATRIX.md) and [evidence](../governance/API03_EVIDENCE.md).
