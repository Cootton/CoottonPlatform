# Spring Boot lifecycle, Git và cloud/EC2

Applicability hiện hành: [GOV-STATE-001](../governance/CURRENT_STATE.md). Knowledge guidelines không tự cấp adoption/runtime authorization; historical status được giải thích tại đó.

`ENG-RUNTIME-001` · Spring/AWS concepts LATER/reference; Cootton accepted TypeScript/NestJS + Google Cloud, Neon current.

## Spring Boot internal request lifecycle (Servlet/MVC)

Startup: application bootstrap→auto-configuration theo classpath/properties/conditions→ApplicationContext/IoC tạo beans→constructor DI và lifecycle→embedded servlet container listen. Auto-config không thay explicit business design; singleton beans không giữ mutable principal/request state. MVC và reactive WebFlux có execution model khác, không dùng một sơ đồ cho cả hai.

Request: connector/container nhận HTTP→Servlet filters (security chain khi configured)→DispatcherServlet→HandlerMapping chọn handler→HandlerAdapter invoke→argument resolvers/data binding/message converters+validation→controller→service/domain→repository transaction/provider adapter→return value handler/message converter serialize JSON (hoặc view resolver cho HTML)→interceptors/filter unwind→HTTP response. Exceptions có thể được HandlerExceptionResolver/@ControllerAdvice xử lý; filter/security exceptions có handling riêng. Interceptors không thay filter security chain hoặc backend domain permissions.

`@Transactional` thường qua proxy AOP: transaction start/commit/rollback quanh eligible proxied method; self-invocation có thể bypass proxy, rollback policy tùy configuration/exception. Connection từ pool, ORM flush khác commit; external side effects không rollback cùng DB. Async executor không tự propagate security/transaction context an toàn; cần explicit bounded design. Spring MVC callable/async request không biến blocking JDBC thành nonblocking IO.

Cootton NestJS analogous learning: middleware/guards/pipes/interceptors/controller/service/repository/filter exception boundary và DI, nhưng order cụ thể cần source/framework version kiểm tra. Không copy Spring annotations/lifecycle thành Nest implementation, không đổi stack từ lesson. Source: [DispatcherServlet](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-servlet.html), [processing](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-servlet/sequence.html).

## Git merge vs rebase

Merge kết hợp histories, tạo merge commit khi non-fast-forward và giữ existing commit identities; rebase replay commits lên new base tạo SHAs mới. Both có conflicts, cần resolve theo behavior/contracts và relevant checks, không chọn ours/theirs hàng loạt cho decision docs. Rebase giúp clean linear history cho own unpublished feature branch; không rewrite shared/main hoặc force-push người khác chưa scoped authorization. `--force-with-lease` giảm stale overwrite risk, không là permission.

PR dùng protected main/current checks; one task scoped diff. Docs integration giữ old accepted text, additive override+ADR/changelog. Branch baseline SHA và head phải recorded; upstream updates → reconcile, không copy older V001 đè newer. Squash merge policy của repo quyết định final history, không tự bypass branch protection. Git revert tạo inverse commit, không rollback external schema/data/provider side effects; migration/recovery theo D10. Source: [git rebase](https://git-scm.com/docs/git-rebase), [git merge](https://git-scm.com/docs/git-merge).

## Cloud fundamentals và EC2 (reference)

Region là geographic deployment grouping; Availability Zone là fault-isolation location trong region; actual service scope khác nhau. VPC/subnets/routes/security groups/network ACLs/IAM tách network reachability và identity permissions. Public IP không yêu cầu expose DB; TLS/secrets/service identities và least privilege vẫn cần. IaaS VM owner quản OS patches/processes; managed service giảm operations nhưng không thay backups/access/cost/recovery evidence.

EC2 là AWS VM: AMI template, instance type CPU/RAM/network, EBS persistent block volume, instance-store ephemeral device, ENI/private/public addressing, IAM role thay embedded keys. Stop/terminate và EBS delete-on-termination phụ thuộc config; không coi local instance-store là durable database backup. Auto Scaling Group/Load Balancer hỗ trợ instance health/scaling; RDS/object storage là separate managed services. Security Group stateful filtering, subnet/NACL/routing khác lớp; không mở all-ports để “fix connectivity”. Spot interruptions cần resumable/idempotent workloads, không default financial DB.

Cloud Run current direction là containers managed, scale/cold start/concurrency/request lifetime và temporary filesystem limits phải actual manifest; không assume VM persistent process/disk. GCP object storage/Secret Manager/Firebase Auth và Neon có separate identities/billing/capabilities. Cost gồm compute/storage/egress/requests/logs/backups, không chỉ VM price. Quotas/budget alerts/region/HA/restore evidence trước production. Source: [AWS EC2 concepts](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/concepts.html). AWS là bài học, không migration decision.

Trace ADR0001/0002, D10; GATE-OPS-001/GATE-RELEASE-001. Checkpoint129–131 mới chỉ reported identity/secrets preparation, không images deployed/services verified.