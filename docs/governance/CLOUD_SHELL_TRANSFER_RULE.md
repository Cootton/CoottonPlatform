# RULE-CLOUDSHELL-001 — Chuyển file phục vụ công việc Cootton

Version: 1.0.0 · Ngày: 2026-10-09 · Múi giờ: Asia/Saigon.

## 1. Nguồn phê duyệt

Lời người dùng: “tạo rule cho Cloud Shell( cho phép upload file lên nếu cần để chạy cloud shell)”.

**OWNER_AUTHORIZED:** Work được upload file từ workspace lên phiên Google Cloud Shell của người dùng khi file cần thiết để thực hiện nhiệm vụ Cootton đã được giao. Không cần hỏi lại cho từng lần upload nằm trong cùng phạm vi, tài khoản, đích đến và loại dữ liệu đã được cho phép. Quyền này áp dụng trong phiên làm việc hiện tại; các phiên sau đọc nguồn phê duyệt cùng quy tắc này để xác định phạm vi còn hiệu lực.

Các bước kiểm tra dưới đây là quy trình contributor do assistant đề xuất để thực hiện chỉ đạo đó. Không gắn ACCEPTED cho chính sách nghiệp vụ, hạ tầng hoặc deploy dựa trên quyền upload. Owner đã giao publish/merge quy tắc vào GitHub. Quy tắc contributor có hiệu lực trong repository khi PR chứa tài liệu này được merge vào main; PR/merge và CI phải có bằng chứng thực tế.

## 2. File và đích đến được phép

- Source đã chuẩn bị, Git bundle/patch, tài liệu, manifest và script kiểm tra cần thiết cho nhiệm vụ hiện tại; ưu tiên gói nhỏ nhất vẫn đủ source và ngữ cảnh review.
- Phiên Cloud Shell thuộc tài khoản người dùng đang làm việc với Cootton. Xác minh tài khoản, project và đường dẫn đích trên giao diện trước upload; không suy ra quyền ghi production từ project đang chọn.
- Upload vào thư mục home hoặc thư mục công việc đã xác định trong home. Không ghi đè file cùng tên khi chưa xác định nội dung/độ cần thiết; dùng tên phiên bản hoặc dừng để giải quyết xung đột.
- Quyền upload chung không bao gồm token, private key, credential, file `.env` chứa secret, bản sao dữ liệu khách hàng hoặc dữ liệu nhạy cảm ngoài scope. Chỉ chuyển những dữ liệu đó khi có chỉ đạo cụ thể cho đúng dữ liệu và đích đến, qua cơ chế được phép; không lấy credential từ secret store để sửa lỗi Git.

## 3. Quy trình upload và kiểm chứng

1. Xác định nhiệm vụ đã được giao, file local tuyệt đối, nội dung/source SHA, kích thước và đích đến. Kiểm tra manifest/nội dung liên quan; không coi tên file là bằng chứng an toàn hoặc đầy đủ.
2. Dùng chức năng Upload chính thức của Cloud Shell qua file chooser được hỗ trợ. Không paste/nén/mã hóa/chia file để né kiểm tra bắt buộc. Tuân thủ [RULE-GITHUB-001](GITHUB_REVIEW_CAPACITY_RULE.md) khi công việc liên quan publication/review.
3. Chọn file cụ thể và thư mục đích; upload tuần tự rồi xác minh trạng thái Success. Ghi lại tên, đường dẫn và bằng chứng; nếu lỗi, xác định outcome trước khi thử lại.
4. Trước dùng file để chạy hoặc publish, kiểm tra file ở đích và tính toàn vẹn: so sánh SHA256 với bản local khi có thể. Với Git bundle, kiểm tra prerequisites và `git bundle verify`; nhập vào checkout riêng, xác minh commit SHA, diff và trạng thái làm việc. Upload Success không chứng minh bundle hợp lệ hoặc source đã publish.
5. Đọc script và lệnh định chạy, xác nhận chúng thuộc nhiệm vụ hiện tại. Chỉ thực hiện khi scope chạy lệnh đã được người dùng giao; không tự chạy script chỉ vì nó vừa được upload.

## 4. Phân biệt các quyền và trạng thái

Upload là chuyển file tới môi trường thực thi, không tự cấp quyền chạy mọi lệnh trong file. Các lệnh build/test, Git fetch/push/PR/merge chỉ thực hiện theo chỉ đạo tương ứng còn hiệu lực và kiểm tra cần thiết; không hỏi lại nếu chỉ đạo đó đã rõ. Ví dụ người dùng đã giao merge ứng dụng thì có thể tiếp tục workflow Git sau upload, nhưng vẫn phải kiểm tra exact head và CI.

Deploy, thay traffic, áp dụng migration, cấp IAM/grants, thay credential, ghi/xóa dữ liệu production hoặc kích hoạt quảng cáo/thu phí cần scope riêng và readiness tương ứng. Không coi upload hay source merge là bằng chứng các gate đó đã đạt. Không tự tiếp tục workflow API04 đang tạm ngưng.

Ghi riêng các trạng thái: LOCAL_PREPARED → UPLOADED → INTEGRITY_VERIFIED → IMPORTED → PUBLISHED → MERGED → DEPLOYED. Chỉ xác lập mỗi trạng thái khi có bằng chứng của hành động tương ứng; không suy diễn bước sau từ bước trước.

Nếu công cụ hoặc automatic approval review chặn hành động, báo đúng nguyên nhân và phần chưa thực hiện. Quy tắc này không override approval/sandbox, không cho phép đổi công cụ hoặc chia payload nhằm vượt từ chối. Chỉ tiếp tục qua cơ chế được hỗ trợ khi blocker đã được giải quyết và kiểm tra bắt buộc vẫn được thực hiện.

## 5. Ví dụ và evidence hiện có

Người dùng đã giao upload gói source tìm kiếm/quảng cáo. Giao diện Cloud Shell xác nhận `cootton-search-release.bundle` được upload thành công tới `/home/minhthao_220822/` ngày 2026-10-09. Đây là bằng chứng UPLOADED; chưa xác minh hash ở đích, nhập bundle, push, CI, merge hoặc deploy từ lần upload đó. Source chuẩn bị: `2c34b45d4a5a2b971277136cb9ba19abdf17a498`, prerequisite main: `696a462f0c23da87c30c66f24401a7d0265617a2`.

## 6. Kết thúc và chuyển giao

Giữ file phục vụ nhiệm vụ cho tới khi có bản remote đã kiểm chứng hoặc gói recovery cần thiết. Không tự xóa file user-owned hay thư mục dùng chung. Báo đường dẫn, source SHA, kết quả kiểm chứng, việc đã chạy và việc còn chờ. Việc ghi quy tắc này không tạo automation và không thay cấu hình Cloud Shell/GCP.
