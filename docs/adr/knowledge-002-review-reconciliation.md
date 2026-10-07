# ADR-KNOWLEDGE-002 — Review và đồng bộ effective state

- Status: ACCEPTED cho việc review/document reconciliation theo yêu cầu owner07/10/2026.
- Stable ID: `ADR-KNOWLEDGE-002`; không đổi ADR Admin0004.
- Supersedes: cách đọc header/pending lịch sử như trạng thái hiện tại; không supersede accepted business/stack decisions.
- Sources: SRC-OWNER-REVIEW-20261007, SRC-REPO-503AE0, scoped D02–D10, V001106/117/127/128 và SRC-LOCAL-131.

## Problem và decision

Gói trước đã ghi conflicts nhưng reader vẫn phải tự reconcile headers/CORE/auth/evidence. Tạo GOV-STATE-001 làm effective interpretation chung, đặt V001 notice trước historical source và thêm section133. Index, governance, engineering, gates và integration đọc cùng layer này.

Giữ accepted stack/business decisions; resolve policy conflicts bằng scoped overrides có nguồn. SOURCE claim/status không tự owner approval. Unknown runtime/merge/provider readiness là evidence gaps, không conflict cần invent facts để đóng. V001128 conditional website deployment authorization giữ nguyên; task docs không thực thi cũng không revoke nó.

## Specific resolutions

NestJS vs Spring→NestJS runtime/reference Spring. Neon vs CloudSQL→Neon current/future migration. Redis primary claim→optional adoption, derived-only rules. Marketplace/points→future scope, inactive launch. No-tests→targeted scope. Blanket purge→selective reuse. Cookie vs bearer→reported Admin bearer path, cookie alternative cần separate reviewed change, no dual-mode inference. Financial pending→D02/D04/D05/D06 scoped resolutions; actual configs vẫn pending. Old planning/deploy header→historical source, current scope+evidence separately.

## Consequences và verification

Không đổi application code/schema/OpenAPI/grants. Contracts baseline giữ original bytes để audit; effective override table được linked explicit. Verification kiểm source preservation, new links, requirement coverage, resolved-register status, reference-model alignment và archive parity; không gọi runtime. Khi source update thật, revise state/evidence/ADR, không sửa history.