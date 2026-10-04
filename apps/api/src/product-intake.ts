import { randomUUID } from 'node:crypto';
import type { PoolClient } from 'pg';
import { intakeFields, dictionaryFields } from '@cootton/contracts';
type DB = {
    query: PoolClient['query'];
};
export async function addDictionary(db: PoolClient, payload: unknown) {
    const d = dictionaryFields(payload);
    if (Number((await db.query('SELECT count(*) AS n FROM catalog_core.dictionary')).rows[0].n) >= 500)
        throw new TypeError('DICTIONARY_CAPACITY');
    const id = randomUUID();
    await db.query('INSERT INTO catalog_core.dictionary(id,kind,code,token,label,source) VALUES($1,$2,$3,$4,$5,$6)', [id, d.kind, d.code, d.token, d.label, d.source]);
    return { id, version: '1' };
}
export async function intakeDetail(db: DB, id: string) {
    const fabric = (await db.query('SELECT description,gsm_kind,gsm_min::text,gsm_max::text FROM catalog_core.fabric WHERE product_id=$1 ORDER BY id LIMIT 11', [id])).rows;
    const chart = (await db.query('SELECT size_id,measurement_id,value_cm::text FROM catalog_core.size_chart WHERE product_id=$1 ORDER BY size_id,measurement_id LIMIT 201', [id])).rows;
    const variants = (await db.query('SELECT s.id,s.code,s.color_id,s.size_id,p.on_hand_sellable::text AS stock,p.reserved::text FROM catalog_core.sku s LEFT JOIN catalog_core.stock_position p ON p.sku_id=s.id WHERE s.product_id=$1 ORDER BY s.code LIMIT 101', [id])).rows;
    const prices = (await db.query(`SELECT o.sku_id,o.mode,t.min_quantity::text,t.unit_price::text FROM catalog_core.pricing_offering o JOIN catalog_core.sku s ON s.id=o.sku_id JOIN LATERAL(SELECT id FROM catalog_core.pricing_price_version WHERE offering_id=o.id ORDER BY sequence DESC LIMIT 1) pv ON true JOIN catalog_core.pricing_tier t ON t.price_version_id=pv.id WHERE s.product_id=$1 ORDER BY o.sku_id,o.mode,t.min_quantity`, [id])).rows;
    for (const v of variants) {
        v.price = prices.find(p => p.sku_id === v.id && p.mode === 'B2C')?.unit_price ?? null;
        v.tiers = prices.filter(p => p.sku_id === v.id && p.mode === 'B2B').map(p => ({ quantity: p.min_quantity, price: p.unit_price }));
    }
    const location = (await db.query('SELECT l.label FROM catalog_core.inventory_location l JOIN catalog_core.product p ON p.seller_id=l.seller_id WHERE p.id=$1', [id])).rows[0]?.label ?? null;
    const media = (await db.query('SELECT a.id,a.width,a.height,a.approved,m.position,m.alt FROM catalog_core.product_media m JOIN catalog_core.asset a ON a.id=m.asset_id WHERE m.product_id=$1 ORDER BY m.position LIMIT 20', [id])).rows;
    const colorImages = (await db.query('SELECT c.color_id,c.asset_id,t.width,t.height FROM catalog_core.product_color_image c JOIN catalog_core.media_thumbnail t ON t.asset_id=c.asset_id WHERE c.product_id=$1 ORDER BY c.color_id', [id])).rows;
    const video = (await db.query('SELECT v.id,v.alt,v.width,v.height,v.duration_ms,v.byte_length,v.approved FROM catalog_core.product_video p JOIN catalog_core.video_asset v ON v.id=p.video_id WHERE p.product_id=$1', [id])).rows[0] ?? null;
    return { fabric: fabric[0] ?? null, chart, variants, location, media, colorImages, video };
}
export async function saveIntake(db: PoolClient, product: Record<string, unknown>, payload: unknown, actor: string) {
    const p = intakeFields(payload);
    const refs = [...p.variants.flatMap(v => [{ id: v.colorId, kind: 'COLOR' }, { id: v.sizeId, kind: 'SIZE' }]), ...p.chart.flatMap(v => [{ id: v.sizeId, kind: 'SIZE' }, { id: v.measurementId, kind: 'MEASUREMENT' }])];
    const dict = (await db.query('SELECT id,kind,token FROM catalog_core.dictionary WHERE active AND id=ANY($1::uuid[])', [refs.map(r => r.id)])).rows;
    for (const r of refs)
        if (!dict.some(d => d.id === r.id && d.kind === r.kind))
            throw new TypeError('INVALID_DICTIONARY');
    const existing = (await db.query('SELECT color_id,size_id FROM catalog_core.sku WHERE product_id=$1', [product.id])).rows;
    if (existing.some(e => !p.variants.some(v => v.colorId === e.color_id && v.sizeId === e.size_id)))
        throw new TypeError('EXISTING_SKU_REQUIRED');
    const source = randomUUID();
    await db.query('INSERT INTO catalog_core.evidence(id,seller_id,declaration,actor_id) VALUES($1,$2,$3,$4)', [source, product.seller_id, p.declaration, actor]);
    await db.query('DELETE FROM catalog_core.fabric WHERE product_id=$1', [product.id]);
    if (p.fabric)
        await db.query("INSERT INTO catalog_core.fabric(id,product_id,role,description,source_id,gsm_kind,gsm_min,gsm_max) VALUES($1,$2,'MAIN',$3,$4,$5,$6,$7)", [randomUUID(), product.id, p.fabric, source, p.gsmKind, p.gsmMin, p.gsmMax]);
    await db.query('DELETE FROM catalog_core.size_chart WHERE product_id=$1', [product.id]);
    if (p.chart.length)
        await db.query('INSERT INTO catalog_core.size_chart(product_id,size_id,measurement_id,value_cm,source_id) SELECT $1,x.size,x.measurement,x.cm,$2 FROM unnest($3::uuid[],$4::uuid[],$5::numeric[]) AS x(size,measurement,cm)', [product.id, source, p.chart.map(v => v.sizeId), p.chart.map(v => v.measurementId), p.chart.map(v => v.cm)]);
    const sellerToken = 'S' + String(product.seller_id).replaceAll('-', '').slice(0, 12).toUpperCase();
    if (p.variants.length)
        await db.query('INSERT INTO catalog_core.sku(id,product_id,seller_id,color_id,size_id,code) SELECT x.id,$1,$2,x.color,x.size,x.code FROM unnest($3::uuid[],$4::uuid[],$5::uuid[],$6::text[]) AS x(id,color,size,code) ON CONFLICT(product_id,color_id,size_id) DO NOTHING', [product.id, product.seller_id, p.variants.map(() => randomUUID()), p.variants.map(v => v.colorId), p.variants.map(v => v.sizeId), p.variants.map(v => [sellerToken, product.model_token, dict.find(d => d.id === v.colorId)!.token, dict.find(d => d.id === v.sizeId)!.token].join('-'))]);
    const skus = (await db.query('SELECT id,color_id,size_id FROM catalog_core.sku WHERE product_id=$1 ORDER BY id', [product.id])).rows;
    const skuFor = (v: {
        colorId: string;
        sizeId: string;
    }) => skus.find(s => s.color_id === v.colorId && s.size_id === v.sizeId)!.id;
    if (skus.length)
        await db.query("INSERT INTO catalog_core.pricing_offering(id,sku_id,mode) SELECT gen_random_uuid(),s.id,m.mode FROM unnest($1::uuid[]) AS s(id) CROSS JOIN (VALUES('B2C'),('B2B')) AS m(mode) ON CONFLICT(sku_id,mode) DO NOTHING", [skus.map(s => s.id)]);
    const offers = (await db.query('SELECT id,sku_id,mode FROM catalog_core.pricing_offering WHERE sku_id=ANY($1::uuid[]) ORDER BY id', [skus.map(s => s.id)])).rows;
    const priceIds = offers.map(() => randomUUID());
    if (offers.length)
        await db.query('INSERT INTO catalog_core.pricing_price_version(id,offering_id,sequence,source_id) SELECT x.id,x.offer,(SELECT COALESCE(max(sequence),0)+1 FROM catalog_core.pricing_price_version WHERE offering_id=x.offer),$1 FROM unnest($2::uuid[],$3::uuid[]) AS x(id,offer)', [source, priceIds, offers.map(o => o.id)]);
    const tiers: {
        id: string;
        quantity: string;
        price: string;
    }[] = [];
    offers.forEach((o, i) => {
        const v = p.variants.find(v => skuFor(v) === o.sku_id)!;
        const values = o.mode === 'B2C' ? (v.price === null ? [] : [{ quantity: '1', price: v.price }]) : v.tiers;
        for (const t of values)
            tiers.push({ id: priceIds[i]!, ...t });
    });
    if (tiers.length)
        await db.query('INSERT INTO catalog_core.pricing_tier(price_version_id,min_quantity,unit_price) SELECT * FROM unnest($1::uuid[],$2::integer[],$3::numeric[])', [tiers.map(t => t.id), tiers.map(t => t.quantity), tiers.map(t => t.price)]);
    const stocks = p.variants.filter(v => v.stock !== null);
    let location = (await db.query('SELECT id,label FROM catalog_core.inventory_location WHERE seller_id=$1', [product.seller_id])).rows[0];
    if (stocks.length && !location) {
        if (!p.location)
            throw new TypeError('LOCATION_REQUIRED');
        await db.query('INSERT INTO catalog_core.inventory_location(id,seller_id,label,source_id) VALUES($1,$2,$3,$4) ON CONFLICT(seller_id) DO NOTHING', [randomUUID(), product.seller_id, p.location, source]);
        location = (await db.query('SELECT id,label FROM catalog_core.inventory_location WHERE seller_id=$1', [product.seller_id])).rows[0];
    }
    if (location && p.location !== null && location.label !== p.location)
        throw new TypeError('LOCATION_IMMUTABLE');
    if (stocks.length) {
        const positions = (await db.query('SELECT id,sku_id,on_hand_sellable,reserved FROM catalog_core.stock_position WHERE sku_id=ANY($1::uuid[]) ORDER BY id FOR UPDATE', [stocks.map(skuFor)])).rows;
        const movements = stocks.map(v => {
            const pos = positions.find(s => s.sku_id === skuFor(v));
            if (pos && BigInt(v.stock!) < BigInt(pos.reserved))
                throw new TypeError('STOCK_BELOW_RESERVED');
            return { id: pos?.id ?? randomUUID(), sku: skuFor(v), before: pos?.on_hand_sellable ?? 0, after: v.stock! };
        });
        await db.query('INSERT INTO catalog_core.stock_position(id,sku_id,location_id,on_hand_sellable) SELECT x.id,x.sku,$1,x.quantity FROM unnest($2::uuid[],$3::uuid[],$4::integer[]) AS x(id,sku,quantity) ON CONFLICT(sku_id) DO UPDATE SET on_hand_sellable=EXCLUDED.on_hand_sellable,version=catalog_core.stock_position.version+1', [location.id, movements.map(m => m.id), movements.map(m => m.sku), movements.map(m => m.after)]);
        await db.query('INSERT INTO catalog_core.stock_movement(id,position_id,before_quantity,after_quantity,source_id,actor_id) SELECT gen_random_uuid(),x.id,x.before,x.after,$1,$2 FROM unnest($3::uuid[],$4::integer[],$5::integer[]) AS x(id,before,after)', [source, actor, movements.map(m => m.id), movements.map(m => m.before), movements.map(m => m.after)]);
    }
    await db.query('UPDATE catalog_core.product SET origin_evidence_id=$2,care_evidence_id=$2,version=version+1,updated_at=clock_timestamp() WHERE id=$1', [product.id, source]);
    return (await db.query('SELECT id,title,lifecycle,version::text FROM catalog_core.product WHERE id=$1', [product.id])).rows[0];
}
