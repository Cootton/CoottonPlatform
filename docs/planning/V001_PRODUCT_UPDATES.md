# V001 — Product intake and Boxy updates

This is an addendum to COOTTON_WORKING_V001.md, not a new working version. Latest owner decisions here supersede older conflicting product values. Product specification: [COOTTON_BOXY_PRODUCT_SPEC.md](COOTTON_BOXY_PRODUCT_SPEC.md).

## 135. Product intake deployed and live acceptance complete — 2026-10-04

This checkpoint supersedes activation-pending statements in section134. Owner approved the exact activation manifest. Migration003 applied idempotently, private image bucket provisioned with enforced public access prevention and bucket-only create/read grants. Fixed source38512162db08fb60a31ed5beb81ee328211a2314 built successfully in Cloud Build335fee10-aab0-49fc-9e8a-f33b357147dc. API cootton-api-00002-9zx and Web cootton-web-00004-cnl ready,100% traffic. HTTPS and unauthenticated rejection probes passed.

Existing non-sale sample is DRAFT v5: basic edit v3, detailed intake v4, private image upload v5. Authenticated preview and audit history verified. One SKU, one unapproved media, zero enabled offers, zero stock rows and zero public-eligible products. Synthetic prices/chart/image are technical fixtures only; origin/GSM unknown, no actual warehouse/stock entered. Inventory save and unchanged SKU identity were verified with every temporary write rolled back. Buyer catalog remains empty. Real merchandise, publication, payment and domain cutover await separate tasks. See outputs/COOTTON_PRODUCT_INTAKE_CHECKPOINT.md for handoff and outputs/COOTTON_PRODUCT_INTAKE_LIVE.png for UI evidence.

## 136. Real Boxy product and media design — 2026-10-04

Owner supplies round-neck Cootton Boxy 100% Cotton 250 GSM, Vietnam, WHITE/BLACK/RED/YELLOW x S/M/L/XL, 16 SKU. Owner sets retail=production cost x3, wholesale=cost x2 and retail range177000–199000 VND. Proposed size prices177000/183000/192000/198000 and wholesale118000/122000/128000/132000 are design proposals; inferred costs are NOT verified COGS. No actual stock/measurements supplied. See outputs/COOTTON_BOXY_PRODUCT_SPEC.md for exact matrix and missing facts.

Owner media rule interpreted as maximum9 gallery images plus maximum1 optional video. Every SKU references a matching-color image; same-color sizes share asset, generated thumbnails do not consume extra gallery slots. Two supplied photos are collar details in red/white, no black/yellow assets yet. Plan requires transactional server cap, concurrency/idempotency, approved color associations and async private video processing. MP4 H.264720p/30fps faststart, lightweight poster, no autoplay/preload, fetch on play, CDN range support. Performance limits are proposed; supplied MOV not yet inspected/transcoded. This section is design only, no upload/migration/deployment or merchandise publication performed; existing image-only Admin does not yet enforce this new video workflow.

## 137. Boxy wholesale multiplier and supplied color images — 2026-10-04

Owner overrides wholesale multiplier from2 to1.5 for this product. Target costs59000/61000/64000/66000 remain unverified; retail177000/183000/192000/198000 unchanged; proposed wholesale88500/91500/96000/99000 by size across16 SKU. Exact source-of-truth owner decision supersedes section136 x2. Maintain both B2B quantity and post-discount monetary thresholds;10 units at these wholesale prices do not reach1000000 VND.

Owner supplies dencotruoc.JPG BLACK and vangcotruoc.JPG YELLOW, completing collar-detail photos for four colors. Shared per-color thumbnail associations/alt text and descriptive content added to outputs/COOTTON_BOXY_PRODUCT_SPEC.md. Full-garment images, actual measurements, physical stock, verified costs and media rights declaration remain incomplete. No invented actual facts, merchandise publication, database writes, processing or deployment. Document status only; do not invent runtime schema values from planning labels.

## 138. Owner size chart and initial inventory — 2026-10-04

Supersedes unknown size/stock in sections136–137 for this Boxy product. Owner S: garment length66cm,width54cm,sleeve20cm; fit height150–155cm,weight45–55kg. Each subsequent size adds2cm length/width,1cm sleeve,10cm to both height endpoints and10kg to both weight endpoints. M68/56/21,160–165,55–65; L70/58/22,170–175,65–75; XL72/60/23,180–185,75–85. Body fit guidance is distinct from garment cm measurements; typed kg/range contract required, no invented schema or automatic gap filling.

Owner requests initial100 units per color-size SKU:16 SKU,total1600,shared B2B/B2C. This is owner-directed initialization, not verified physical count and not a global default/reset on save. Real warehouse unspecified; do not fabricate. Newly attached full-black-shirt image is reference only pending confirmation of actual Cootton product and rights. Local documentation updated only, no database/GitHub/publication actions. See outputs/COOTTON_BOXY_PRODUCT_SPEC.md.


## 139. Owner confirms full black-shirt image — 2026-10-04

Owner confirms the supplied full black-shirt photograph is the Cootton product image and authorizes GitHub documentation synchronization. Supersedes reference-only status in section138. Original media not uploaded to GitHub; media rights declaration follows application intake. No database write, product publication or deployment in this documentation update.


## 140. Media implementation prepared — 2026-10-04

Owner requests completion:9 gallery images plus1 video; color-shared SKU thumbnails. Source implements media contracts, additive004, bounded optimized MP4 intake, thumbnail association and private previews. Owner chooses first30s from original82.32s454MB clip; local preparedMP4 is720x406/30fps/30s,1873705bytes. Original preserved. Initial v1 accepts preparedMP4<=8MiB rather than background250MiB MOV upload; approved public delivery/CDN remains separate publication scope. SQL cap/cross-product FK/one-video and grant introspection checks passed with allDDL/data rolled back. Compile passed; image checks2passed; real normalization on localWindows blocked by subprocessEPERM, Linux container execution pending. Reviewed activation scope:MEDIA_ACTIVATION.md. Source readiness does not imply deployed004.

Current real Boxy DRAFTv9 has16SKU,5private unapprovedimages,12garmentmeasurements and owner-initialized100/SKU at Kho Cootton — TP.HCM01(total1600). Body fit recommendations in description, not kg values in cm schema. Technical sample DRAFTv5 retained. No offers/publication/payment activation.
