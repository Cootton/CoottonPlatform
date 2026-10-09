# RULE-GHACTIONS-001 — Quyền GitHub Actions cho CoottonPlatform

Ngày: 2026-10-09 (Asia/Saigon). Trạng thái cấu hình: OWNER_AUTHORIZED, APPLIED_VERIFIED. Quy tắc contributor có hiệu lực trong repository khi PR chứa tài liệu này được merge vào main.

## Nguồn và đối tượng

Owner yêu cầu quy tắc cấp quyền publish/merge/deploy cho PR task; xác nhận muốn thay quyền thực tế, phạm vi toàn bộ công việc trong CoottonPlatform, đối tượng GitHub Actions. Không cấp thêm quyền cho collaborators hoặc kết nối GitHub của Work từ yêu cầu này.

## Cấu hình trước thay đổi

Repository: Cootton/CoottonPlatform. Settings → Actions → General:

- Workflow permissions: Read repository contents and packages permissions.
- Allow GitHub Actions to create and approve pull requests: tắt.
- Actions allowlist: Cootton và GitHub-created actions; giữ yêu cầu approval đối với tất cả external contributors.
- Hai workflow source hiện có Foundation checks và Container build checks khai báo `contents: read`. Chúng vẫn giữ read-only khi đổi default repository, vì permissions explicit trong YAML có precedence.

## Thay đổi đã được owner xác nhận và thực hiện

1. Đổi default Workflow permissions sang Read and write permissions. Đây là mặc định đọc/ghi cho các scope GitHub repository của GITHUB_TOKEN ở workflow/job không khai báo permissions riêng; không chỉ giới hạn ba lệnh publish/merge/deploy. Workflow mới thiếu permissions explicit sẽ kế thừa quyền rộng hơn.
2. Bật Allow GitHub Actions to create and approve pull requests. GitHub gộp khả năng tạo PR và gửi approving reviews trong cùng setting. Bật setting cho phép cả hai khi token/job có quyền phù hợp; quy tắc contributor không tự loại bỏ năng lực approve khỏi platform.
3. Giữ permissions explicit của CI hiện có; không sửa allowlist, fork approvals, branch checks/protection hay cloud IAM. Không tạo PAT, lưu credential mới, thêm app/collaborator, triển khai source hoặc đổi traffic từ việc cấu hình này.

Owner đã xác nhận tại bước thay đổi quyền: “Đồng ý cả hai thay đổi”, trả lời câu hỏi nêu rõ Read and write permissions và Allow GitHub Actions to create and approve pull requests, cùng giới hạn chưa cấp Google Cloud IAM/deploy. Work đã bấm Save workflow permissions settings; giao diện báo “Default workflow permissions settings saved.” và trả lại Read and write=selected, create/approve PR=checked. Đây là bằng chứng cấu hình thực tế, không là bằng chứng workflow publish/merge/deploy đã chạy. Các hướng dẫn job/review bên dưới là quy trình contributor, không phê duyệt nghiệp vụ quảng cáo hoặc phát hành.

## Quy tắc sử dụng trong PR task

- Mỗi workflow mới vẫn khai báo permissions ở job theo tác vụ. Publish source/release cần `contents: write`; thao tác PR cần `pull-requests: write` cùng quyền source thích hợp. Merge phải kiểm tra exact head, CI, required reviews và protection hiện hành; không tự approve để thay review độc lập hoặc bypass checks.
- Job publish/merge chạy trong trusted context đã review. Không cấp write token cho mã PR chưa tin cậy hoặc dùng pull_request_target để chạy source ngoài scope.
- `deployments: write` cho phép ghi deployment object/status trên GitHub; không tự cấp quyền deploy Google Cloud. Cloud deploy cần môi trường đích, workflow/provider và cloud identity/IAM riêng được xác định. Chỉ khai báo `id-token: write` ở job dùng OIDC khi trust policy và quyền cloud đã được giao cụ thể.
- Quyền kỹ thuật không thay quyết định phát hành hoặc readiness. API04 đang tạm ngưng; search/CPM simulation chưa đạt full deploy gates; công thức vẫn PROPOSED. Không tự deploy hoặc bật quảng cáo/thu phí khi đổi settings.

## Kiểm chứng và recovery

Bằng chứng ngày 2026-10-09, Asia/Saigon: Save success message và cả hai trạng thái enabled quan sát trực tiếp trên trang settings/actions. Ảnh xác nhận được lưu trong artifact workspace của task; không đưa secrets hoặc session tokens vào source. Scope repository Cootton/CoottonPlatform; base source trước tài liệu này 459aca83879c7c10622a30116f7143d0bcbedb6a. Không sửa YAML của hai workflow CI. Trước workflow task, đọc permissions effective và environment/protection; CI cũ chỉ chứng minh source đã kiểm tra, không chứng minh quyền mới đã chạy thành công.

Recovery cấu hình: trở lại read contents/packages và tắt create/approve PR (giá trị cũ); không xóa source hoặc workflow để quay lui quyền.

Nguồn chính thức: [GITHUB_TOKEN permissions](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax), [Deployments and environments](https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments).
