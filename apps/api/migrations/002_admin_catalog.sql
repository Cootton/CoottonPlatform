-- Reviewed additive canonical catalog boundary; never modify migration001.
CREATE SCHEMA catalog_core;
CREATE TABLE catalog_core.principal (
 id uuid PRIMARY KEY, project text NOT NULL CHECK(project='cootton-firebase'), subject text NOT NULL CHECK(char_length(subject) BETWEEN 1 AND 128),
 active boolean NOT NULL DEFAULT false, singleton boolean NOT NULL DEFAULT true CHECK(singleton), UNIQUE(project,subject), UNIQUE(singleton)
);
CREATE TABLE catalog_core.seller (
 id uuid PRIMARY KEY, name text NOT NULL CHECK(char_length(btrim(name)) BETWEEN 1 AND 160),
 source text NOT NULL CHECK(char_length(btrim(source)) BETWEEN 1 AND 2000), active boolean NOT NULL DEFAULT false,
 b2c_enabled boolean NOT NULL DEFAULT false, b2b_enabled boolean NOT NULL DEFAULT false,
 version bigint NOT NULL DEFAULT 1 CHECK(version>0), singleton boolean NOT NULL DEFAULT true CHECK(singleton), UNIQUE(singleton)
);
CREATE TABLE catalog_core.dictionary (
 id uuid PRIMARY KEY, kind text NOT NULL CHECK(kind IN ('CATEGORY','BRAND','FORM','DESIGN','COLOR','SIZE','COUNTRY','MEASUREMENT')),
 code varchar(32) NOT NULL CHECK(code~'^[A-Z0-9_]{1,32}$'), token varchar(16) NOT NULL CHECK(token~'^[A-Z0-9]{1,16}$'),
 label text NOT NULL CHECK(char_length(btrim(label)) BETWEEN 1 AND 160),
 source text NOT NULL CHECK(char_length(btrim(source)) BETWEEN 1 AND 2000),
 active boolean NOT NULL DEFAULT true, version bigint NOT NULL DEFAULT 1 CHECK(version>0),
 UNIQUE(kind,code), UNIQUE(kind,token), UNIQUE(id,kind)
);
CREATE TABLE catalog_core.evidence (
 id uuid PRIMARY KEY, seller_id uuid NOT NULL REFERENCES catalog_core.seller(id) ON DELETE RESTRICT,
 declaration text NOT NULL CHECK(char_length(btrim(declaration)) BETWEEN 1 AND 10000),
 actor_id uuid NOT NULL REFERENCES catalog_core.principal(id) ON DELETE RESTRICT, created_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
CREATE TABLE catalog_core.asset (
 id uuid PRIMARY KEY, seller_id uuid NOT NULL REFERENCES catalog_core.seller(id) ON DELETE RESTRICT,
 path text NOT NULL UNIQUE CHECK(path~'^/media/[0-9a-f-]{36}/[0-9a-f]{64}\.webp$'),
 sha256 char(64) NOT NULL CHECK(sha256~'^[0-9a-f]{64}$'), width integer NOT NULL CHECK(width BETWEEN 1 AND 8192), height integer NOT NULL CHECK(height BETWEEN 1 AND 8192),
 rights_evidence_id uuid NOT NULL REFERENCES catalog_core.evidence(id) ON DELETE RESTRICT,
 approved boolean NOT NULL DEFAULT false, created_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
CREATE TABLE catalog_core.product (
 id uuid PRIMARY KEY, seller_id uuid NOT NULL REFERENCES catalog_core.seller(id) ON DELETE RESTRICT,
 model_token varchar(16) NOT NULL CHECK(model_token~'^[A-Z0-9]{1,16}$'), title text NOT NULL DEFAULT '' CHECK(char_length(title)<=160),
 description text NOT NULL DEFAULT '' CHECK(char_length(description)<=10000), care text NOT NULL DEFAULT '' CHECK(char_length(care)<=2000),
 category_id uuid, category_kind text NOT NULL DEFAULT 'CATEGORY' CHECK(category_kind='CATEGORY'),
 brand_id uuid, brand_kind text NOT NULL DEFAULT 'BRAND' CHECK(brand_kind='BRAND'),
 form_id uuid, form_kind text NOT NULL DEFAULT 'FORM' CHECK(form_kind='FORM'),
 country_id uuid, country_kind text NOT NULL DEFAULT 'COUNTRY' CHECK(country_kind='COUNTRY'),
 origin_evidence_id uuid REFERENCES catalog_core.evidence(id) ON DELETE RESTRICT,
 care_evidence_id uuid REFERENCES catalog_core.evidence(id) ON DELETE RESTRICT,
 lifecycle text NOT NULL DEFAULT 'DRAFT' CHECK(lifecycle IN ('DRAFT','IN_REVIEW','APPROVED','ARCHIVED')),
 version bigint NOT NULL DEFAULT 1 CHECK(version>0), created_at timestamptz NOT NULL DEFAULT clock_timestamp(), updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 UNIQUE(seller_id,model_token), UNIQUE(id,seller_id),
 FOREIGN KEY(category_id,category_kind) REFERENCES catalog_core.dictionary(id,kind) ON DELETE RESTRICT,
 FOREIGN KEY(brand_id,brand_kind) REFERENCES catalog_core.dictionary(id,kind) ON DELETE RESTRICT,
 FOREIGN KEY(form_id,form_kind) REFERENCES catalog_core.dictionary(id,kind) ON DELETE RESTRICT,
 FOREIGN KEY(country_id,country_kind) REFERENCES catalog_core.dictionary(id,kind) ON DELETE RESTRICT
);
CREATE TABLE catalog_core.fabric (
 id uuid PRIMARY KEY, product_id uuid NOT NULL REFERENCES catalog_core.product(id) ON DELETE RESTRICT,
 role text NOT NULL CHECK(role IN ('MAIN','LINING','TRIM')), description text NOT NULL CHECK(char_length(btrim(description)) BETWEEN 1 AND 1000),
 source_id uuid NOT NULL REFERENCES catalog_core.evidence(id) ON DELETE RESTRICT,
 gsm_kind text NOT NULL CHECK(gsm_kind IN ('UNKNOWN','EXACT','RANGE')), gsm_min numeric(8,2), gsm_max numeric(8,2),
 CHECK((gsm_kind='UNKNOWN' AND gsm_min IS NULL AND gsm_max IS NULL) OR (gsm_kind='EXACT' AND gsm_min>0 AND gsm_min=gsm_max) OR (gsm_kind='RANGE' AND gsm_min>0 AND gsm_max>=gsm_min))
);
CREATE TABLE catalog_core.size_chart (
 product_id uuid NOT NULL REFERENCES catalog_core.product(id) ON DELETE RESTRICT,
 size_id uuid NOT NULL, size_kind text NOT NULL DEFAULT 'SIZE' CHECK(size_kind='SIZE'),
 measurement_id uuid NOT NULL, measurement_kind text NOT NULL DEFAULT 'MEASUREMENT' CHECK(measurement_kind='MEASUREMENT'),
 value_cm numeric(8,2) NOT NULL CHECK(value_cm>0), source_id uuid NOT NULL REFERENCES catalog_core.evidence(id) ON DELETE RESTRICT,
 PRIMARY KEY(product_id,size_id,measurement_id),
 FOREIGN KEY(size_id,size_kind) REFERENCES catalog_core.dictionary(id,kind) ON DELETE RESTRICT,
 FOREIGN KEY(measurement_id,measurement_kind) REFERENCES catalog_core.dictionary(id,kind) ON DELETE RESTRICT
);
CREATE TABLE catalog_core.product_media (
 product_id uuid NOT NULL REFERENCES catalog_core.product(id) ON DELETE RESTRICT,
 asset_id uuid NOT NULL REFERENCES catalog_core.asset(id) ON DELETE RESTRICT,
 position smallint NOT NULL CHECK(position BETWEEN 1 AND 20), alt text NOT NULL CHECK(char_length(btrim(alt)) BETWEEN 1 AND 300),
 PRIMARY KEY(product_id,position), UNIQUE(product_id,asset_id)
);
CREATE TABLE catalog_core.sku (
 id uuid PRIMARY KEY, product_id uuid NOT NULL, seller_id uuid NOT NULL,
 color_id uuid NOT NULL, color_kind text NOT NULL DEFAULT 'COLOR' CHECK(color_kind='COLOR'), size_id uuid NOT NULL, size_kind text NOT NULL DEFAULT 'SIZE' CHECK(size_kind='SIZE'),
 code varchar(64) NOT NULL UNIQUE CHECK(code~'^[A-Z0-9]{1,16}-[A-Z0-9]{1,16}-[A-Z0-9]{1,16}-[A-Z0-9]{1,16}$'),
 active boolean NOT NULL DEFAULT true, version bigint NOT NULL DEFAULT 1 CHECK(version>0), UNIQUE(product_id,color_id,size_id),
 FOREIGN KEY(product_id,seller_id) REFERENCES catalog_core.product(id,seller_id) ON DELETE RESTRICT,
 FOREIGN KEY(color_id,color_kind) REFERENCES catalog_core.dictionary(id,kind) ON DELETE RESTRICT,
 FOREIGN KEY(size_id,size_kind) REFERENCES catalog_core.dictionary(id,kind) ON DELETE RESTRICT
);
CREATE INDEX product_admin_page ON catalog_core.product(updated_at DESC,id DESC);
CREATE INDEX sku_product_page ON catalog_core.sku(product_id,id);
CREATE TABLE catalog_core.audit (
 id uuid PRIMARY KEY, actor_id uuid NOT NULL REFERENCES catalog_core.principal(id) ON DELETE RESTRICT,
 action text NOT NULL, resource_id uuid NOT NULL, version bigint NOT NULL, created_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
CREATE TABLE catalog_core.command (
 actor_id uuid NOT NULL REFERENCES catalog_core.principal(id) ON DELETE RESTRICT, operation text NOT NULL, key uuid NOT NULL,
 fingerprint char(64) NOT NULL, result jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT clock_timestamp(), PRIMARY KEY(actor_id,operation,key)
);
CREATE TABLE catalog_core.outbox (
 id uuid PRIMARY KEY, resource_id uuid NOT NULL, version bigint NOT NULL, action text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT clock_timestamp(), projected_at timestamptz
);
-- No owner, seller, dictionary, product, grant or image is seeded here.
-- Publication remains receipt-gated until canonical publisher/asset/D02 readiness is implemented.
