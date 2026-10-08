# Decision gaps và verification matrix

> **REVIEW-PR26-002 · 2026-10-08:** This revision reconciles PR26 release-preparation documents with main `9c084c12` and preserves the knowledge edition. References to an unmerged PR26 at `cad72a77` describe the initial knowledge-review snapshot, not a permanent current-state assertion. After this PR merges, read the current [release preparation](../operations/API04_RELEASE_PREPARATION_2026_10_08.md) and [cloud checkpoint](../operations/API04_CLOUD_READ_EVIDENCE_2026_10_08.md) on main. The owner authorized documentation review/merge; proposed work packages and runtime/release gaps remain unchanged. No script, application source, migration or runtime action is introduced by this merge.

`KN-GAPS-002` · v0.2.0 · Đọc [plan](DETAILED_PLAN.md) và [register](SOURCE_EVIDENCE_REGISTER.md). Đây là register review, không reviewer signoff hoặc full gate certification.

## Không mở lại những điều đã có authority

NestJS/TypeScript modular monolith/shared Next.js, PostgreSQL canonical/Neon hiện dùng, single-seller website-first, selective reuse, AI optional/isolation, V001 in-place, targeted testing và business design D01–D10 đã có quyết định/assignment trong repository. Dẫn nguồn gốc khi nói ACCEPTED; implementation/verification/authorization vẫn là các trục riêng. Không hỏi lại owner chọn Java hay NestJS hoặc thiết kế MOQ/return từ đầu.

## Các điểm còn cần quyết định hoặc bằng chứng

| ID | Gap / trạng thái | Ai giải quyết / evidence cần | Chặn việc gì |
|---|---|---|---|
| KN-G01 | General knowledge approval: explicit, PENDING_SCOPE_MAPPING | Owner map artifact/version/scope; không biến thành blanket runtime grant | Adoption của đề xuất mới, không chặn đọc/review |
| KN-G02 | Documentation reconciliation completed in this proposed merge revision; cad72a77 was unmerged at initial review | Owner explicitly authorized review/merge; current-state references follow merged release documents after publication. Runtime checks remain separate. | Documentation publication pending PR merge; không chặn bởi historical unmerged label |
| KN-G03 | Candidate artifacts/encoder compatibility OPEN | Immutable API/Web/base digests, encoder versions, repeatability/retry bytes và proxy compatibility | Release |
| KN-G04 | Intended identity actual GCS operations OPEN | Generation-pinned operations dưới runtime account; configured IAM và operator ADC không đủ | Runtime media readiness |
| KN-G05 | Actual SDK listener warnings OPEN | Repeated workload, safe warning stack/handles/RSS; no listener-limit suppression | Resource/operational readiness |
| KN-G06 | Browser recovery recorded; root cause/recurrence OPEN | Sanitized host/status on recurrence, sustained scoped observations; full live negative auth matrix riêng | Identity evidence breadth; không tự kết luận mọi login đang hỏng |
| KN-G07 | Rollback mapping/protection regression OPEN | Web latestRevision versus named pin, retained images, older API protections containment, reviewer signoff | Release |
| KN-G08 | Monitoring/thresholds/capacity/restore/signoff OPEN | Workload/limits/stop windows, restore rehearsal và named accountable reviewers | Applicable ops/release gates |
| KN-G09 | API04-RECOVERY-002 OPEN | Owner/ops/data retention/grace/intents/orphan policy và bounded design | Cleanup activation, applicable recovery gates |
| KN-G10 | Actual commerce/provider readiness BLOCKED | Reuse D04/D05; explicit provider/tender/finality/reconciliation activation, scoped implementation/grants | Checkout/payment activation |
| KN-G11 | AI processing/tools/egress activation BLOCKED | Use case, scoped approval, isolation/ACL/denial/evals/cost | AI feature activation |
| KN-G12 | New work assignment/capacity TBD | Assignee/reviewer/estimate/env/action scope per backlog item | Calendar commitment/runtime execution |

Không tự chọn retention period, payment provider, SLO, human identifier, fixture prefix hoặc reviewer. Tài liệu này không tự đổi gate status sang NOT_APPLICABLE cho commerce/AI đã disable; rationale/reviewer riêng vẫn cần theo governing gates.

## Evidence matrix hiện có

| Scenario | Nguồn | Mức evidence | Điều chưa được chứng minh |
|---|---|---|---|
| Stack/domain decisions | DECISIONS/V001/D01–D10/ADR | Repository-recorded authority | Không tự chứng minh implementation/runtime tất cả domains |
| API01–04 endpoint/authz/transaction source | API contracts, ADR0007–0009, PR19–25 | Recorded source/CI, scoped isolated DB tests | Không actual source rollout hoặc full business/security matrix |
| Uncertain COMMIT/replay/conflict/revocation | API04 isolated/preflight checkpoints | Real HTTP/disposable PostgreSQL; transport fixtures theo scenario | Không production fault injection/restore |
| Encoder + SQL/media recovery | Video/SQL checkpoint | Actual encoder/HTTP/isolated SQL; operator GCS follow-up | Không candidate cross-encoder determinism hay intended account effective rights |
| Six private GCS fixtures | Scoped isolated/GCS checkpoints | Recorded actual object operations dưới operator ADC | Không permission proof runtime identity; no new fixture authorization inferred |
| Human Firebase admission/session | Video/Firebase checkpoint | Actual source SDK verification + ACT006 readonly session | Full nonowner/revoked/expired/verifier-outage live matrix còn mở |
| Browser login recovery | PR26 WEB-AUTH-OBS-001 | One observed session/reload ghi trong overlay | Không established root cause hoặc sustained recovery |
| Cloud configuration/IAM | PR26 CLOUD-READ-003/EVD-REL04-CLOUD-001 | Recorded direct operator read; reported extra fields separated | Không actual service-identity GCS execution/artifact rollout |
| Local SDK100 reads / no warnings | PR26 release preparation | Local SDK/HTTP transport probe | Không real gaxios/ADC paths, memory boundedness hoặc actual warning eliminated |
| SQL001–006/ACT006 deployment | ACT006 checkpoint | Recorded applied/idempotent + named runtime revision | Không API02–04 runtime deployed; current review không re-read live |
| Catalog publication/withdraw | Catalog checkpoints/GATE_EVIDENCE | Historical scoped reported/observed journey, final DRAFT records | Không current product state rechecked hoặc permission to republish |
| Full Production Gates | GATE_EVIDENCE + scoped overlays | OPEN/NOT_EVALUATED/BLOCKED rollups, scenario additions | Không all PASS, approved general release/commerce/indexing |

Task này không chạy application tests hoặc runtime probes. Các PASS trên là **recorded evidence** của sources, không kết quả kiểm chứng mới do knowledge review. Source/CI changes, new image/identity/traffic/schema/cache/media/product publication hoặc policy thay đổi là recheck triggers.

## Tiêu chuẩn đóng một gap

Ghi exact source/digest/revision, environment, verified identity class không public private subject, timestamp, scenario/input limits, observed result, adverse-case results, artifacts/locator, known exclusions, reviewer/approval và recheck triggers. Đóng scenario không tự đóng parent gate. Root cause assertion cần evidence chứ không suy từ absence of error logs, CORS probe hoặc retry thành công.
