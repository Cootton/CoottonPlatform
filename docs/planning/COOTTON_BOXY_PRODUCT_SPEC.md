# Cootton — Hồ sơ sản phẩm thực và thiết kế media

Ngày: 2026-10-04. Trạng thái: thiết kế dữ liệu, chưa nhập database hoặc xuất bản. Không phải phiên bản working mới; bổ sung V001.

## Thông tin do chủ sở hữu cung cấp

Tên: Áo thun cổ tròn Cootton Cotton 100% 250 GSM form Boxy.
Danh mục: Áo thun cổ tròn. Thương hiệu: Cootton. Form: Boxy.
Chất liệu: 100% Cotton. Định lượng: 250 GSM. Xuất xứ: Việt Nam.
Màu: Trắng, Đen, Đỏ, Vàng. Size: S, M, L, XL. Tổng: 16 SKU.
Mô tả: Áo thun cổ tròn Cootton, form Boxy, chất liệu 100% Cotton định lượng 250 GSM, sản xuất tại Việt Nam. Có bốn màu Trắng, Đen, Đỏ, Vàng và các size S, M, L, XL.
Không thêm tuyên bố chống co, chống phai, organic hoặc chứng nhận chưa được cung cấp.

## Giá đề xuất — chưa phải giá sản xuất thực tế

Mỗi tổ hợp màu-size có bản ghi giá riêng. Ban đầu đề xuất cùng giá theo size giữa các màu. Chi phí dưới đây là chi phí mục tiêu suy ra từ giá bán, không phải COGS đã xác minh.

| Màu | Size | Giá sản xuất mục tiêu VND | Bán lẻ VND | Bán sỉ VND |
|---|---|---:|---:|---:|
| Trắng | S | 59000 | 177000 | 88500 |
| Trắng | M | 61000 | 183000 | 91500 |
| Trắng | L | 64000 | 192000 | 96000 |
| Trắng | XL | 66000 | 198000 | 99000 |
| Đen | S | 59000 | 177000 | 88500 |
| Đen | M | 61000 | 183000 | 91500 |
| Đen | L | 64000 | 192000 | 96000 |
| Đen | XL | 66000 | 198000 | 99000 |
| Đỏ | S | 59000 | 177000 | 88500 |
| Đỏ | M | 61000 | 183000 | 91500 |
| Đỏ | L | 64000 | 192000 | 96000 |
| Đỏ | XL | 66000 | 198000 | 99000 |
| Vàng | S | 59000 | 177000 | 88500 |
| Vàng | M | 61000 | 183000 | 91500 |
| Vàng | L | 64000 | 192000 | 96000 |
| Vàng | XL | 66000 | 198000 | 99000 |

Bán lẻ = giá sản xuất x3. Bán sỉ = giá sản xuất x1,5. Chọn 198000 thay vì 199000 để giữ phép nhân chính xác với chi phí nguyên VND và vẫn nằm trong khoảng được giao. Không tự chuyển thành giá đã duyệt. Khi có giá sản xuất thực tế, tính lại; nếu vượt khoảng 177000–199000, đánh dấu xung đột và yêu cầu quyết định, không âm thầm sửa hệ số. Freeship, đóng gói, đổi trả, khuyến mãi và phí thanh toán là chi phí riêng phải tính trước khi bật bán; không gọi chênh lệch giá là lợi nhuận ròng.

B2B tiếp tục dùng MOQ tổng phần đơn seller 10 chiếc và ngưỡng 1000000 VND sau ưu đãi theo chính sách hiện có. Không đổi MOQ thành mỗi SKU. SKU do backend tạo; không dùng mã trình bày trong hồ sơ này thay cho canonical ID.

## Size và tồn kho

Bảng size đã được chủ sở hữu cung cấp ngày2026-10-04; xem bảng cập nhật bên dưới. Tồn kho khởi tạo do chủ sở hữu chỉ định là100 chiếc/SKU cho16 SKU, tổng1600 chiếc. Chưa áp dụng database; không mặc định100 cho mọi sản phẩm khác hoặc các lần lưu lại.

## Ràng buộc ảnh và liên kết biến thể

Diễn giải áp dụng: tối đa 9 ảnh gốc gallery và thêm tối đa 1 video trên mỗi sản phẩm. Video tùy chọn. Mỗi SKU bắt buộc liên kết một ảnh đúng màu trước khi đủ điều kiện xuất bản. Bốn SKU cùng màu dùng chung một asset ảnh màu và thumbnail phát sinh từ asset đó, không tải lên 16 bản trùng. Bốn ảnh màu nằm trong giới hạn 9 ảnh, thumbnail/poster là rendition không tính thành ảnh gallery mới.

Đề xuất gallery: 4 ảnh toàn áo theo màu; 1 ảnh mặt sau; 2 ảnh cận chất liệu/cổ/đường may; 1 ảnh form; 1 ảnh bổ sung thực tế. Không cần đủ 9 ảnh nếu chưa có.

Ảnh người dùng đã cung cấp: docotruoc.JPG là cận cổ màu đỏ; aothunboxytrang.JPG là cận cổ màu trắng. Dùng làm ảnh chi tiết, không giả nhận là ảnh toàn áo. Đã bổ sung dencotruoc.JPG màu Đen và vangcotruoc.JPG màu Vàng. Đủ ảnh cận cổ bốn màu; chưa có ảnh toàn áo. Không tạo ảnh đổi màu để thay bằng chứng hàng thật. Quyền sử dụng cần được khai báo khi nhập.

Backend phải kiểm tra giới hạn trong transaction dưới khóa sản phẩm cho mọi kênh nhập; kiểm tra UI không đủ. Kiểm soát tải đồng thời, idempotency và số slot đang xử lý. Thay ảnh không làm tổng vượt 9; ảnh chưa xử lý/chưa duyệt không được public. Liên kết SKU-color-image là contract bổ sung cần đồng bộ V001/OpenAPI trước migration; chưa triển khai trong nhiệm vụ thiết kế này.

## Video tối ưu on-page

Nguồn: MVI_0334.MOV do chủ sở hữu cung cấp. Chưa đọc file nên chưa xác nhận nội dung, thời lượng, codec hoặc dung lượng; chưa chuyển mã.

Không phục vụ MOV gốc trên trang sản phẩm. Quy trình: tải trực tiếp vào kho riêng tư theo phiên upload có giới hạn và thời hạn; xác minh file/codec/thời lượng; job nền có tài nguyên giới hạn tạo MP4 H.264 yuv420p, faststart, giữ tỉ lệ và không phóng lớn, tối đa 720p/30fps; bỏ âm thanh nếu không cần và được duyệt. V1 ưu tiên một MP4 phổ biến, chưa cần HLS đa rendition.

Mục tiêu thiết kế clip 15–30 giây, tối đa 60 giây; bản phục vụ mục tiêu <=8 MiB. Không tự cắt nội dung dài hơn, báo cần chọn đoạn. Tạo poster WebP nhẹ; nguồn và output không đạt chuẩn ở trạng thái BLOCKED, không đánh dấu READY. Giới hạn đầu vào đề xuất 250 MiB, cần khóa theo upload contract và chi phí trước triển khai.

Trang tải ảnh chính trước; video không autoplay, preload=none, chỉ gắn nguồn/tải khi bấm phát. Không tải byte video khi người dùng chỉ xem trang. Giữ kích thước khung để tránh layout shift; playback có controls và playsinline. Tệp đã duyệt phục vụ qua delivery/CDN hỗ trợ range requests, cache theo hash. Không chuyển media nhị phân lớn qua Next BFF/Nest hoặc lưu trong PostgreSQL. Không công khai bucket chứa bản gốc/chưa duyệt.

Nguồn kỹ thuật: https://web.dev/learn/performance/video-performance và https://web.dev/articles/lazy-loading-video . Các dung lượng/thời lượng trên là ngân sách thiết kế Cootton, không phải giới hạn bắt buộc của nguồn tham khảo.

## SEO đề xuất

Slug: ao-thun-co-tron-cotton-100-250gsm-boxy-cootton.
Title: Áo thun Boxy Cootton 100% Cotton 250 GSM.
Meta description: Áo thun cổ tròn Cootton form Boxy, 100% Cotton 250 GSM, sản xuất tại Việt Nam. Có 4 màu Trắng, Đen, Đỏ, Vàng và size S–XL.
Giữ một canonical URL sản phẩm; lựa chọn màu/size không sinh trang index trùng. Chỉ đưa giá, availability, ảnh và video vào structured data khi thật sự duyệt và công khai; chưa có tồn không khai InStock.

## Điều kiện hoàn tất

Xác nhận giá từng SKU/chi phí thực tế; cung cấp số đo, tồn kho/kho, ảnh toàn áo và quyền sử dụng, kiểm tra video. Sau đó thực thi media limit/SKU thumbnail/video contract, kiểm chứng quyền và xử lý lỗi, nhập qua Admin, duyệt rồi xuất bản riêng. Hiện Admin đã triển khai chỉ hỗ trợ ảnh; chưa có pipeline video hoặc xác nhận giới hạn 9 ảnh đã được thực thi.


## Bổ sung hồ sơ — quyết định chủ sở hữu 2026-10-04

Giá sỉ x1,5 thay thế hoàn toàn hệ số x2 trước đây cho sản phẩm này. Chi phí mục tiêu chưa phải chi phí thực tế; giá lẻ giữ nguyên. Giá sỉ 88500/91500/96000/99000 VND theo S/M/L/XL, áp dụng bản ghi riêng cho đủ16 SKU. Không cộng thêm bậc giảm giá chưa quyết định. Theo mức giá này,10 chiếc vẫn dưới ngưỡng1000000 VND; cả điều kiện tổng số chiếc và tổng tiền sau ưu đãi phải đồng thời đạt. Không tự bỏ ngưỡng tiền để cho đơn10 chiếc được mua sỉ.

### Media theo màu

| Màu | Asset nguồn đã cung cấp | Alt text | SKU sử dụng |
|---|---|---|---|
| Trắng | aothunboxytrang.JPG | Cận cổ áo thun Boxy Cootton màu trắng | Trắng S/M/L/XL |
| Đen | dencotruoc.JPG | Cận cổ áo thun Boxy Cootton màu đen | Đen S/M/L/XL |
| Đỏ | docotruoc.JPG | Cận cổ áo thun Boxy Cootton màu đỏ | Đỏ S/M/L/XL |
| Vàng | vangcotruoc.JPG | Cận cổ áo thun Boxy Cootton màu vàng | Vàng S/M/L/XL |

Bốn asset là ảnh chi tiết thực tế chủ sở hữu gửi. Giai đoạn nhập nháp dùng thumbnail từ ảnh cận cổ đúng màu; cần ảnh toàn áo để khách đánh giá form trước khi xuất bản. Màu Vàng giữ tên do chủ sở hữu cung cấp, không suy diễn thành mã Pantone từ ảnh. Thumbnail đề xuất240px WebP, mục tiêu<=30KiB; ảnh detail responsive480/960/1600px, không phóng lớn, giữ màu/tỉ lệ và không sửa hình sản phẩm. Đây là rendition kế hoạch, chưa xử lý file gốc. SKU dùng chung asset cùng màu nhưng liên kết riêng; không nhân bản tệp theo size.

### Nội dung bổ sung có thể dùng ngay

Tên hiển thị: Áo thun Boxy Cootton Cotton 100% 250 GSM.
Mô tả ngắn: Áo thun cổ tròn Cootton form Boxy, chất liệu100% Cotton định lượng250 GSM, sản xuất tại Việt Nam. Lựa chọn bốn màu Trắng, Đen, Đỏ, Vàng và size S, M, L, XL.
Chọn size: Vui lòng đối chiếu số đo áo thực tế khi bảng size được cập nhật. Nhãn S/M/L/XL chưa đủ để suy ra số đo hoặc cân nặng phù hợp.
Gợi ý bảo quản tạm thời: Giặt nhẹ với đồ cùng màu, tránh chất tẩy mạnh và nhiệt cao; ưu tiên hướng dẫn trên nhãn sản phẩm. Đây là khuyến nghị chung cần đối chiếu nhãn thực tế, không khẳng định khả năng chống co/phai.
Mô tả không thêm chứng nhận, organic, độ bền, chống co hoặc thông tin kỹ thuật chưa có bằng chứng.

### Giá trị cho trường chưa đủ dữ liệu

Số đo: OWNER_PROVIDED, theo bảng cập nhật bên dưới. Tồn kho: OWNER_REQUESTED_INITIAL_100_PER_SKU, chưa áp dụng database; nguồn không phải kiểm đếm vật lý. Giá sản xuất thực: UNVERIFIED, không ghi chi phí mục tiêu thành COGS. Quyền sử dụng media: PENDING_DECLARATION. Video: SOURCE_PROVIDED_NOT_INSPECTED. Trạng thái sản phẩm: DRAFT; không InStock, không bật bán hoặc xuất bản. Các nhãn này là trạng thái tài liệu, không tự phát minh enum/schema executable. Khi có dữ liệu thật dùng contract hiện hành để nhập.

Không có source code, database write, upload media, chuyển mã video hoặc GitHub publication trong lần cập nhật hồ sơ này.


## Bảng size và tồn kho — quyết định chủ sở hữu 2026-10-04

Phần này thay thế các trạng thái thiếu số đo/tồn kho ở những đoạn lịch sử phía trên. Số đo nguồn chủ sở hữu; chưa tuyên bố đã kiểm tra bằng phép đo độc lập. Quy tắc mỗi size tăng: dài/rộng áo+2cm, dài tay+1cm, cả hai đầu khoảng chiều cao+10cm, cả hai đầu khoảng cân nặng+10kg.

| Size | Dài áo cm | Rộng áo cm | Dài tay cm | Chiều cao gợi ý cm | Cân nặng gợi ý kg | Tồn mỗi màu |
|---|---:|---:|---:|---|---|---:|
| S | 66 | 54 | 20 | 150–155 | 45–55 | 100 |
| M | 68 | 56 | 21 | 160–165 | 55–65 | 100 |
| L | 70 | 58 | 22 | 170–175 | 65–75 | 100 |
| XL | 72 | 60 | 23 | 180–185 | 75–85 | 100 |

Giữ đúng khoảng đã cung cấp, không tự lấp khoảng trống chiều cao155–160/165–170/175–180. Khi chiều cao/cân nặng trỏ tới size khác nhau hoặc nằm ngoài khoảng, hướng dẫn đối chiếu số đo áo và mức độ rộng mong muốn; không tự hứa vừa vặn. Cân nặng ở ranh giới dùng số đo áo để chọn, không mặc định duy nhất một size.

Định nghĩa đo đề xuất cần đối chiếu cách đo thực tế: dài áo từ điểm vai cao xuống gấu; rộng áo ngang thân/ngực khi đặt phẳng, không phải vòng ngực cơ thể; dài tay từ đường ráp vai tới đầu tay. Chưa có dung sai, không tự thêm +/-cm. Chiều cao/cân nặng là thuộc tính khuyến nghị chọn size của cơ thể, không phải phép đo quần áo. Không lưukg vào trườngcm; cần bổ sung contract typed fit guidance trước khi nhập các khoảng này nếu schema hiện hành chỉ hỗ trợ số đo áo.

### Tồn kho

100 chiếc cho mỗi tổ hợp của4 màu x4 size =16 SKU, tổng1600 chiếc. Mỗi màu400 chiếc; mỗi size400 chiếc. Đây là số khởi tạo do chủ sở hữu chỉ định, không tuyên bố là tồn kho đã kiểm đếm. Chỉ áp dụng sản phẩm Boxy này ở lần khởi tạo. Lưu lại sản phẩm không reset tồn về100. Không tạo100 riêng cho B2B/B2C; hai kênh dùng chung100 chiếc/SKU. Khi đã có giữ hàng, thay đổi tồn phải tuân thủ reserved và inventory movement contracts. Không tự đặt reserved=0 nếu dữ liệu thực tế đã có giữ hàng. Chưa có tên kho thực tế; không tự tạo tên địa điểm có thật.

### Ảnh toàn áo tham khảo

Chủ sở hữu xác nhận ngày2026-10-04: ảnh JPEG toàn áo đen đã gửi là ảnh sản phẩm Cootton và yêu cầu đưa hồ sơ lên GitHub. Ghi nhận ảnh toàn áo đen là asset sản phẩm theo xác nhận chủ sở hữu. Quyền sử dụng vẫn khai báo qua luồng nhập media; không suy ra tên sản phẩm từ tên file. Bốn ảnh cận cổ theo màu đã cung cấp vẫn giữ liên kết dự kiến. Không suy ra thông số sản phẩm từ ảnh.

### Trạng thái cập nhật

Đã hoàn tất số liệu bảng size và số tồn khởi tạo trong tài liệu. Còn cần tên kho thực tế, quyền sử dụng ảnh/ảnh toàn áo các màu còn lại, chi phí sản xuất xác minh và xử lý video. Nội dung chưa được nhập database/đẩy GitHub/xuất bản. Bổ sung schema theo contract được duyệt trước thực thi, không nhét dữ liệu fit guidance vào field không tương thích.


## Xác nhận cuối và phạm vi đồng bộ

Ảnh toàn áo đen được chủ sở hữu xác nhận là ảnh sản phẩm. Hồ sơ này được phép đồng bộ vào repository GitHub ngày2026-10-04. Đồng bộ tài liệu không đồng nghĩa nhập database, bật tồn, duyệt ảnh hoặc xuất bản website. Không đưa đường dẫn ổ đĩa riêng/credential vào repository. File media gốc chưa được tải lên GitHub; ứng dụng sẽ quản lý media qua kho ảnh riêng.

