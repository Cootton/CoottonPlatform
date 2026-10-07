# Payment và payment gateway patterns

Applicability hiện hành: [GOV-STATE-001](../governance/CURRENT_STATE.md). Knowledge guidelines không tự cấp adoption/runtime authorization; historical status được giải thích tại đó.

`ENG-PAY-001` · Accepted business authority: D04/D05/D06, DEC-LAUNCH-001. Flow dưới là guideline, không active provider hoặc payment authorization.

## Launch boundary

V1 trực tiếp một seller Cootton, website trước payment; CP top-up paused, launch CP/VC/VCS inactive. VNPAY là recommendation chưa onboarding/activation. Marketplace fee formula giữ cho future scope, không thu self-commission. Không biến merchant bank receiving account thành gateway hoặc proof payment. Không tự chọn provider/rate/return fee/funding/credentials còn thiếu.

## Gateway adapter và canonical state

Payment application service gọi stable provider port; Adapter translate vendor signatures/requests/responses. Strategy chọn approved configured provider, không random fallback khi có unknown effect. Backend tính amount/currency/order snapshot từ D02/D03, không tin amount client. D04 journals append-only/balanced, typed integer amounts, immutable allocations và hold/funding boundaries giữ nguyên.

Flow khái niệm: authorize command → validate current quote/feature readiness → persist attempt + idempotency/fingerprint → commit intent/outbox khi cần → call approved provider ngoài transaction → verify signed trusted evidence → guarded canonical transition + journal/order effect atomically → reconcile unresolved attempts. Browser redirect chỉ UX signal, không đủ đánh dấu PAID.

Client/network timeout sau provider call có thể charge đã xảy ra. Giữ UNKNOWN/PENDING và query/reconcile cùng attempt/provider reference; không tạo fresh key để “thử lại”. Cancellation/deadline không chứng minh tiền chưa vào; late success cần allocation/refund/review theo D04/D05, không bỏ evidence.

## Idempotency và webhooks

Command key scope principal+operation+key; persisted request fingerprint/result. Same key/different payload→conflict; concurrent same request không hai attempts/effects. Provider idempotency capability/retention phải xác minh, không claim mọi gateway hỗ trợ. Local unique provider refs/event IDs bảo vệ replay, không replace trusted verification.

Webhook endpoint verify signature trên đúng raw bytes theo provider protocol, secret/key rotation, timestamp/replay policy; parse/schema bounded. Validate merchant/account, amount/currency/order/attempt/reference; không trust IP hoặc status field đơn lẻ. Persist receipt+dedupe trước ACK đủ để recover; ACK2xx không đồng nghĩa business paid nếu verification chưa hoàn tất. Webhook duplicate/out-of-order/concurrent, query API và job replay phải converge guarded state; durable queue nếu async. Không log raw sensitive payloads.

Không lưu full card data/CVV. Hosted gateway/tokenization giảm scope tiếp xúc nhưng không tự chứng nhận PCI/legal readiness; merchant onboarding và actual obligations kiểm tra trước activate, không tự kết luận tuân thủ từ diagram.

## Refund, reconciliation và compensation

Refund theo original method/net original-unit allocations và cumulative caps trong D04/D06; không reprice order theo tier hiện tại. Inclusive delivery+15x24h request cutoff và personal-condition/complaint review theo D06 giữ nguyên. Monetary refund không tự restock: physical verified inspection/disposition là separate inventory evidence. Provider refund UNKNOWN giữ exposure; không gửi new refund vì callback trễ.

Reconciliation so persisted attempts/journals/orders với trusted provider settlement/transaction evidence: missing/duplicate/amount mismatch/late success/refund/chargeback, có provenance và operator queue. Adjustment là compensating approved journal, không sửa balance/history. Saga compensation không xóa lịch sử hoặc bảo đảm external reversal tức thì. Retry/outbox hỗ trợ delivery, không thay financial accounting.

## Production dependencies và acceptance

GATE-PAY-001 yêu cầu executable reviewed financial schema/constraints/posting templates; merchant/provider approval+secrets+method semantics; trusted confirmation/refund/query-after-unknown; funded features nếu bật; D03–D08 dependency contracts/grants, actual amounts/configs; replay/concurrency/late money/restore reconciliation evidence. GATE-DATA/SEC/OPS/RELEASE cũng PASS. Catalog indexing không unlock payment. AI không approve/refund/charge/direct SQL hoặc xử lý human banking login.

Source checked for webhook concepts: [Stripe webhook documentation](https://docs.stripe.com/webhooks). Đây là ví dụ provider semantics; không chọn Stripe cho Cootton và không áp protocol Stripe vào VNPAY.