# API-03 — Authorization evidence

`EVD-API03-001` · 2026-10-07 · prepared source only.

Baseline main a2d893e3b9828cc42691ac1d9a4e299a7c41dec1; stacked API-02 PR21 b2a72dd6f16660ce63f597ea7ddb7785c9c9cdc5 remains unmerged. ACT006 is runtime authority. RULE-API-001 documentation PR19 and inventory PR20 retain separate provenance.

| ID | Verification | Limit |
|---|---|---|
| AUTH03-IDENTITY-001 | Actual compiled guard with Firebase SDK transport double: revocation flag=true, invalid issuer/audience/sub/provider/age, expired/revoked/disabled/error responses | Does not cryptographically validate forged JWT or prove actual Firebase project/account configuration |
| AUTH03-POLICY-001 | Every8 private read and13 action: owner admission, unknown operation deny, unbound buyer/staff/AI even ADMIN claims deny, inactive principal deny, publication readiness | Single owner scope, not delegated grant engine |
| AUTH03-REPLAY-001 | Actual command service reauthorizes before receipt for13 actions, including media preflight; revoked owner does not read receipt | Receipt fixture is synthetic; full durable exactly-once/retention/concurrent replay remains API-04 |
| AUTH03-HTTP-001 | Real Nest HTTP + actual identity guard/service: all8 private GET +13 command variants deny missing/invalid/nonowner identity; allowed owner read status; outage503/public health200 | Only SDK and database transport fixtures; valid domain envelope used; no production credentials |
| AUTH03-DB-001 | Real001–006 SQL in disposable PostgreSQL: singleton owner/seller, SELECT-only admission role, A/B media associations, real authorized createDraft audit/outbox/receipt, revoked receipt/13 actions, cooperative revoke/write ordering | No Storage transport; maintenance writer must use existing subject guard; no production grants or runtime mutation |

Tests added to verify:api and sequential verify:api:db in existing Foundation CI. Sequential DB suite avoids two fixture setups colliding on intentionally identical canonical schema names. Local dependency setup remains blocked by prior Windows sandbox errors; Linux CI result must be appended after observed completion, never assumed PASS.

Full GATE-SEC-001/DATA/CONTRACT/RELEASE remain OPEN. Live SDK/account/grant checks, provider/MFA/recovery, denials audit policy and external media race need their scoped evidence. V001/applied migrations/accepted domain contracts remain untouched; index/ADR/changelog/traceability hold this additive record.
