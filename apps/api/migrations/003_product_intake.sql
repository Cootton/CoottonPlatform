-- Additive intake; existing publication/commerce gates remain unchanged.
CREATE TABLE catalog_core.form_category(form_id uuid NOT NULL REFERENCES catalog_core.dictionary(id),category_id uuid NOT NULL REFERENCES catalog_core.dictionary(id),PRIMARY KEY(form_id,category_id));
CREATE TABLE catalog_core.pricing_offering(id uuid PRIMARY KEY,sku_id uuid NOT NULL REFERENCES catalog_core.sku(id),mode text NOT NULL CHECK(mode IN ('B2C','B2B')),enabled boolean NOT NULL DEFAULT false CHECK(NOT enabled),UNIQUE(sku_id,mode));
CREATE TABLE catalog_core.pricing_price_version(id uuid PRIMARY KEY,offering_id uuid NOT NULL REFERENCES catalog_core.pricing_offering(id),sequence bigint NOT NULL CHECK(sequence>0),lifecycle text NOT NULL DEFAULT 'DRAFT' CHECK(lifecycle='DRAFT'),source_id uuid NOT NULL REFERENCES catalog_core.evidence(id),created_at timestamptz NOT NULL DEFAULT clock_timestamp(),UNIQUE(offering_id,sequence));
CREATE TABLE catalog_core.pricing_tier(price_version_id uuid NOT NULL REFERENCES catalog_core.pricing_price_version(id),min_quantity integer NOT NULL CHECK(min_quantity>0),unit_price numeric(30,0) NOT NULL CHECK(unit_price>0),PRIMARY KEY(price_version_id,min_quantity));
CREATE TABLE catalog_core.inventory_location(id uuid PRIMARY KEY,seller_id uuid NOT NULL UNIQUE REFERENCES catalog_core.seller(id),label text NOT NULL CHECK(char_length(btrim(label)) BETWEEN 1 AND 160),source_id uuid NOT NULL REFERENCES catalog_core.evidence(id));
CREATE TABLE catalog_core.stock_position(id uuid PRIMARY KEY,sku_id uuid NOT NULL UNIQUE REFERENCES catalog_core.sku(id),location_id uuid NOT NULL REFERENCES catalog_core.inventory_location(id),on_hand_sellable integer NOT NULL CHECK(on_hand_sellable>=0),reserved integer NOT NULL DEFAULT 0 CHECK(reserved>=0 AND reserved<=on_hand_sellable),version bigint NOT NULL DEFAULT 1 CHECK(version>0));
CREATE TABLE catalog_core.stock_movement(id uuid PRIMARY KEY,position_id uuid NOT NULL REFERENCES catalog_core.stock_position(id),before_quantity integer NOT NULL CHECK(before_quantity>=0),after_quantity integer NOT NULL CHECK(after_quantity>=0),source_id uuid NOT NULL REFERENCES catalog_core.evidence(id),actor_id uuid NOT NULL REFERENCES catalog_core.principal(id),created_at timestamptz NOT NULL DEFAULT clock_timestamp());
-- Definitions, not real product facts. Do not replace any pre-existing value.
INSERT INTO catalog_core.dictionary(id,kind,code,token,label,source) VALUES
(gen_random_uuid(),'CATEGORY','CREWNECK_TSHIRT','TEE','Áo thun cổ tròn','Owner-approved D01 initial category'),
(gen_random_uuid(),'CATEGORY','HOODIE','HOODIE','Hoodie','Owner-approved D01 initial category'),
(gen_random_uuid(),'CATEGORY','SWEATER','SWEATER','Sweater','Owner-approved D01 initial category'),
(gen_random_uuid(),'CATEGORY','SHORTS','SHORTS','Quần short','Owner-approved D01 initial category'),
(gen_random_uuid(),'CATEGORY','TROUSERS','PANTS','Quần dài','Owner-approved D01 initial category'),
(gen_random_uuid(),'BRAND','COOTTON','COOTTON','Cootton','Owner-declared brand; select only for actual Cootton product'),
(gen_random_uuid(),'FORM','BOXY','BOXY','Boxy','D01 approved roomy box-shaped cut'),
(gen_random_uuid(),'FORM','REGULAR','REGULAR','Regular','D01 approved standard cut'),
(gen_random_uuid(),'FORM','SLIM_FIT','SLIM','Slim Fit','D01 approved closer cut') ON CONFLICT(kind,code) DO NOTHING;
INSERT INTO catalog_core.form_category(form_id,category_id) SELECT f.id,c.id FROM catalog_core.dictionary f CROSS JOIN catalog_core.dictionary c WHERE f.kind='FORM' AND f.code IN ('BOXY','REGULAR','SLIM_FIT') AND c.kind='CATEGORY' AND c.code IN ('CREWNECK_TSHIRT','HOODIE','SWEATER') ON CONFLICT DO NOTHING;
GRANT SELECT ON catalog_core.form_category,catalog_core.fabric,catalog_core.size_chart,catalog_core.sku,catalog_core.asset,catalog_core.product_media,catalog_core.pricing_offering,catalog_core.pricing_price_version,catalog_core.pricing_tier,catalog_core.inventory_location,catalog_core.stock_position TO cootton_catalog_admin;
GRANT INSERT ON catalog_core.dictionary,catalog_core.evidence,catalog_core.fabric,catalog_core.size_chart,catalog_core.sku,catalog_core.asset,catalog_core.product_media,catalog_core.pricing_offering,catalog_core.pricing_price_version,catalog_core.pricing_tier,catalog_core.inventory_location,catalog_core.stock_position,catalog_core.stock_movement TO cootton_catalog_admin;
-- Replacing draft child content does not delete evidence, SKUs, prices or stock history.
GRANT DELETE ON catalog_core.fabric,catalog_core.size_chart TO cootton_catalog_admin;
GRANT UPDATE(on_hand_sellable,version) ON catalog_core.stock_position TO cootton_catalog_admin;
GRANT UPDATE(origin_evidence_id,care_evidence_id) ON catalog_core.product TO cootton_catalog_admin;
INSERT INTO catalog_core.dictionary(id,kind,code,token,label,source) VALUES
(gen_random_uuid(),'SIZE','XS','XS','XS','Controlled size label only; never implies measurements'),
(gen_random_uuid(),'SIZE','S','S','S','Controlled size label only; never implies measurements'),
(gen_random_uuid(),'SIZE','M','M','M','Controlled size label only; never implies measurements'),
(gen_random_uuid(),'SIZE','L','L','L','Controlled size label only; never implies measurements'),
(gen_random_uuid(),'SIZE','XL','XL','XL','Controlled size label only; never implies measurements'),
(gen_random_uuid(),'SIZE','XXL','XXL','XXL','Controlled size label only; never implies measurements'),
(gen_random_uuid(),'COLOR','BLACK','BLK','Đen','Controlled color name; product declaration must establish actual color'),
(gen_random_uuid(),'COLOR','WHITE','WHT','Trắng','Controlled color name; product declaration must establish actual color'),
(gen_random_uuid(),'COLOR','GREY','GRY','Xám','Controlled color name; product declaration must establish actual color'),
(gen_random_uuid(),'COLOR','NAVY','NVY','Xanh navy','Controlled color name; product declaration must establish actual color'),
(gen_random_uuid(),'COUNTRY','VN','VN','Việt Nam','ISO 3166-1 alpha-2 VN; selection requires actual manufacturing declaration'),
(gen_random_uuid(),'MEASUREMENT','CHEST_FLAT','CHEST','Ngang ngực áo','Cootton measurement definition: garment laid flat, straight width at underarm, cm, not body circumference'),
(gen_random_uuid(),'MEASUREMENT','BODY_LENGTH','LENGTH','Dài áo','Cootton measurement definition: highest shoulder point to bottom hem, garment laid flat, cm') ON CONFLICT(kind,code) DO NOTHING;
CREATE INDEX stock_movement_position ON catalog_core.stock_movement(position_id,created_at,id);
CREATE INDEX price_version_latest ON catalog_core.pricing_price_version(offering_id,sequence DESC);
