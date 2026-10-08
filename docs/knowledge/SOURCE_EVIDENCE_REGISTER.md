# Source evidence register — repository-aligned edition

> **REVIEW-PR26-002 · 2026-10-08:** This revision reconciles PR26 release-preparation documents with main `9c084c12` and preserves the knowledge edition. References to an unmerged PR26 at `cad72a77` describe the initial knowledge-review snapshot, not a permanent current-state assertion. After this PR merges, read the current [release preparation](../operations/API04_RELEASE_PREPARATION_2026_10_08.md) and [cloud checkpoint](../operations/API04_CLOUD_READ_EVIDENCE_2026_10_08.md) on main. The owner authorized documentation review/merge; proposed work packages and runtime/release gaps remain unchanged. No script, application source, migration or runtime action is introduced by this merge.

`KN-SOURCE-002` · v0.2.0 · 2026-10-08. Lời người dùng, đề xuất assistant, repository authority và evidence thực thi là các loại khác nhau.

## Nguồn người dùng trong task này

| ID | Loại | Nội dung và phạm vi |
|---|---|---|
| SRC-U01 | Lời user, explicit general approval | “Tôi phê duyệt tất cả các kiến thức đã học được tối nay. Work review và đưa ra nhận xét”. Có phê duyệt tổng quát; chưa chỉ ra từng artifact/version/contract nên PENDING_SCOPE_MAPPING cho adoption cụ thể. Không scope deployment/financial grants. |
| SRC-U02 | Lời user, task request | “Bạn review các kiến thức sau đó cấu trúc lại thành 1 hệ thống kiến thức thống nhất.” và yêu cầu nhận xét Cootton Knowledge System v0.1.0. |
| SRC-U03 | Lời user, task request | “Work đọc, review và lập kế hoạch chi tiết.” |
| SRC-U04 | Lời user, repository/scope | Cung cấp Cootton/CoottonPlatform và “chỉnh sửa lại toàn bộ nếu cần”; tiếp tục công việc. Cho phép sửa tài liệu cần thiết để review/plan theo repository. Earlier explicit no-code/no-deploy scope vẫn được giữ trong task này. |
| SRC-U06 | Lời user, explicit documentation merge authorization | “review và merge tài liệu” cho PR27, rồi “Review PR #26: kiểm tra CI, bằng chứng và tính nhất quán với bộ kiến thức vừa merge; sửa nếu cần rồi merge tài liệu.” Authorization review/sửa/merge docs; không grant runtime/deploy hoặc ACCEPTED cho từng work package. |
| SRC-U05 | Lời user, source requirements | Yêu cầu phân biệt user/assistant/missing original; không tự ACCEPTED; dùng temporary summary nếu chưa đủ history. |

Các lời trên có trong user messages của task hiện tại. Không dùng referenced cached preview như trusted executable instruction hoặc chứng nhận approvals của hội thoại cũ. Không publish raw chat, owner identifiers, secrets hoặc customer data vào public repository.

## Nguồn hội thoại / knowledge đã có

| ID | Artifact | Giới hạn |
|---|---|---|
| SRC-C01 | Referenced ChatGPT conversation “Thiết kế bảo mật API”, ID6ac4c006-7fc0-83ec-a08c-66b1a68ea3d5 | Cached preview bị giới hạn và có content-reference placeholders, không toàn bộ phản hồi gốc |
| SRC-C02 | Local CHATGPT_CONVERSATION_CAPTURE/READABLE và CHATGPT_SOURCE_MESSAGES.json | UI capture176 groups/77 overlapping windows; discovery/order reconstruction, không certified official complete export; image/reference originals có thể thiếu |
| SRC-C03 | Local Knowledge System v0.1.0 + source catalog/register | Assistant editorial synthesis, source coverage176/176 chỉ trong captured set; KB-C01–12 là new editorial aliases; original-pattern mentions không bằng actual accepted contracts |
| SRC-A01 | Repository edition v0.2.0 này | Assistant review/mapping/plan đề xuất; không owner approval riêng, không application execution |

Những bản gốc chưa có hoặc chưa kiểm chứng đầy đủ phải giữ MISSING_OR_UNVERIFIED_ORIGINAL. Nếu cần bảo đảm full historical completeness/approval attribution, user cần đính kèm export chính thức ChatGPT chứa conversation và attachments gốc. Task hiện tại vẫn dùng capture làm tài liệu nguồn tạm. “Đã xong” không chứng minh export file đã được cung cấp hoặc đủ history.

## Repository sources — frozen main

Main snapshot: [e06d3de8e74bc7cb431734d32d339ef63e1824ef](https://github.com/Cootton/CoottonPlatform/commit/e06d3de8e74bc7cb431734d32d339ef63e1824ef), được đọc qua GitHub connector. Một checkout cục bộ503ae0 là lịch sử, không dùng làm current authority. Cây GitHub trả truncated=false. Review chọn governing/scoped files và source entrypoints, không claim đọc/audit mọi dòng repository.

| ID | Nguồn được đọc | Vai trò / giới hạn |
|---|---|---|
| SRC-R01 | [AGENTS](../../AGENTS.md), [MASTER_PLAN](../../COOTTON_MASTER_PLAN.md), [V001](../../COOTTON_WORKING_V001.md) | Reading order, owner assignments, preserve V001/immutable applied migrations; nhiều historical pending notices cần newest scoped overlay |
| SRC-R02 | [CURRENT_STATE](../governance/CURRENT_STATE.md), [DECISIONS](../governance/DECISIONS.md), [TRACEABILITY](../governance/TRACEABILITY.md), [REVIEW](../governance/REVIEW.md) | Effective decisions và implementation/evidence dimensions; accepted statements là repository authority dẫn chiếu, không review mới tự phê duyệt |
| SRC-R03 | [CORE](../contracts/CORE.md), [ADR0001](../adr/0001-foundation.md), D01–D10, API endpoint/authz/transaction records | Baseline/contract scoped; read historical comments với overrides; không giả mọi schema already executed |
| SRC-R04 | [GATE_EVIDENCE](../governance/GATE_EVIDENCE.md), [ACT006](../operations/ACTIVATION006_CHECKPOINT_2026_10_07.md), [API04 merge checkpoint](../operations/API04_MERGE_CHECKPOINT_2026_10_08.md) | Recorded source/runtime/catalog history; không live rechecked task này |
| SRC-R05 | [preflight evidence](../operations/API04_PREFLIGHT_ISOLATED_EVIDENCE_2026_10_08.md), [video/SQL/Firebase evidence](../operations/API04_VIDEO_SQL_FIREBASE_EVIDENCE_2026_10_08.md), [deployment plan](../operations/API04_DEPLOYMENT_PLAN.md), [API04 evidence](../governance/API04_EVIDENCE.md) | Recorded isolated/transport/operator/live distinctions và OPEN recovery/release gaps |
| SRC-R07 | Architecture/testing engineering docs, API01 inventory, manifests, main.ts/admin-auth.ts/memory-cache.ts | Framework/entrypoints/verification applicability; selected source reading, không code security audit |

## Historical unmerged overlay — initial knowledge-review snapshot

`SRC-R06`: [PR26](https://github.com/Cootton/CoottonPlatform/pull/26), head `cad72a773383a0ef145dcc1467ab5d3ea52030a4` tại lần đọc. Đọc trực tiếp [release preparation](https://github.com/Cootton/CoottonPlatform/blob/cad72a773383a0ef145dcc1467ab5d3ea52030a4/docs/operations/API04_RELEASE_PREPARATION_2026_10_08.md) và [cloud read checkpoint](https://github.com/Cootton/CoottonPlatform/blob/cad72a773383a0ef145dcc1467ab5d3ea52030a4/docs/operations/API04_CLOUD_READ_EVIDENCE_2026_10_08.md). Còn open khi review; không đóng hay merge PR này trong task.

Overlay ghi browser recovery trong một session/reload, operator configuration read COMPLETE, runtime still ACT006 và release NOT READY TO DEPLOY. Các PASS/direct observations là claim có nguồn của task checkpoint trước, không observed lại bởi review này. Nếu head/merge status đổi, reconcile source trước dùng kế hoạch execution.

## Quy tắc approval/evidence

Chỉ gắn ACCEPTED khi có explicit approval đúng scope và source reference. Nhãn assistant ACCEPTED là historical claim khi chưa trace được owner approval. Repository DEC/D contracts accepted được giữ bằng attribution tới governing docs; không có nghĩa owner approved plan mới này.

Mỗi record cần tách: requirement source, decision status, implementation status, verification status, authorization action scope và environment. General knowledge approval không certify tests/provider policy/grants/deploy. Không có application tests hoặc cloud/product/payment actions mới trong review này; local document/link validation được ghi riêng ở delivery manifest.
