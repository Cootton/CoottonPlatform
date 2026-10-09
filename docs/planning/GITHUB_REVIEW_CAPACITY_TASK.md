# TASK-GITHUB-001 — Giới hạn đọc và quy tắc chuyển giao

2026-10-09, Asia/Saigon. Source local: `13571a9a3aabc74bc7c3ea8cb24d33313d64c281`; upstream baseline `02bfad3020f0265219055dd9991108cfa87f625c`.

Authorization: owner yêu cầu “kiểm tra giới hạn đọc của github ... tạo rule cho Cootton ... tránh vấn đề này về sau”. Scope: xác minh nguồn chính thức, phân loại lỗi quan sát, viết RULE-GITHUB-001 và liên kết AGENTS/governance. Yêu cầu tiếp theo của owner: “publish hoặc merge lên GitHub”, cấp scope xuất bản/review/merge quy tắc qua PR riêng. Không viết tính năng ứng dụng, sửa credential, thử tải lớn, đổi approval settings hoặc deploy.

Implementation status: SOURCE_IMPLEMENTED, GITHUB_PUBLICATION_PENDING. Invariants: không nhầm giới hạn GitHub với reviewer/output budget; không tự suy ra số token; giữ V001, contracts, source hash, scope approval và paused API04. Gates: source documentation consistency; publication/release remain pending. Evidence: official GitHub/OpenAI pages và lỗi tool đã ghi ở EVD-SEARCH-001; không suy ra quota tài khoản hiện tại.

Recovery: revert scoped documentation changes only. Pending: Git authentication helper repair, supported approval path for existing large-file update, human/source review and GitHub publication (subsequent owner assignment authorizes the rule only).

Publication scope: main baseline02bfad3020f0265219055dd9991108cfa87f625c;7files only: AGENTS, CHANGELOG, COOTTON_MASTER_PLAN, DECISIONS, TRACEABILITY, rule and this task record. No application code, search policy, OpenAPI or V001 changes are included. Earlier local V001 summary remains local; main entrypoints AGENTS/master link the complete rule. The historical search application publish failure is not retried. Each whole document is reviewed in its own supported connector blob action, then assembled into one verified tree/commit; no opaque-content substitution or deletion, and no branch movement before all file writes succeed. User explicitly authorized this independent documentation publication after the earlier failure.

Historical source/checkpoint measurements remain unchanged. Rule metadata/commentary pre-merge states are a preparation record, not a claim of completed publication. Effective adoption is established by the actual merged PR/head and main verification; no CI PASS until observed on the exact head. Full runtime/release gates remain unchanged.
