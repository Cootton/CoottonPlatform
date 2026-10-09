# RULE-GITHUB-001 — Đọc, review và xuất bản thay đổi có kiểm soát

Version1.0.0 · 2026-10-09 · Owner yêu cầu tạo quy tắc. Owner đã giao publish/merge vào GitHub. Quy tắc contributor có hiệu lực cùng AGENTS khi commit chứa quy tắc này được merge vào main. Các ngưỡng nội bộ dưới đây là mặc định thận trọng của Cootton, không phải giới hạn được GitHub/OpenAI công bố và không bảo đảm mọi request sẽ được duyệt.

## 1. Kết luận sự cố hiện tại

Lỗi quan sát: bộ phê duyệt báo toàn bộ action và minimum review context vượt reviewer input budget; action `github_create_tree` **chưa được thực thi**. Không có HTTP413/403/429 từ GitHub để kết luận file quá lớn hay hết quota. Số token/byte tối đa của bộ reviewer hiện tại chưa xác định; context window của model không phải ngân sách reviewer.

Đo local tại source `13571a9`, trước task quy tắc:33 files thay đổi; tổng nội dung file955.402 bytes; V001642.861 bytes; OpenAPI130.440 bytes; format-patch124.522 bytes. Đây là kích thước file/patch, không phải kích thước chính xác của tool arguments hay context reviewer. JSON escaping, metadata và review context làm payload thực tế khác đi. Đưa toàn bộ file lịch sử vào một write request làm tăng đáng kể lượng cần xem xét dù diff nhỏ.

Lỗi Git push là một sự cố khác: Windows credential-manager helper không khởi động. Việc GitHub connector đọc blob thành công không chứng minh Git CLI đã đăng nhập hoặc có thể push. Không tái dùng token bằng cách đọc secret store, dán credential vào URL, ghi token vào file hoặc log.

## 2. Phân biệt bốn lớp giới hạn

| Lớp | Giới hạn/bằng chứng | Cách xử lý |
|---|---|---|
| GitHub Contents GET | File≤1MB hỗ trợ đầy đủ;1–100MB dùng raw/object, object không trả content;>100MB endpoint không hỗ trợ. Directory tối đa1.000 entries | Chọn endpoint/media type phù hợp; đọc tree/subtree để inventory; không áp dụng các số này làm write/reviewer limit |
| GitHub recursive GET tree | Tối đa100.000 entries/7MB; `truncated:true` nghĩa là chưa đủ | Đọc subtree không recursive, kiểm tra độ bao phủ;7MB không phải trần POST create_tree |
| GitHub rate limit | Phụ thuộc loại auth; primary xem headers thực tế. Secondary thường≤80 content-generating requests/phút,≤500/giờ; endpoint có thể thấp hơn | Không thử sức giới hạn; đọc Retry-After/reset/remaining và backoff;403 không tự đồng nghĩa rate limit |
| Connector, tool output và reviewer | Connector có thể từ chối response lớn; shell/tool có thể truncate; reviewer có input budget riêng chưa công bố cho phiên này | Giảm dữ liệu không cần thiết, giữ đầy đủ hành động/ngữ cảnh cần review; không suy ra limit từ model window hoặc GitHub file size |

Nguồn chính thức được đọc09/10/2026: [GitHub Contents](https://docs.github.com/en/rest/repos/contents), [Git Trees](https://docs.github.com/en/rest/git/trees), [REST rate limits](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api). [OpenAI guardrails/approvals](https://developers.openai.com/api/docs/guides/agents/guardrails-approvals) mô tả kiểm tra action/scope và fail closed khi review không khả dụng; trang này không xác lập số token reviewer desktop hiện tại. Không đổi approval settings từ hướng dẫn API để né desktop Auto-review.

## 3. Quy trình đọc — metadata trước, nội dung theo nhu cầu

1. Xác định repo, ref/commit SHA và mục tiêu. Inventory path/size/blob SHA hoặc filename/diffstat trước; không fetch toàn bộ repository/context để tìm một vấn đề nhỏ.
2. Tìm heading/function/contract bằng chỉ mục hoặc tìm kiếm. Đọc phần liên quan cùng definitions/invariants/dependencies cần thiết, tối đa200 dòng hoặc16KiB văn bản mỗi lượt theo mặc định. Nếu function/contract dài hơn, chia các khoảng đọc có đánh dấu tiếp nối; hoàn tất phần cần review trước khi kết luận.
3. Các page/range/cursor phải cùng pinned SHA. Ghi nhận đoạn đã đọc và phần chưa đọc; `truncated`, cursor chưa hết hoặc warning cắt output nghĩa là **chưa đủ bằng chứng**. Không parse/commit JSON bị cắt, không gọi phần đọc được là full export/full review.
4. Batching chỉ cho các read độc lập. Không in raw blob/base64, toàn bộ OpenAPI/V001 hoặc full transcript vào output trung gian khi chỉ cần metadata/diff. Artifact đầy đủ giữ tại vị trí được phép; reviewer phải truy cập được nội dung cần đánh giá.
5. Khi account quota/header không được công cụ cung cấp, ghi UNKNOWN. Không gọi endpoint ngoài khả năng connector hoặc đo trần bằng cách spam/thử tải lớn.

## 4. Chuẩn bị thay đổi và review package

Trước write/push: chốt base SHA, target branch, exact file inventory, diffstat, patch size, largest changed file, nội dung action dự kiến, approvals/scope, checks và rủi ro. Phân biệt source/CI/runtime; giữ trạng thái ACCEPTED/PROPOSED theo nguồn owner.

Review package gồm manifest path/base blob/new blob hoặc content hash, diff đầy đủ, contract/dependencies liên quan, evidence/checks và action exact. SHA hay tóm tắt là index/integrity evidence, **không thay thế nội dung reviewer cần đọc**. Không giấu file, lượt ghi hoặc deployment effect khỏi review.

Mặc định nội bộ cho connector full-text write:≤32KiB UTF8 nội dung một file,≤64KiB **serialized action arguments**,≤10 changed entries/action. Đo sau JSON serialization; bytes không phải token. Vượt ngưỡng thì dừng tuyến full-text để chuẩn bị transport/review phù hợp, không cắt file, không tự nâng trần hoặc lặp retry. Minimum review context vẫn có thể vượt budget dù payload nhỏ.

Tách PR theo deliverable độc lập, dependency/base rõ ràng và build/contract checks tương ứng. Không tách một thay đổi security/transaction/contract thành các phần thiếu ngữ cảnh chỉ để đi qua reviewer. Bản cập nhật nhiều module hợp lệ có thể ở một PR; cap entries áp dụng action connector, không là giới hạn business scope hay số file/PR của GitHub.

## 5. Tuyến xuất bản ưu tiên

**Git chuẩn trên checkout đã xác thực** là tuyến ưu tiên cho source nhiều file/file lịch sử lớn: tạo commit local, review patch đầy đủ có ngữ cảnh, checks, rồi push đúng branch khi scope và approval path cho phép. Không gửi lại toàn bộ V001/OpenAPI qua tool full-text chỉ để thêm vài dòng. Git không thay yêu cầu phê duyệt; nếu action bị reviewer từ chối, đổi transport để né từ chối cũng bị cấm.

Nếu dùng connector ngay từ đầu và action được reviewer chấp thuận: chỉ truyền changed files, giữ `base_tree_sha`; dùng blob SHA đã tồn tại trên **đúng remote repository** cho entries không cần truyền lại. Local SHA chưa upload không chứng minh remote có blob. File tạo/chỉnh phải giữ đủ nội dung; blob SHA được dùng sau khi nội dung và tác động đã được review qua tuyến được hỗ trợ. Việc chia thao tác không cấp phép mới và không được dùng sau rejection nhằm né review.

Ghi tuần tự và kiểm tra từng kết quả. Với Git-data workflow, chỉ cập nhật branch ref sau khi tất cả blob/tree/commit thành công và tree khớp manifest; dùng expected head/lease, không force vô điều kiện. Contents update cùng branch/path cũng cần tuần tự/current blob SHA. Không bỏ base_tree khiến các file khác bị xóa khỏi tree mới. Không xuất bản trạng thái nửa chừng của contract phụ thuộc.

Sau push: xác minh remote head/tree với local, tạo/attach PR, ghi exact head SHA; kiểm tra CI trên SHA đó. PR/branch chỉ có baseline không là source đã publish. Merge/deploy có scope/gates riêng.

## 6. Khi gặp lỗi hoặc automatic review failure

- **Output truncated:** đọc lại phạm vi nhỏ phù hợp trước khi dùng dữ liệu; không coi tăng output budget là tăng reviewer budget.
- **Git auth/helper failure:** sửa môi trường đăng nhập bằng đường được hỗ trợ trong scope; không đánh đồng connector auth với CLI auth, không thay tokenhelper hay cấp quyền rộng tự động.
- **GitHub HTTP error:** ghi endpoint/status/body an toàn và header rate limit nếu có; phân loại auth/conflict/validation/size/rate đúng bằng chứng. Khi bị rate limit, tôn trọng Retry-After/reset; secondary không có header thì chờ ít nhất1 phút, backoff tăng dần và dừng sau3 retries (mặc định Cootton). Không retry mutation chưa xác định outcome trước khi reconcile remote state.
- **Reviewer input budget/unavailable:** ghi rõ action chưa chạy, lý do và phần chưa publish; không retry cùng request lớn, không mã hóa/nén/đổi công cụ/chia payload nhằm che nội dung hoặc vượt approval. Chỉ tiếp tục external write sau khi vấn đề review được giải quyết qua cơ chế được hỗ trợ hoặc có hướng dẫn phù hợp từ người dùng và action vẫn đi qua kiểm tra bắt buộc.
- Trong lúc blocked publication, hoàn tất local deliverable được phép: code/docs, manifest, checks và patch/bundle reviewable. Báo blocker riêng; không đánh dấu PUBLISHED/MERGED/ENABLED. Patch đã tạo không bảo đảm push sẽ được duyệt.

## 7. Giữ hệ thống tài liệu đọc được

V001 tiếp tục là phiên bản làm việc hiện hành; không tự tạo V002, xóa lịch sử hay tách file làm đổi authority. Mục mới ưu tiên summary ngắn/stable ID + link tới module/ADR/evidence tương ứng; nội dung dài nằm trong module chuyên đề. V001 hiện có giữ nguyên, cập nhật bằng diff trên Git; tái cấu trúc lớn cần scope/review riêng và giữ anchor/source/approval traceability. OpenAPI vẫn là spec đầy đủ; không rút field để giảm payload.

Quy tắc giảm khả năng lỗi, không hứa loại bỏ mọi giới hạn. Kiểm tra lại khi đổi connector/approval runtime hoặc GitHub policy. Owner-requested rule không cấp deploy/finance/grant hay đổi các accepted domain policies.

## 8. Cách giải quyết source đang chờ

Giữ branch local search và patch124.522 bytes làm evidence tại checkpoint nêu trên. Chuẩn bị môi trường Git được xác thực, gửi review package dùng diff và scopes đầy đủ, giải quyết automatic approval path trước push. Remote task branch hiện chỉ có main baseline; chưa có PR search. Không dùng các ngưỡng32/64KiB làm lý do tự động thử lại write đã bị chặn. Task quy tắc này không thử publish hoặc sửa credentials.
