-- Additive catalog-only publication. Legacy receipt rows retained, no longer served.
CREATE TABLE catalog_core.product_review (
 id uuid PRIMARY KEY, product_id uuid NOT NULL REFERENCES catalog_core.product(id) ON DELETE RESTRICT,
 product_version bigint NOT NULL CHECK(product_version>0), actor_id uuid NOT NULL REFERENCES catalog_core.principal(id),
 declaration text NOT NULL CHECK(char_length(btrim(declaration)) BETWEEN 1 AND 10000),
 snapshot jsonb NOT NULL CHECK(jsonb_typeof(snapshot)='object' AND octet_length(snapshot::text)<=200000),
 CHECK(snapshot ?& ARRAY['product','skus','chart','dictionaryIds','sourceRefs']),
 created_at timestamptz NOT NULL DEFAULT clock_timestamp(), UNIQUE(product_id,product_version), UNIQUE(id,product_id)
);
CREATE TABLE catalog_core.publication (
 product_id uuid PRIMARY KEY REFERENCES catalog_core.product(id) ON DELETE RESTRICT,
 review_id uuid NOT NULL, source_version bigint NOT NULL CHECK(source_version>0), visible boolean NOT NULL DEFAULT false,
 snapshot jsonb NOT NULL CHECK(jsonb_typeof(snapshot)='object' AND octet_length(snapshot::text)<=200000),
 CHECK(snapshot ?& ARRAY['product','skus','chart','dictionaryIds','sourceRefs']),
 published_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 FOREIGN KEY(review_id,product_id) REFERENCES catalog_core.product_review(id,product_id) ON DELETE RESTRICT,
 CHECK(snapshot->'product'->>'id'=product_id::text AND snapshot->'product'->>'version'=source_version::text),
 CHECK(jsonb_typeof(snapshot->'skus')='array' AND jsonb_array_length(snapshot->'skus') BETWEEN 1 AND 100),
 CHECK(jsonb_typeof(snapshot->'product'->'images')='array' AND jsonb_array_length(snapshot->'product'->'images') BETWEEN 1 AND 9)
);
CREATE INDEX publication_visible_page ON catalog_core.publication(published_at DESC,product_id DESC) WHERE visible;
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
   WHERE NOT EXISTS(SELECT 1 FROM catalog_core.sku cs WHERE cs.id::text=sk->>'id' AND cs.product_id=p.product_id AND cs.active));
CREATE OR REPLACE VIEW catalog_read.visible_sku AS
 SELECT (sk->>'id')::uuid AS id,p.product_id,(sk->>'code')::varchar(64) AS code,
 sk->>'color' AS color,sk->>'size' AS size,sk->>'price' AS price
 FROM catalog_core.publication p CROSS JOIN LATERAL jsonb_array_elements(p.snapshot->'skus') sk
 WHERE EXISTS(SELECT 1 FROM catalog_read.visible_product v WHERE v.id=p.product_id);
CREATE VIEW catalog_read.visible_media AS
 SELECT DISTINCT i->>'path' AS path FROM catalog_read.visible_product p
 CROSS JOIN LATERAL jsonb_array_elements(p.images) i;
CREATE VIEW catalog_read.visible_size_chart AS
 SELECT p.product_id,c->>'size' AS size,c->>'measurement' AS measurement,c->>'cm' AS cm
 FROM catalog_core.publication p CROSS JOIN LATERAL jsonb_array_elements(p.snapshot->'chart') c
 WHERE EXISTS(SELECT 1 FROM catalog_read.visible_product v WHERE v.id=p.product_id);
GRANT SELECT,INSERT ON catalog_core.product_review TO cootton_catalog_admin;
GRANT SELECT,INSERT ON catalog_core.publication TO cootton_catalog_admin;
GRANT UPDATE(review_id,source_version,visible,snapshot,published_at) ON catalog_core.publication TO cootton_catalog_admin;
GRANT SELECT ON catalog_read.visible_media,catalog_read.visible_size_chart TO cootton_catalog_reader;
-- No review/asset DELETE, global approval UPDATE, seller-mode activation or financial grants.
