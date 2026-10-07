-- Additive media extension. Preserve all source/evidence and immutable assets.
-- Abort rather than purge existing galleries exceeding the owner limit.
ALTER TABLE catalog_core.product_media DROP CONSTRAINT product_media_position_check;
ALTER TABLE catalog_core.product_media ADD CONSTRAINT product_media_position_check CHECK(position BETWEEN 1 AND 9);
CREATE TABLE catalog_core.media_thumbnail (
 asset_id uuid PRIMARY KEY REFERENCES catalog_core.asset(id) ON DELETE RESTRICT,
 path text NOT NULL UNIQUE CHECK(path~'^/thumbnails/[0-9a-f-]{36}/[0-9a-f]{64}\.webp$'),
 sha256 char(64) NOT NULL CHECK(sha256~'^[0-9a-f]{64}$'),
 width integer NOT NULL CHECK(width BETWEEN 1 AND 240), height integer NOT NULL CHECK(height BETWEEN 1 AND 240)
);
CREATE TABLE catalog_core.product_color_image (
 product_id uuid NOT NULL, color_id uuid NOT NULL, color_kind text NOT NULL DEFAULT 'COLOR' CHECK(color_kind='COLOR'),
 asset_id uuid NOT NULL REFERENCES catalog_core.media_thumbnail(asset_id) ON DELETE RESTRICT,
 source_id uuid NOT NULL REFERENCES catalog_core.evidence(id) ON DELETE RESTRICT,
 PRIMARY KEY(product_id,color_id),
 FOREIGN KEY(product_id,asset_id) REFERENCES catalog_core.product_media(product_id,asset_id) ON DELETE RESTRICT,
 FOREIGN KEY(color_id,color_kind) REFERENCES catalog_core.dictionary(id,kind) ON DELETE RESTRICT
);
CREATE TABLE catalog_core.video_asset (
 id uuid PRIMARY KEY, seller_id uuid NOT NULL REFERENCES catalog_core.seller(id) ON DELETE RESTRICT,
 path text NOT NULL UNIQUE CHECK(path~'^/videos/[0-9a-f-]{36}/[0-9a-f]{64}\.mp4$'),
 sha256 char(64) NOT NULL CHECK(sha256~'^[0-9a-f]{64}$'),
 poster_path text NOT NULL CHECK(poster_path~'^/posters/[0-9a-f-]{36}/[0-9a-f]{64}\.webp$'),
 width integer NOT NULL CHECK(width BETWEEN 1 AND 720), height integer NOT NULL CHECK(height BETWEEN 1 AND 720),
 duration_ms integer NOT NULL CHECK(duration_ms BETWEEN 1 AND 60000), byte_length integer NOT NULL CHECK(byte_length BETWEEN 1 AND 8388608),
 alt text NOT NULL CHECK(char_length(btrim(alt)) BETWEEN 1 AND 300),
 rights_evidence_id uuid NOT NULL REFERENCES catalog_core.evidence(id) ON DELETE RESTRICT,
 approved boolean NOT NULL DEFAULT false, created_at timestamptz NOT NULL DEFAULT clock_timestamp(), UNIQUE(id,seller_id)
);
CREATE TABLE catalog_core.product_video (
 product_id uuid PRIMARY KEY, seller_id uuid NOT NULL, video_id uuid NOT NULL UNIQUE,
 FOREIGN KEY(product_id,seller_id) REFERENCES catalog_core.product(id,seller_id) ON DELETE RESTRICT,
 FOREIGN KEY(video_id,seller_id) REFERENCES catalog_core.video_asset(id,seller_id) ON DELETE RESTRICT
);
GRANT SELECT ON catalog_core.media_thumbnail,catalog_core.product_color_image,catalog_core.video_asset,catalog_core.product_video TO cootton_catalog_admin;
GRANT INSERT ON catalog_core.media_thumbnail,catalog_core.product_color_image,catalog_core.product_video TO cootton_catalog_admin;
GRANT INSERT(id,seller_id,path,sha256,poster_path,width,height,duration_ms,byte_length,alt,rights_evidence_id) ON catalog_core.video_asset TO cootton_catalog_admin;
GRANT UPDATE(asset_id,source_id) ON catalog_core.product_color_image TO cootton_catalog_admin;
-- Runtime cannot approve assets, delete history or change video metadata.
