-- Additive guard for both legacy and new immutable publication snapshots.
-- Preserve migration005, reviews, publication data and existing view grants.
CREATE OR REPLACE VIEW catalog_read.visible_product AS
 SELECT p.product_id AS id,p.source_version::text AS version,p.snapshot->'product'->>'category' AS category,
 p.snapshot->'product'->>'title' AS title,p.snapshot->'product'->>'brand' AS brand,
 p.snapshot->'product'->>'description' AS description,p.snapshot->'product'->>'form' AS form,
 p.snapshot->'product'->>'material' AS material,p.snapshot->'product'->>'origin' AS origin,
 p.snapshot->'product'->>'care' AS care,p.snapshot->'product'->'images' AS images,
 true AS b2c_eligible,false AS b2b_eligible,p.published_at AS updated_at
 FROM catalog_core.publication p JOIN catalog_core.product c ON c.id=p.product_id
 JOIN catalog_core.seller s ON s.id=c.seller_id
 WHERE p.visible AND c.lifecycle='APPROVED' AND c.version=p.source_version AND s.active
 AND NOT EXISTS(SELECT 1 FROM jsonb_array_elements_text(p.snapshot->'dictionaryIds') d(id)
   WHERE NOT EXISTS(SELECT 1 FROM catalog_core.dictionary cd WHERE cd.id::text=d.id AND cd.active))
 AND NOT EXISTS(SELECT 1 FROM jsonb_array_elements(p.snapshot->'skus') sk
   WHERE NOT EXISTS(SELECT 1 FROM catalog_core.sku cs WHERE cs.id::text=sk->>'id' AND cs.product_id=p.product_id AND cs.active))
 AND NOT EXISTS (
   SELECT 1 FROM catalog_core.size_chart chart
   JOIN catalog_core.dictionary measurement ON measurement.id=chart.measurement_id
   JOIN catalog_core.dictionary chart_size ON chart_size.id=chart.size_id
   WHERE chart.product_id=p.product_id AND (NOT measurement.active OR NOT chart_size.active)
 );
