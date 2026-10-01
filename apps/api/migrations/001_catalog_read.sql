-- D09 read projection, NOT a replacement for D01/D02 canonical write models.
-- No data, seller, prices, stock, approvals or dictionary values are seeded.
CREATE SCHEMA catalog_read;
REVOKE ALL ON SCHEMA catalog_read FROM PUBLIC;
CREATE TABLE catalog_read.schema_migration (
  version text PRIMARY KEY, digest char(64) NOT NULL, applied_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
CREATE TABLE catalog_read.public_product (
  id uuid PRIMARY KEY CHECK (id::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'),
  source_version bigint NOT NULL CHECK (source_version > 0),
  category text NOT NULL CHECK (category IN ('CREWNECK_TSHIRT','HOODIE','SWEATER','SHORTS','TROUSERS')),
  title text NOT NULL CHECK (char_length(btrim(title)) BETWEEN 1 AND 160),
  brand text NOT NULL CHECK (char_length(btrim(brand)) BETWEEN 1 AND 160),
  description text NOT NULL CHECK (char_length(btrim(description)) BETWEEN 1 AND 10000),
  form text CHECK (char_length(btrim(form)) BETWEEN 1 AND 160),
  material text NOT NULL CHECK (char_length(btrim(material)) BETWEEN 1 AND 1000),
  origin text NOT NULL CHECK (char_length(btrim(origin)) BETWEEN 1 AND 160),
  care text NOT NULL CHECK (char_length(btrim(care)) BETWEEN 1 AND 2000),
  images jsonb NOT NULL CHECK (jsonb_typeof(images)='array' AND jsonb_array_length(images) BETWEEN 1 AND 20 AND octet_length(images::text)<=30000),
  b2c_eligible boolean NOT NULL DEFAULT false, b2b_eligible boolean NOT NULL DEFAULT false,
  -- Canonical verifier receipt and expiry: no perpetual visibility after withdrawn source.
  verified_at timestamptz NOT NULL, valid_until timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,
  CHECK (valid_until > verified_at AND valid_until <= verified_at + interval '60 seconds'),
  CHECK (updated_at <= verified_at)
);
CREATE INDEX catalog_product_b2c_page ON catalog_read.public_product(updated_at DESC,id DESC) WHERE b2c_eligible;
CREATE INDEX catalog_product_b2b_page ON catalog_read.public_product(updated_at DESC,id DESC) WHERE b2b_eligible;
CREATE INDEX catalog_product_category_page ON catalog_read.public_product(category,updated_at DESC,id DESC);
CREATE TABLE catalog_read.public_sku (
  id uuid PRIMARY KEY CHECK (id::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'),
  product_id uuid NOT NULL REFERENCES catalog_read.public_product(id) ON DELETE RESTRICT,
  code varchar(64) NOT NULL UNIQUE CHECK (code ~ '^[A-Z0-9]{1,16}-[A-Z0-9]{1,16}-[A-Z0-9]{1,16}-[A-Z0-9]{1,16}$'),
  color_id uuid NOT NULL, size_id uuid NOT NULL,
  color text NOT NULL CHECK (char_length(btrim(color)) BETWEEN 1 AND 160),
  size text NOT NULL CHECK (char_length(btrim(size)) BETWEEN 1 AND 160),
  UNIQUE(product_id,color_id,size_id)
);
CREATE INDEX catalog_sku_page ON catalog_read.public_sku(product_id,id);
CREATE VIEW catalog_read.visible_product AS
 SELECT id,source_version::text AS version,category,title,brand,description,form,material,origin,care,images,
        b2c_eligible,b2b_eligible,updated_at FROM catalog_read.public_product
 WHERE valid_until > clock_timestamp() AND verified_at <= clock_timestamp()
   AND (b2c_eligible OR b2b_eligible)
   AND EXISTS(SELECT 1 FROM catalog_read.public_sku s WHERE s.product_id=public_product.id);
CREATE VIEW catalog_read.visible_sku AS
 SELECT s.id,s.product_id,s.code,s.color,s.size FROM catalog_read.public_sku s
 WHERE EXISTS(SELECT 1 FROM catalog_read.visible_product p WHERE p.id=s.product_id);
