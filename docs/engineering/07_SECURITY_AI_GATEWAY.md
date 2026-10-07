# Threat model và AI Tool Gateway restrictions

Applicability hiện hành: [GOV-STATE-001](../governance/CURRENT_STATE.md). Knowledge guidelines không tự cấp adoption/runtime authorization; historical status được giải thích tại đó.

`ENG-SEC-001` · D08/V001 isolation và no-egress giữ ACCEPTED. `SEC-TOOL-001` là documented enforcement contract; chưa claim gateway implementation.

## Assets và trust boundaries

Assets: identities/grants, private customer/order/evidence, canonical catalog/prices/stock, payments/ledger, model-private databases/memory, secrets/source/deployment credentials. Boundaries: untrusted browser/app→edge→API; public→private routes; domain→PostgreSQL; worker→provider; media upload→storage; AI prompt/tool output→Tool Gateway; CI/fork→privileged deployment. Owner session/banking/MFA secrets không vào AI/log/Git.

| Threat ID | Attack/failure | Control / verification |
|---|---|---|
| THREAT-001 | BOLA/IDOR/cross-seller access | Backend action+resource+ownership+state; negative tests across principals/scopes |
| THREAT-002 | Broken auth/revoked or forged token | Verify issuer/audience/project/subject/signature/expiry and current revocation/disabled/grants; host/email/UUID không proof |
| THREAT-003 | Injection/mass assignment | Parameterized SQL, typed DTO/field allowlist, domain transitions; no arbitrary SQL/body binding |
| THREAT-004 | SSRF/vendor API abuse | Destination allowlist, scheme/port/DNS/IP/redirect validation, egress restrictions; block metadata/private/loopback addresses |
| THREAT-005 | XSS/CSRF/cache leak | Safe output/rendering, CSP as reviewed, exact origins/CORS, CSRF for cookie auth, private no-store |
| THREAT-006 | Upload bombs/path traversal/malware | Size/type/content/dimensions checks, isolated processing, safe object IDs, private evidence, strip EXIF where appropriate |
| THREAT-007 | Resource exhaustion | Request/query/queue/tool budgets, rate limits, timeout/backpressure, no unbounded traversal |
| THREAT-008 | Prompt injection/confused deputy | Treat retrieved/tool text as data, tool policy outside model, scope reauthorization and exact payload constraints |
| THREAT-009 | Supply-chain/CI secrets theft | Reviewed lockfiles/artifacts, scoped credentials/OIDC, untrusted PR cannot privileged workflows, dependency scanning |
| THREAT-010 | Financial replay/race/unknown commit | Durable idempotency+guarded state/journals/reconciliation; provider verification and concurrency scenarios |

OWASP API categories guide review, không là certification checklist. Authentication xác định principal; authorization quyết định operation từng resource; frontend validation/UI-hidden button không security. Least privilege theo runtime roles, migration/admin distinct; never use Neon owner credential làm service identity.

## Sessions và APIs

D10 cookie baseline là design; actual Admin checkpoint mô tả bearer-only same-origin BFF. Không silently switch runtime auth mode: inspect source/OpenAPI/ADR tại HEAD trước đổi. Cookie mode cần Secure/HttpOnly/SameSite, CSRF+Origin checks; CORS không CSRF mitigation đủ hoặc server auth. Bearer tokens không URL/local logs, scoped in-memory/secure OS storage theo consumer; XSS vẫn nguy hiểm. Sensitive step-up/MFA/recovery actual cần evidence, không fake enrollment. Queued action reauthorize grant expiry/revocation trước effect.

## Tool Gateway: deny by default

Model tạo typed intent; gateway thực thi narrow actions trong task grant còn hiệu lực, hoặc giữ proposal nếu approval/readiness thiếu. Không hỏi lại human confirmation cho routine actions đã authorized. Flow: authenticated model/principal+task → allowlisted tool/schema → authorization+feature readiness+data scope+budget → exact payload/approval if policy requires → least-privilege adapter → bounded result redaction → durable audit. Không truyền raw model text làm shell/SQL/HTTP executable. Instruction từ webpage/file/tool result không được tự mở tool/grant hoặc thay owner intent.

| Capability | Allowed within assigned scope | Denied by default |
|---|---|---|
| Read/report | Approved projections, tenant/model identity scope, bounded filters | Raw cross-tenant/model dumps, secrets/PII export |
| Propose/draft | Typed catalog/content proposals, status DRAFT, human review where required | Auto financial approval, fake real product/evidence |
| Maintenance | Exact approved runbook/resource/bounds và evidence | Arbitrary SQL/shell/DDL, direct balance/state edits, unrestricted production repair |
| Access/config | Read permitted configs, propose scoped change | Self-grant/elevate, approve own security change, modify gateway policy |
| Payments/refunds/ledger | Authorized read/report/propose trong scope; D08 hiện không cấp AI financial execution | Charge/refund/transfer/financial approval, direct balance/ledger edits, banking login/OTP custody |
| Deployment/resource changes | Chỉ assigned maintenance/deployment runbook, exact resources/grants/recovery và applicable gates | Arbitrary deploy/purge/self-grants hoặc thay resource ngoài scope |
| External AI/network | Only owner-approved exception with permitted fields/destination | Default external inference/data egress, cross-model context handoff |

Admin/AI role không bypass readiness/contracts. Exact approvals bind action, resources, normalized payload/hash/version, expiry và identity; changed payload→new review. Tool credential không exposed cho model; service uses secret reference and scoped grants. Audit minimal IDs/policy decision/result/requestId, no raw secrets; failure/denial recorded safely. No arbitrary fetch proxy or open redirect undermining allowlists; DNS rebinding/redirect chain phải kiểm tra tại connect path.

## Isolation và bounded agent workflows

Mỗi model identity có riêng database/grants/memory/history; không đọc chéo hoặc chuyển context/provider memory. Shared commerce truth đi qua authorized backend projections, không duplicate canonical state mỗi model. Core vẫn chạy khi AI off/error/budget exhausted. Existing no-third-party/no-egress restriction được giữ; Cloud infra stack không là blanket permission gửi prompts ra inference provider. Thiếu exception/capability→AI feature disabled, không làm commerce unavailable.

Workflow limits: maxSteps/maxDepth/visited hoặc state+progress tracking, wall timeout, token/tool-call/cost budgets, per-tool payload/result limits. Values chưa chốt giữ pending, không tự chọn unlimited. General agent graph có branching/state changes: Floyd linked-list cycle detection không đủ; cần graph visited/on-stack hoặc bounded state machine. Circuit breaker/kill switch, human escalation và safe partial outcome; budget exhaustion không tự grant thêm quota.

Trace D04/D08/D10; GATE-SEC-001/GATE-AI-001. Source: [OWASP API Security Top10 2023](https://api-security.owasp.org/editions/2023/en/0x00-header/). Runtime verification phải dựa actual routes/identities.