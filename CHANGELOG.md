# Changelog

## 2026-10-07 — CHG-VERIFY-001

- Rechecked all Markdown target files and fragments, source-preservation and baseline contract hashes after PR16 synchronization.
- Added GOV-GATE-EVD-001 with FLOW-REQ-001…005 traceability and all10 gate roll-ups, reported/observed distinction, missing evidence, reviewer status and recheck triggers.
- Corrected publication gate offering scope via ADR0005; included buyer404 screenshot for portable evidence. No gate-wide PASS, runtime action or GitHub publication.

## 2026-10-07 — CHG-SYNC-001

- Synced V001 source from PR16 pinned18768a1 through141; preserved engineering appendices under stable IDs, no V002.
- Imported original ADR0004/0005 and publication contract; preserved their source text and historical pending status with explicit current evidence overlay.
- Included original deployment checkpoint04/10; current runtime DRAFTv23 evidence07/10 supersedes checkpoint visiblev22 as product state.
- Updated index, CURRENT_STATE, AGENTS, source/traceability registries and integration guidance. Closed documentation OPEN-001; commerce, broader security/operations/release evidence remain gated.
- No GitHub push/merge, runtime mutation or deployment in this synchronization task.

## 2026-10-07 — CHG-LINK-001

- Restored COOTTON_AI_WORKFLOW.md from the earlier task deliverable at its referenced root path; original body preserved, provenance/precedence notice added.
- Checked relative Markdown file links across the bundle; no missing targets remain. No accepted decisions or runtime state changed.

## 2026-10-07 — CHG-FLOW-001

- Added FLOW-CATALOG-001: historical owner checkpoint separated from browser-observed buyer read and withdrawal v22→v23; final DRAFT/private, buyer 404/catalog absent.
- Corrected baseline-only RISK-001 interpretation with PR16 ADR0005/migration005; no blanket production gate PASS.
- Renamed documentation appendices MP-ENG-001/MP-REVIEW-001 to avoid reserved V001132/133 already used by newer product work; historical source text preserved.
- Local deliverables updated; no GitHub merge or redeployment performed.

## 2026-10-07 — CHG-ENG-003 (system critique, same V001)

- Added RVW-SYSTEM-001/RISK-001…011: publication60s liveness, uncertain payment/holds, recovery, scaling budgets, inbox, lock contention, Admin boundaries, owner recovery, AI feasibility, document drift and V1 scope.
- Targeted read of baseline migration001 confirms expiry mechanism; no observed production failure claimed.
- Remedies PROPOSED, existing accepted rules/contracts unchanged; references/gate completion conditions included. No runtime actions or source changes.

## 2026-10-07 — CHG-ENG-001 (V001, additive documentation)

- Added MP-INDEX-001 và 11 modules: architecture, networking/API, data/cache, async, scaling, payment, security/AI Tool Gateway, testing/gates, LLD, algorithms, runtime/Git/cloud.
- Added GOV-DEC-001, ADR-KNOWLEDGE-001, traceability, source/conflict inventory và integration notes.
- Preserved V001 baseline text và D01–D10/CORE/ADR0001–0003; bổ sung V001 §132, không tạo V002.
- Before: kiến thức nằm trong chat, ACCEPTED claims và stack references dễ gây nhầm. After: có reading order, nguồn, effective applicability, gate/evidence contract.
- Decisions unchanged: NestJS/Next.js, PostgreSQL canonical/Neon actual, direct-sale website-first, points inactive, AI optional/isolation/no-egress, selective reuse, targeted verification.
- Local129–131 retained as reported checkpoints with source boundaries; not asserted merged/deployed.
- Authorization: SRC-OWNER-20261007 documentation task. Runtime/source/permissions/payments/deploy: no changes.
- Validation: see VALIDATION.md. Publication status: local GitHub-ready bundle only.

## 2026-10-07 — CHG-ENG-002 (review, same V001)

- Added GOV-STATE-001, ADR-KNOWLEDGE-002, RVW-ENG-001; resolved10 applicability conflicts.
- V001 front notice+133 giải thích stale headers/pending; baseline source và accepted contracts preserved.
- Financial resolutions theo D02/D04–D06; owner128 conditional deployment authorization giữ; reported bearer approach và cookie alternative distinguished.
- Clarified scoped authorized AI tool actions,401/conditional-read/cache semantics, applicable PASS vs reviewed N/A gates.
- Main/local/auth/production evidence gaps giữ trong OPEN ledger; no fabricated proof, runtime changes or GitHub publication.

## SYNC-PR16-006 · 2026-10-07

Sync stacked PR17 with PR16 56f80580e50b43c94df65d3ae79ef025ea957123 using a merge commit preserving both histories. Keep migration001–005 unchanged and006 prepared, all source/CI fixes and ADR0006. Append explicit evidence/traceability overlay and preserve V001/ACCEPTED decisions. No production migration, deployment, republish or merge performed.


## MERGE-PR16-001 · 2026-10-07

> **MERGE-PR16-001 · 2026-10-07:** PR #16 đã merge vào `main` tại `6205aa2ff1eee6c750fa277bb1faf5ae397c6ff6`; source fixes56f8058 được giữ nguyên. PR #17 đã chuyển base sang `main` và đang kiểm tra trước merge. Các ghi chú PR16 open/unmerged/stacked bên dưới là lịch sử. Migration006 vẫn chưa áp dụng production; merge không chứng minh runtime/deployment hoặc đóng Production Gates.

Review repeated at pinned56f8058; no new blocking finding; Foundation/Container/security checks success. PR17 source equivalence and documentation diff rechecked after retarget. No production migration or deployment from merging source.


## ACT006-RUNTIME-001 — 2026-10-07

Migration006 applied and verified idempotent; exact fixed API artifact deployed100%. Actual storage fresh-process probe, production rollback measurement/cache checks and HTTP hidden-path acceptance passed within documented scope. [Checkpoint](docs/operations/ACTIVATION006_CHECKPOINT_2026_10_07.md) supersedes historical006 pending/source-only notices explicitly. ACCEPTED decisions and original data remain unchanged; full Production Gates remain open.


## RULE-API-001 — Endpoint contract and data control · 2026-10-07

Owner ACCEPTED:

> Mỗi endpoint phải mô tả request/response, quyền truy cập, điều kiện dữ liệu, tác động nghiệp vụ, hành vi khi retry hoặc xung đột, và bằng chứng kiểm thử.

[Required endpoint fields and review record](docs/engineering/ENDPOINT_CONTRACT_RULE.md) · REQ-API-CONTRACT-001 · ADR-KNOWLEDGE-003. Applies to every endpoint; preserve existing accepted contracts. Compliance requires scoped implementation/test evidence; existing endpoints are not automatically certified and Production Gates remain unchanged.



## 2026-10-07 — CHG-API01-001

- Added API-01 HTTP inventory pinned to main `a2d893e3b9828cc42691ac1d9a4e299a7c41dec1`: 13 backend operations, 10 logical Web proxy operations, request/response/access/status/header/data semantics and 13 command payload variants.
- Verified 16 source-file Git blob hashes and 13 source/OpenAPI method/path pairs. Recorded API01-F001…006, including command POST source-default201 vs OpenAPI200, as follow-up gaps; no source/spec behavior silently changed.
- Linked reading order, networking and traceability. PR19 endpoint-rule documentation remains separate and unmerged. No runtime mutation, deployment or full Production Gate PASS.

