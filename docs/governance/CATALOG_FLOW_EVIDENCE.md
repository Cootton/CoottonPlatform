# Luồng catalog thật — evidence và trạng thái hiện hành

> **SYNC-PR16-006 · 2026-10-07:** Source hiện hành là PR #16 `56f80580e50b43c94df65d3ae79ef025ea957123`; [bản đồng bộ migration006](MIGRATION006_SOURCE_SYNC.md) phân biệt source/CI đã kiểm chứng với deployment checkpoint lịch sử. Migration006 đã chuẩn bị, **chưa áp dụng production**. Các source18768a1/pending notices dưới đây là lịch sử; không chứng minh runtime đang chạy bản sửa.


`FLOW-CATALOG-001` · 2026-10-07 · Scoped catalog acceptance, không phải chứng nhận toàn bộ production gates.

## Nguồn và precedence

Main được xác minh ở `503ae0be7f2956af2b9c006c364e758e7ee58b03`. [PR #16](https://github.com/Cootton/CoottonPlatform/pull/16) có source `18768a1ded3be76d4df9a0960369170b50c72850`, CI foundation/container thành công; còn open tại thời điểm kiểm tra. Main, PR và runtime là ba evidence layers riêng.

Checkpoint local ngày 04/10 `CATALOG_PUBLICATION_CHECKPOINT.md` trong workspace triển khai báo owner-approved activation, migration005 và source trên. Checkpoint này chưa nằm trong PR head đã đọc. API revision được checkpoint ghi là `cootton-api-00005-ff6`, web `cootton-web-00006-7c9`; revision không được introspect lại trong lượt kiểm chứng browser này.

## Chuỗi trạng thái trên cùng sản phẩm

Product ID: `41ca16fe-c6a2-4f99-80bd-2ba9f80fba3a`. Áo thun cổ tròn Cootton Cotton 100% 250 GSM form Boxy. Không tạo bản sao hay đưa sản phẩm mẫu ra public.

| Bước | Evidence | Kết quả |
|---|---|---|
| Admin nhập dữ liệu | Checkpoint 04/10 và product specification | 16 SKU, 12 số đo, 5 ảnh gallery; dữ liệu do owner cung cấp |
| Review | Checkpoint 04/10 | submit v16 → approve v17; review snapshot và khai báo quyền media |
| Publish | Checkpoint 04/10 | publish v18, withdraw v19, review lại v20/v21, publish v22 |
| Buyer đọc | Browser trực tiếp 07/10 trước withdraw | Trang Boxy hiển thị 16 SKU, bảng size, 5 ảnh; giá tham khảo, chưa mua hàng |
| Withdraw | Browser Admin, phiên owner đăng nhập 07/10 | `Ẩn sản phẩm và trả về nháp`: APPROVED v22 → DRAFT v23; thông báo cập nhật thành công |
| Buyer sau withdraw | Browser reload 07/10 | Detail hiện COOTTON / 404; homepage không còn product card và hiện catalog rỗng |
| URL ảnh cũ | Browser mở một URL gallery đã lấy từ DOM trước withdraw | Bị từ chối với HTTP response failure; không khẳng định đã đọc được exact status code hoặc kiểm hết 5 URL |

Lý do withdraw đã lưu: yêu cầu chủ sở hữu kiểm chứng luồng ngày 07/10/2026. **Trạng thái cuối: DRAFT v23, không hiển thị public.** Muốn xuất bản lại phải đi qua review/publish hiện hành. Các ảnh đã được buyer tải trước đó không thể bị thu hồi khỏi thiết bị của họ.

Bằng chứng ảnh: [buyer404 sau withdraw07/10](../evidence/COOTTON_WITHDRAW_BUYER_2026_10_07.png), kèm trong bundle; không chứa credential. Audit/outbox/idempotency cho các lệnh 04/10 được checkpoint báo có; receipt của lệnh v23 chưa được query độc lập trong lượt này, không gắn nhãn VERIFIED.

## Đính chính review cũ và Production Gates

`RISK-001` expiry ≤60s là mechanism của migration001/main cũ. ADR0005/migration005 trong PR16 đã chuyển sang immutable review snapshot + canonical publication pointer và current product version; không cần renewal để duy trì catalog. Vì vậy không áp dụng blocker renewal cho runtime đã quan sát. Quyết định catalog-only là scoped override; commerce vẫn đòi đủ offering/payment/order gates trước bán.

PASS cho acceptance quan sát: authenticated withdrawal, version transition, public detail removal và catalog removal. Historical checkpoint hỗ trợ intake/review/publication/media và source-change rejection. Chưa đánh dấu toàn bộ AUTH/DATA/SEC/PERF/OPS gates PASS: restore drill, tải thực tế, session lifecycle, permission negatives và receipt v23 cần evidence task riêng. Payment, points, B2B commerce và public video không được kích hoạt từ flow này.

## Work đọc và tiếp tục

Đọc CURRENT_STATE → tài liệu này → PR16 ADR0005 và CATALOG_PUBLICATION contract → migration005 → publication service/UI → checkpoint. Trước thay source lấy lại current SHA/version/runtime state; không dùng main503ae0 để mô tả runtime mới. Integration cần đưa checkpoint về repo và đối chiếu deployment manifest trước merge; không merge hay redeploy chỉ vì browser acceptance thành công.