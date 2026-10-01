# D09 — Trải nghiệm người dùng, SEO và hướng dẫn sử dụng

Contract `D09.ux.discovery.v1`, 2026-10-01. Dependencies CORE/D01–D08; D10 operational budgets, monitoring and release readiness. Một seller Cootton; B2C mặc định, B2B entry riêng; website hoàn chỉnh trước thanh toán. Documentation/logical design only: không sửa frontend/backend runtime, metadata hiện hành, robots, DNS, sitemap live, DB, policies, social accounts hoặc deployment. V001 cập nhật tại chỗ. CP top-up paused; CP/VC/VCS, marketplace và payment chưa được kích hoạt.

## 1. Mục tiêu và authority

Một luồng nhất quán: khám phá → xem sản phẩm → chọn SKU/mode/số lượng → giỏ → xem quote/điều kiện → checkout chỉ khi D03–D05/payment readiness được mở → theo dõi đơn → hỗ trợ/đổi trả. Hiện tại chỉ thiết kế luồng; không tạo đơn giả, nút thanh toán hoạt động giả, COD/manual transfer hoặc trạng thái paid làm fallback. Catalog-only release nếu được giao riêng phải báo rõ chưa nhận đơn/thanh toán.

Backend giữ Product/SKU, price, MOQ, stock, policy, order/case authority. Public projection cho Web/SEO; private views theo D08. Web và Android/iOS dùng cùng contracts, không sao chép business calculations. AI unavailable/disabled không chặn search/catalog/help/commerce đã được enable. Thiết kế mobile-first, tiếng Việt, VND hiển thị rõ; dữ liệu số chính xác theo contracts, không dùng float cho tiền.

## 2. Page/route và index registry

| Surface | Nội dung | Điều kiện index |
|---|---|---|
| cootton.com / | B2C discovery, danh mục và nội dung thật | Release công khai có nội dung được duyệt |
| Category/collection editorial | Landing có mục đích riêng, nội dung hữu ích, catalog thật | Explicit registry allowlist; không auto tạo mọi tổ hợp filter |
| /p/{productId}/{slug} | Product canonical chung B2C/B2B | D01 approved public product; SEO readiness riêng với purchase readiness |
| /b2b | Giới thiệu bán sỉ và điều kiện hiện hành | Nội dung/feature availability đúng sự thật; không giá sỉ giả |
| Help/policy/article | Hướng dẫn đã duyệt, policy version/effective date | Public-safe, current hoặc archive được ghi rõ |
| Search/filter/cart/checkout/account/order/case | Search result hoặc dữ liệu riêng/giao dịch | Không index; private resource vẫn bắt buộc auth/ownership |
| seller.cootton.com / admin.cootton.com | Staff/seller/admin controls | Auth và noindex; không public sitemap/CDN cache |
| Preview/draft/staging | Nội dung chưa publish | Noindex; private preview cần auth |

Route registry conceptual fields: entityType/entityId, canonicalPath, routeState, contentVersion, eligibilityReason, indexEligibility, approvedBy/approvedAt. Không executable schema/migration. Product identity dùng UUID D01: opaque ID không phải mã hóa hoặc quyền truy cập. Không email, phone, address, order secret, token hoặc customer identifier trong path/query/fragment, analytics hay referral URLs. Customer resource links phải auth và scoped ownership; sensitive token exchange không nằm trong SEO URL.

Giữ D01 slug transliteration, tối đa120 ký tự, fallback san-pham; resolve UUID, stale slug redirect301 tới canonical. Một product có một canonical URL: mode B2B/SKU/query tracking không tạo product SEO entity mới. Product detail phải giữ ngữ cảnh mode đã chọn và giải thích điều kiện giá, nhưng canonical identity chung. Deep link app chỉ mang public entity/mode, không làm chứng cứ identity/order/payment.

Equivalent duplicate URLs dùng consistent canonical/internal links và redirect khi thích hợp; canonical là tín hiệu, không bảo đảm Google chọn. Không dùng noindex để chọn canonical của duplicate. Private/no-value search/facets không thuộc sitemap và có noindex riêng; nếu cần crawler đọc noindex, không đồng thời chặn URL bằng robots.txt. Robots.txt/noindex không bảo mật. Unknown entity trả404; permanently removed public entity có thể410 theo approved registry; không soft404200 hoặc chuyển mọi URL về home. Tạm hết hàng vẫn có thể giữ trang200 với availability thật; bị rút publication/privacy thì đóng public projection.

## 3. Public rendering và cấu trúc nội dung

Next public pages server-render hoặc pre-render từ approved projection; title, H1, description, price context, product facts, navigation và links xuất hiện trong HTML có thể đọc. Không chờ AI, trend service hay private profile để render. Không riêng nội dung SEO cho crawler. Hydration giữ thông tin/version nhất quán; lỗi projection hiển thị trạng thái unavailable, không giá0/tồn kho giả.

Product detail: tên, ảnh, nhóm sản phẩm, form thuộc controlled dictionary, Raglan là design có thể áp dụng nhiều loại áo, chất liệu/GSM/xuất xứ nếu verified, màu-size, size chart và cách đo có nguồn, SKU selection, tồn/availability đúng, B2C/B2B price context, MOQ và điều kiện giao/đổi trả hiện hành. Không invent GSM, xuất xứ, certification, fitting hoặc đánh giá. Size chưa chọn thì hướng dẫn chọn; selection invalid không tự chuyển sang SKU khác.

B2B quantity tiers all-unit theo từng SKU D02; tổng PIECE của phần đơn B2B Cootton, ngưỡng tiền sau ưu đãi. UI giải thích thiếu bao nhiêu khi có valid quote, không tự tính eligibility thay backend. Defaults10 chiếc/1.000.000VND chỉ hiển thị nếu policy effective xác nhận; admin override giữ source/version. Không quảng cáo lowest wholesale tier là giá bán lẻ cho mọi người.

Empty optional input lưu trạng thái absent; required missing trả field error rõ; không biến rỗng thành0, unknown SKU hoặc wildcard scope. Giữ nhập liệu hợp lệ khi lỗi, focus lỗi đầu, retry chỉ trong semantics idempotency; không retry unknown payment như giao dịch mới. Loading/empty/out-of-stock/unavailable/session-expired rõ, không spinner vô hạn. Buyer không cần đăng nhập để đọc public catalog; private flow theo D08 thực tế khi được triển khai.

## 4. Meta description và structured data

SEO metadata sinh deterministic ở publish/projection job từ approved canonical facts + templateVersion, có edit/review theo D08. Title riêng, một H1 chính, description tóm tắt khác biệt thật, readable breadcrumbs/alt. Thiếu fact thì bỏ claim, không AI bịa hoặc duplicate keyword stuffing. AI chỉ đề xuất offline; public update cần approved content runbook/version và audit. Metadata escaped, length bounded kỹ thuật khi implementation; không giới hạn cứng160 ký tự như quy tắc Google. Google có thể lấy snippet từ page hoặc thay meta description.

Public price/availability/markup đều từ cùng effective projection/version với visible page; không dùng private/personalized quote làm shared cached Offer. Product/Organization/BreadcrumbList chỉ phát hành fields thật, visible và phù hợp eligibility. SKU không tự trở thành GTIN; không fake reviews/rating/brand rights, zero price, InStock hoặc free-return. Shipping free outbound là policy intent: actual geographic/method/exclusions cần approved configuration, không tự cam kết worldwide.

Product snippets và merchant listings có eligibility khác nhau. Website chưa cho mua trực tiếp không claim merchant-listing readiness; product snippet chỉ xem xét khi markup có đủ required actual fields. Thiếu data đủ điều kiện thì chưa phát markup tương ứng, không tạo review/Offer giả để lấp required fields. Offer chỉ cho public purchasable combination/price conditions truthful khi enablement thật; per-SKU variants/ProductGroup future cần mapping review riêng. Return/shipping structured policies chỉ khi operational scope/config thật khớp D06, không code15 days thành unconditional free return. Rich results/index/rank không guaranteed.

## 5. Discovery Platform và link graph

Flow duy nhất: Entity → Canonical URL → Anchor variants → Contextual Link Rules → Internal Link Graph. Registry references canonical D01 identity, không catalog thứ hai. Anchor variants có human-readable product/category/topic terms được duyệt; không hidden anchors, stuffed keyword lists, bán backlink hoặc automated mass social accounts.

Contextual rules có sourceEntityType, targetEntityType, approved relationship, placement, locale, priority, maxLinks, effectiveVersion. Graph edges lưu source/target IDs và rule/version; derive links từ published entities, exclude private/inactive/unrelated. Mỗi page tối đa20 contextual recommendations ở baseline design, dedupe canonical target; pagination catalog D01 default20/max50. Không full-graph join/unbounded SKUs trong rendering. Home/category/product/help liên kết bằng HTML links; orphan detection/background rebuild không chạy trong checkout.

Semantic suggestions/trend/AI optional background; suggestions không authority facts hoặc publish tự do. Template/link changes preview diff, approved rule, bounded rollout/rollback version; rollback derived views không sửa historical orders/policies. Search merchandising không biến account/order URLs thành landing SEO.

## 6. Crawl, sitemap và SEO operations

Sitemap job chỉ public canonical200/index-eligible registry entries; meaningful lastmod từ content/source version, không đổi mỗi lần render. Split theo bounded batches/protocol limits, không đưa query combinations, private/draft hoặc redirects. Sitemap publication/Search Console ownership/DNS chưa thực hiện. Index allowlist đổi qua approval/release gate; nền móng Web hiện noindex phải giữ cho đến task release có readiness evidence.

Monitor canonical mismatch, orphan/broken links, redirects,404/5xx, rendering/metadata mismatch, sitemap stale, blocked eligible pages, index exclusions, structured-data errors và actual Search Console data nếu đã connected. Reports phân biệt unavailable vs0; không invent rankings/traffic. Alerts dedupe incident và severity; AI đề xuất fix, chỉ auto-run approved scoped runbook, không tự bỏ auth/noindex hoặc bulk index URL chưa duyệt.

Curated filters được index chỉ khi approved unique landing/entity và useful content. Search/query combinatorial URLs không auto-generated sitemap. No pagination canonical-all-to-page1 nếu nội dung khác; future paginated public paths cần route contract riêng, unique identity và crawlable links. Internal keyset API cursor không tự public SEO URL. Multilingual/hreflang deferred đến khi có actual translated equivalent; không tạo locale pages rỗng.

## 7. Ảnh, hiệu năng và khả năng tiếp cận

Upload original qua authorized media flow: verify type/size/signature, scan/quarantine, rights/provenance, strip public EXIF/location, publish safe derivative only. Private originals/evidence không CDN public. Derivative AVIF/WebP với fallback, responsive width candidates, fixed dimensions/aspect ratio, cache immutable content-version URL; bound transform allowlist không arbitrary URL fetch/SSRF. Crop không che/đổi misleading fit/color/design; AI không tự thay ảnh sản phẩm thật. Alt mô tả thực tế, decorative empty alt.

LCP hero preload/priority chỉ ảnh cần thiết, không lazy-load ảnh chính; below-fold lazy, galleries bounded D01, không tải toàn bộ SKU images. Limit fonts/scripts, shared components, server/cache projections thay unbounded relational queries. Private pages Cache-Control private/no-store theo sensitivity, không shared CDN cache chứa sessions/PII. Public cache key includes content/mode/policy version necessary, không per-customer quote. Outbox invalidation version-guarded; stale display có indicator phù hợp, checkout luôn revalidate canonical D02–D05, không tin cache.

Performance goals p75 mobile LCP≤2.5s, INP≤200ms, CLS≤0.1; đây là design targets chưa đo đạt. D10 khóa actual RUM sampling/privacy, page weights, API latency, DB/query/cache TTL/budgets và alert thresholds trước release; không tự chọn giá trị tài chính qua performance config. SEO/help/AI/trend/report jobs ngoài critical path. Cache failure fallback bounded public reads hoặc unavailable, không overload DB bằng unlimited cache misses.

Accessibility target WCAG2.2 AA khi implementation, không claim certification: keyboard/focus visible, semantic controls/labels, contrast, error announced, touch controls đủ lớn, reduced motion, không chỉ màu để phân biệt stock/SKU. Responsive buyer/seller/admin shared design system; seller/admin tables bounded, responsive summary/detail; actions cần confirm theo sensitivity D08, không ép confirmation mọi thao tác nhỏ.

## 8. Hướng dẫn người mới và CSKH

Help topics/version registry conceptual: topicId, audience BUYER/COOTTON_STAFF/ADMIN, domainContractRef, policyVersion, effectiveAt, state DRAFT/APPROVED/PUBLISHED/ARCHIVED, author/approval/sourceRefs. Public projection chỉ public topics; private operational/incident runbooks không index. Help không policy source: effective policy read qua domain contract; stale help bị đánh dấu/block publish hoặc cập nhật sau version change, không âm thầm sửa rights của đơn cũ.

Buyer: chọn size/form/material, Raglan/design; giá retail/wholesale và MOQ; cart/quote; availability/payment chưa mở; shipping tracking khi có đơn thật; return request trong15×24 giờ từ trusted deliveredAt, inclusive exact cutoff; personal return unused/unwashed/tags/accessories; wrong/defective/damaged complaint review riêng, không tự từ chối vì thiếu tem/quá hạn. Không hứa approved refund/restock trước evidence, không ghi free-return khi Cootton-fixed-return-cost configuration chưa đủ. Không hướng dẫn nạp/dùng points như active.

Cootton staff: dictionary/SKU immutable, catalog media approval, price/version/MOQ, hold versus physical stock, order/shipping evidence, quarantine/inspection/restock, partial refund scope, reports incomplete costs và role/policy boundaries. Không marketplace seller onboarding/payout trong launch. ADMIN guide: typed config, approvals, readiness, revocation, audit, incident escalation; AI không own approval hoặc SQL/balance sửa trực tiếp.

CP/VC/VCS glossary public nếu hữu ích phải gắn rõ chưa kích hoạt, không redemption/purchase instruction hoặc funded guarantee. Đổi tiền/nguồn VC/VCS chưa quyết định không bịa. CSKH AI retrieval chỉ approved current public facts + explicit authorized own-case minimal fields; provider-isolated memory, no raw customer info/third-party egress mặc định. Suggest size/alternatives khi có dữ liệu thật; không fake scarcity, urgency, review, discount hoặc financial assurance. Unknown → giải thích chưa xác nhận, chuyển case/admin; human support và core app hoạt động không AI.

## 9. AEO/GEO và trend

Helpful textual answers, concrete product facts, size/care explanation, transparent policy/source dates và accessible links là nền chung. Google AI Search không yêu cầu schema hay AI text file đặc biệt; indexing/citation không guaranteed. Không thêm llms.txt như điều kiện bắt buộc hoặc hứa thứ hạng/AI citation. Other providers nếu tích hợp phải check documented access/privacy policy riêng, không suy ra Google rules cho tất cả.

Trend data có provenance/license/time window/coverage, aggregate public-safe, approved scope; AI chỉ propose editorial/collection changes từ actual catalog, không tự tạo bán hàng/SEO page mass spam. Trend failures không ảnh hưởng web/catalog, budgeted background jobs. Social autopost/account creation nằm task riêng, không D09 authorized action.

## 10. Logical projections và consistency

Conceptual records: route_entity_registry, seo_template_version, public_product_projection, discovery_rule_version/link_edge_projection, help_topic_version, safe_media_derivative. Tên mô tả logical responsibilities, không locked executable tables. Each projection sourceContract/sourceVersion/generatedAt/status; event/outbox dedupe và monotonic application; delayed event không overwrite newer source. Price effective-time change cần scheduled invalidation/rebuild, không chỉ chờ product_updated. Public content withdrawal phải purge cache/links/sitemap, không leak stale sensitive content.

Read APIs bounded filters/allowlist/keyset20 max50, scoped queries before pagination. Public/detail không expose private evidence, internal costs, owner identifiers hoặc grant registry. Search index/cache/SEO metadata/help đều rebuildable từ canonical source, không canonical finance/catalog replacement. No new service/microservice/vector DB required for launch; use existing modular backend/public projections first. Per-model AI databases separate, không đọc chéo provider memory; only authorized canonical public/minimal data contracts, never unrestricted DB replicas.

## 11. Deliverables, acceptance và gates

Deliverables của task: D09 contract, V001 section121, CORE reference, AI contributor boundary và private working copies. Không screenshots production UX, search verification, executed tests hoặc published pages được giả báo là hoàn thành.

Future implementation acceptance:
- Stable entity/slugs/mode/404/public-withdrawal semantics đúng D01; no customer/token URLs.
- Metadata/markup/HTML từ same approved facts; no false purchase/price/stock/reviews; missing facts controlled.
- Buyer mobile/keyboard/error/empty/out-of-stock flow; B2B SKU tiers và seller total minima theo backend.
- Private auth/scope và cache boundaries; no public sitemap/private evidence leak.
- Versioned auto descriptions/help/link rules, bounded media/query/cache jobs; late events/source changes preserved.
- Visible effective return/points/checkout readiness matches D04–D08, no hidden financial fallback.
- Actual rendering/structured-data/accessibility/performance evidence collected only in assigned implementation/release task. Existing repository CI validates docs/foundation, không chứng minh D09 runtime behavior.

Before public index release: actual approved catalog/images/content/policy contacts, public route inventory, safe rendering/security configuration, D10 operational readiness, explicit release assignment và retained noindex until ready. Payment readiness is a separate gate: indexable catalog does not unlock checkout. Sensitive private features additionally need D08 actual bootstrap/session/grants. Next D10 — vận hành, quan sát, backup/DR và readiness; không tự bắt đầu code/payment/deploy từ D09.

## 12. Primary references checked 2026-10-01

- [Google product structured data](https://developers.google.com/search/docs/appearance/structured-data/product): product snippet/merchant listing eligibility và truthful product markup.
- [Google canonical URLs](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls): duplicate consolidation signals.
- [Google snippets](https://developers.google.com/search/docs/appearance/snippet): meaningful per-page descriptions, snippets may differ.
- [Google AI features](https://developers.google.com/search/docs/appearance/ai-features): SEO fundamentals, no additional special markup requirement, no guaranteed inclusion.

- [Google Web Vitals](https://web.dev/articles/vitals): p75 LCP/INP/CLS design goals, field evidence required.
- [Google sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap): canonical eligible URLs and truthful lastmod.
