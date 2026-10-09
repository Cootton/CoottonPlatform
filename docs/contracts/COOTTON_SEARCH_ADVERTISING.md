# SEARCH-ADS-001 — Tìm kiếm và quảng cáo riêng cho Cootton

2026-10-09. Mã nền: `02bfad3020f0265219055dd9991108cfa87f625c`. [Task](../planning/COOTTON_SEARCH_TASK.md), [OpenAPI](openapi.json), [ADR0010](../adr/0010-native-search-advertising.md).

## Nguồn phê duyệt và giới hạn

| Nguồn người dùng | Điều đã chốt | Phạm vi |
|---|---|---|
| “viết ứng dụng cho riêng cootton” | Viết ứng dụng trên stack Cootton hiện tại | Source implementation, không tự triển khai |
| “chốt tông tím -trắng” | Tông màu | Không xác lập từng mã màu/kiểm chứng accessibility |
| Trả lời câu hỏi về điểm | Độ khớp từ khóa, đánh giá đã xác minh, độ tin cậy người bán | Ba tiêu chí; chưa chốt định nghĩa/trọng số |
| Trả lời câu hỏi về quảng cáo | CPM: 1.000 lượt hiển thị hợp lệ | Không phê duyệt thu phí, tài khoản tiền hay ledger |
| Trả lời câu hỏi về seller | Cootton trước; chuẩn bị nhiều seller sau | Giữ singleton owner/seller; không cấp quyền mới |
| Trả lời câu hỏi công thức | “Giữ đề xuất để thử nghiệm” | 60/25/15, CPM × chất lượng, giá thứ nhất vẫn PROPOSED |

Nội dung WooCommerce do người dùng cung cấp là nguồn ý tưởng. Claims AI tự lưu dữ liệu, Redis/Memcached, analytics, indexer không được coi là tính năng đã có hoặc bằng chứng phê duyệt hạ tầng. Không thay các quyết định ACCEPTED lịch sử.

## HTTP-API-014 — GET /v1/catalog/search

Public, chỉ đọc từ `catalog_read.visible_product/visible_sku` bằng restricted reader hiện tại. Không SELECT canonical/private tables, thay grants, ghi dữ liệu hay tăng version.

Request: `mode` B2C(default)/B2B; `q` tối đa160 ký tự UTF16 và8 từ; `category` enum D01; `brand`≤160; `form/color/size`≤80; `limit`1–50(default20); `cursor` base64url≤1024. Chuỗi điều khiển, keys lạ, query trùng/mảng hoặc cursor không khớp bộ lọc trả400. Các tham số chỉ nhận chuỗi HTTP.

Chuẩn hóa NFD, bỏ dấu kết hợp, đ→d, lowercase, gom khoảng trắng. PostgreSQL phải UTF8; [normalize trong PostgreSQL16](https://www.postgresql.org/docs/16/functions-string.html). Từ khóa tìm theo từng token AND trên facts public và mã/màu/size SKU; ký tự `%`, `_`, dấu nháy chỉ là văn bản. Toàn bộ giá trị caller được bind. Bộ lọc brand/form/color/size so khớp nhãn public đã chuẩn hóa; không tự dịch dictionary code sang nhãn. Color và size nằm trong cùng một EXISTS SKU.

Xếp hạng đang hoạt động trong source là độ khớp: mã SKU chính xác60, title chính xác50, title bắt đầu bằng cụm30, title chứa cụm20, brand chính xác10, còn lại0; từ khóa trống xếp mới nhất. Đây là điểm kỹ thuật cho relevance, **không phải điểm chất lượng ba tiêu chí**. Tie-break timestamp và UUID giảm dần. Cursor gắn fingerprint tất cả filters/mode/limit và tuple rank/timestamp/UUID; không là token quyền truy cập. Không đảm bảo snapshot nhất quán qua nhiều trang nếu catalog đổi; refresh để lấy trạng thái mới.

Response200: `{items,nextCursor,mode,commerceEnabled:false}` theo DTO allowlist, tối đa limit items. Không lộ rank, bằng chứng riêng, identity, rating chưa xác minh, inventory, giá mua hoặc quảng cáo. Lỗi400 INVALID_INPUT,503 UNAVAILABLE/default safe errors; Cache-Control:no-store, nosniff. Visibility ID/version kiểm lại trước trả kết quả. Không cache search. Retry an toàn nhưng kết quả có thể thay đổi khi publication thay đổi; không409/idempotency receipt. List/detail cũ giữ contract riêng; cursor search và list không dùng thay thế nhau.

Web BFF `/api/catalog/search`: same-origin, không chuyển token hoặc DB credential; backend origin cấu hình server-only. Lỗi400/503 dạng code an toàn. SSR form GET trên `/` và `/b2b` vẫn dùng được khi JS chưa tải; live update300ms, hủy request cũ, kiểm tra generation, hỗ trợ IME. Không index filter/search, robots noindex hiện hành giữ nguyên. Labels/status/reduced motion và responsive CSS đã viết; chưa chứng nhận kiểm thử bằng trình duyệt/screen reader.

## Điểm tự nhiên — công thức thử nghiệm

`score = floor((relevance×6000 + verifiedReviews×2500 + sellerTrust×1500)/10000)` trên thang0–10000. Hàm nhận trọng số cấu hình có tổng10000, relevance>0; không hardcode trọng số làm policy runtime. Thiếu review/trust đã xác minh trảnull; không tự điền0 hoặc tự coi dữ liệu nhập là verified. Không ghép mức giá quảng cáo vào thứ hạng tự nhiên.

Hiện chưa có nguồn review đã xác minh, số lượng mẫu tối thiểu, cách đổi1–5 sao sang điểm, định nghĩa seller trust hoặc pipeline chống thao túng. Vì vậy API public chưa sử dụng điểm ba tiêu chí. Bảng quản trị chỉ nhận **điểm giả định để mô phỏng**, không ghi chúng vào catalog.

## Bảng đấu thầu CPM — chỉ mô phỏng

Sau đăng nhập/kiểm tra owner như Admin hiện tại, hiển thị bảng tại `/admin`. Chọn sản phẩm thật trên trang list đang mở (không giả vờ tìm toàn catalog). Đọc lại detail có auth khi thêm mức giá; lifecycle APPROVED, publication.enabled/published và ID/version khớp kết quả public detail là điều kiện ban đầu. Web BFF GET /api/catalog/products/{id}/visibility chỉ trả id/version/commerceEnabled=false từ public detail hiện hành; keys/query lạ400, invisible404, lỗi503; no-store/nosniff. Đây là kiểm tra tại thời điểm tính thử, không bảo đảm publication trong tương lai. Không endpoint bidding, lưu campaign, billing hoặc cấp seller account.

Đề xuất vị trí1–4; relevance floor30%, quality floor0%, reserve CPM0VND; các giá trị đều chỉnh được và chưa phê duyệt vận hành. CPM nguyên VND≤15 chữ số, dùng BigInt để so sánh chính xác. Điểm đấu thầu=CPM×quality; loại chưa publish, thiếu quality, dưới relevance/quality/reserve hoặc CPM0. Một mức giá/sản phẩm trong lượt tính; hòa điểm chọn quality rồi bid ID tăng dần. Người thắng trả CPM đã đặt theo **đề xuất giá thứ nhất**. Bảng chỉ ghi “được chọn trong mô phỏng”; dữ liệu trong memory phiên, không tự lưu hoặc phát quảng cáo.

Trước bật quảng cáo thật cần contract riêng: campaign/placement/keyword scope; moderation; thời gian hiệu lực; ngân sách/pacing; reservation và debit atomic; định nghĩa valid impression/viewability, dedup/bot/self-traffic; mẫu số và phần lẻ CPM bằng số chính xác; disclosure “Quảng cáo”; reporting/reconciliation/refund; authorization/multi-seller isolation; ranking/version freeze, audit/replay và load test. Không thêm schema/ledger giả để vượt các dependencies này.

## Evidence và readiness

Xem [evidence](../governance/COOTTON_SEARCH_EVIDENCE.md). Source/build/fixture tests không là production proof. API04 vẫn paused và NOT READY TO DEPLOY; source này không mở commerce/indexing/AI/ads billing. Source rollback: revert scoped files; actual rollout/rollback chưa được giao.
