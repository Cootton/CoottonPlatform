import { ConflictException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { PoolClient } from 'pg';
import { inputObject, inputText, publicProduct } from '@cootton/contracts';

type DB = { query: PoolClient['query'] };
export type PublicationFacts = {
  product: Record<string, any>; dictionary: Record<string, any>[]; fabric: Record<string, any>[];
  skus: Record<string, any>[]; chart: Record<string, any>[]; images: Record<string, any>[];
  colors: Record<string, any>[]; video: Record<string, any> | null; sellerActive: boolean;
};
export function publicationIssues(f: PublicationFacts): string[] {
  const issues: string[] = [], p = f.product;
  const has = (id: unknown, kind: string) => f.dictionary.some(d => d.id === id && d.kind === kind && d.active);
  if (!p.title?.trim() || !p.description?.trim()) issues.push('Thiếu tên hoặc mô tả sản phẩm.');
  if (!p.care?.trim() || !p.care_evidence_id) issues.push('Thiếu hướng dẫn chăm sóc và nguồn xác nhận.');
  if (!p.origin_evidence_id || !has(p.country_id,'COUNTRY')) issues.push('Thiếu xuất xứ có nguồn.');
  if (!has(p.category_id,'CATEGORY') || !has(p.brand_id,'BRAND') || !has(p.form_id,'FORM') || !p.form_applicable) issues.push('Danh mục, thương hiệu hoặc form chưa hợp lệ.');
  if (!f.dictionary.some(d=>d.id===p.category_id && d.code==='CREWNECK_TSHIRT')) issues.push('Đợt xuất bản này chỉ hỗ trợ áo thun cổ tròn.');
  if (!f.sellerActive) issues.push('Seller Cootton chưa hoạt động.');
  if (f.fabric.length!==1 || !f.fabric[0]?.description?.trim() || !f.fabric[0]?.source_id) issues.push('Thiếu chất liệu chính có nguồn.');
  if (!f.skus.length || f.skus.length>100) issues.push('Cần từ 1 đến 100 SKU đang hoạt động.');
  for (const s of f.skus) {
    if (!has(s.color_id,'COLOR') || !has(s.size_id,'SIZE')) issues.push('Màu hoặc size chưa hợp lệ.');
    if (!s.price_source || typeof s.price!=='string' || !/^[1-9][0-9]{0,29}$/.test(s.price) || s.retail_tiers!==1 || s.min_quantity!==1) issues.push('Mỗi SKU cần một giá bán lẻ có nguồn, bắt đầu từ 1 chiếc.');
    if (!f.colors.some(c=>c.color_id===s.color_id && f.images.some(i=>i.id===c.asset_id) && c.source_id)) issues.push('Thiếu ảnh đúng màu cho SKU.');
    for (const code of ['BODY_LENGTH','CHEST_FLAT']) if (!f.chart.some(c=>c.size_id===s.size_id && c.code===code && c.active && c.source_id)) issues.push('Mỗi size cần số đo dài áo và ngang ngực có nguồn.');
  }
  if (!f.images.length || f.images.length>9 || f.images.some(i=>!i.rights_evidence_id || i.seller_id!==p.seller_id)) issues.push('Cần 1–9 ảnh đã xử lý, thuộc seller và có khai báo quyền sử dụng.');
  if (f.video && (!f.video.rights_evidence_id || f.video.seller_id!==p.seller_id)) issues.push('Video thiếu khai báo quyền sử dụng.');
  return [...new Set(issues)];
}
export async function publicationFacts(db: DB, product: Record<string, any>): Promise<PublicationFacts> {
  const id=product.id;
  const dictionary=(await db.query('SELECT id,kind,code,label,active FROM catalog_core.dictionary ORDER BY kind,code LIMIT 501')).rows;
  const fabric=(await db.query("SELECT description,source_id,gsm_kind,gsm_min::text,gsm_max::text FROM catalog_core.fabric WHERE product_id=$1 AND role='MAIN' LIMIT 11",[id])).rows;
  const skus=(await db.query(`SELECT s.id,s.code,s.color_id,s.size_id,c.label AS color,z.label AS size,
    pv.source_id AS price_source,t.unit_price::text AS price,t.min_quantity,
    (SELECT count(*)::integer FROM catalog_core.pricing_tier WHERE price_version_id=pv.id) AS retail_tiers
    FROM catalog_core.sku s JOIN catalog_core.dictionary c ON c.id=s.color_id JOIN catalog_core.dictionary z ON z.id=s.size_id
    LEFT JOIN catalog_core.pricing_offering o ON o.sku_id=s.id AND o.mode='B2C'
    LEFT JOIN LATERAL(SELECT id,source_id FROM catalog_core.pricing_price_version WHERE offering_id=o.id ORDER BY sequence DESC LIMIT 1) pv ON true
    LEFT JOIN catalog_core.pricing_tier t ON t.price_version_id=pv.id AND t.min_quantity=1
    WHERE s.product_id=$1 AND s.active ORDER BY s.id LIMIT 101`,[id])).rows;
  const chart=(await db.query('SELECT c.size_id,c.value_cm::text,c.source_id,d.code,d.label,d.active FROM catalog_core.size_chart c JOIN catalog_core.dictionary d ON d.id=c.measurement_id WHERE c.product_id=$1 ORDER BY c.size_id,d.code LIMIT 201',[id])).rows;
  const images=(await db.query('SELECT a.id,a.path,a.width,a.height,a.rights_evidence_id,a.seller_id,m.alt,m.position FROM catalog_core.product_media m JOIN catalog_core.asset a ON a.id=m.asset_id WHERE m.product_id=$1 ORDER BY m.position LIMIT 10',[id])).rows;
  const colors=(await db.query('SELECT color_id,asset_id,source_id FROM catalog_core.product_color_image WHERE product_id=$1',[id])).rows;
  const video=(await db.query('SELECT v.id,v.rights_evidence_id,v.seller_id FROM catalog_core.product_video p JOIN catalog_core.video_asset v ON v.id=p.video_id WHERE p.product_id=$1',[id])).rows[0]??null;
  const sellerActive=Boolean((await db.query('SELECT active FROM catalog_core.seller WHERE id=$1',[product.seller_id])).rows[0]?.active);
  const form_applicable=Boolean((await db.query('SELECT 1 FROM catalog_core.form_category WHERE category_id=$1 AND form_id=$2',[product.category_id,product.form_id])).rowCount);
  return {product:{...product,form_applicable},dictionary,fabric,skus,chart,images,colors,video,sellerActive};
}
export function publicSnapshot(f: PublicationFacts, version: string) {
  const label=(id:unknown)=>f.dictionary.find(d=>d.id===id)?.label;
  const p=f.product;
  const product=publicProduct({id:p.id,version,category:f.dictionary.find(d=>d.id===p.category_id)?.code,title:p.title,brand:label(p.brand_id),description:p.description,form:label(p.form_id),material:f.fabric[0]?.description,origin:label(p.country_id),care:p.care,images:f.images.map(i=>({path:i.path,alt:i.alt,width:i.width,height:i.height}))});
  return {product,skus:f.skus.map(s=>({id:s.id,code:s.code,color:s.color,size:s.size,price:s.price})),chart:f.chart.map(c=>({size:label(c.size_id),measurement:c.label,cm:c.value_cm})),dictionaryIds:[p.category_id,p.brand_id,p.form_id,p.country_id,...f.skus.flatMap(s=>[s.color_id,s.size_id])],sourceRefs:[p.origin_evidence_id,p.care_evidence_id,...f.fabric.map(v=>v.source_id),...f.skus.map(v=>v.price_source),...f.chart.map(v=>v.source_id),...f.images.map(v=>v.rights_evidence_id),...f.colors.map(v=>v.source_id),f.video?.rights_evidence_id??null]};
}
const actions=['submit','approve','publish','returnDraft','unpublish'];
export function isPublicationAction(action:string) { return actions.includes(action); }
export async function publicationCommand(db: PoolClient, product: Record<string,any>, action:string, payload:unknown, actor:string) {
  if (process.env.COOTTON_PUBLICATION_ENABLED!=='true') throw new ConflictException('PUBLICATION_DISABLED');
  let declaration='';
  if (action==='approve') {const o=inputObject(payload,['declaration','confirmed']);if(o.confirmed!==true)throw new TypeError('CONFIRMATION_REQUIRED');declaration=inputText(o.declaration,10000);}
  else if (['returnDraft','unpublish'].includes(action)) declaration=inputText(inputObject(payload,['reason']).reason,2000);
  else inputObject(payload,[]);
  const id=product.id,nextVersion=(BigInt(product.version)+1n).toString();
  if (action==='returnDraft' || action==='unpublish') {
    if (product.lifecycle==='ARCHIVED' || product.lifecycle==='DRAFT') throw new ConflictException('INVALID_TRANSITION');
    if(action==='unpublish' && !(await db.query('SELECT 1 FROM catalog_core.publication WHERE product_id=$1 AND visible',[id])).rowCount) throw new ConflictException('NOT_PUBLISHED');
    await db.query('UPDATE catalog_core.publication SET visible=false WHERE product_id=$1',[id]);
    await db.query('INSERT INTO catalog_core.evidence(id,seller_id,declaration,actor_id) VALUES($1,$2,$3,$4)',[randomUUID(),product.seller_id,declaration,actor]);
    await db.query("UPDATE catalog_core.product SET lifecycle='DRAFT',version=version+1,updated_at=clock_timestamp() WHERE id=$1",[id]);
  } else {
    const expected=action==='submit'?'DRAFT':action==='approve'?'IN_REVIEW':'APPROVED';
    if(product.lifecycle!==expected)throw new ConflictException('INVALID_TRANSITION');
    const facts=await publicationFacts(db,product);
    if(publicationIssues(facts).length)throw new ConflictException('PUBLICATION_INCOMPLETE');
    if(action==='publish') {
      if((await db.query('SELECT 1 FROM catalog_core.publication WHERE product_id=$1 AND visible',[id])).rowCount)throw new ConflictException('ALREADY_PUBLISHED');
      const review=(await db.query('SELECT id,snapshot FROM catalog_core.product_review WHERE product_id=$1 AND product_version=$2',[id,product.version])).rows[0];
      if(!review || !(await db.query('SELECT 1 FROM catalog_core.product_review WHERE id=$1 AND snapshot=$2::jsonb',[review.id,JSON.stringify(publicSnapshot(facts,String(product.version)))])).rowCount)throw new ConflictException('REVIEW_CHANGED');
      await db.query(`INSERT INTO catalog_core.publication(product_id,review_id,source_version,visible,snapshot,published_at)
        VALUES($1,$2,$3,true,$4,clock_timestamp()) ON CONFLICT(product_id) DO UPDATE SET review_id=EXCLUDED.review_id,source_version=EXCLUDED.source_version,visible=true,snapshot=EXCLUDED.snapshot,published_at=EXCLUDED.published_at`,[id,review.id,nextVersion,JSON.stringify(publicSnapshot(facts,nextVersion))]);
    } else if(action==='approve') {
      await db.query('INSERT INTO catalog_core.product_review(id,product_id,product_version,actor_id,declaration,snapshot) VALUES($1,$2,$3,$4,$5,$6)',[randomUUID(),id,nextVersion,actor,declaration,JSON.stringify(publicSnapshot(facts,nextVersion))]);
    }
    await db.query('UPDATE catalog_core.product SET lifecycle=$2,version=version+1,updated_at=clock_timestamp() WHERE id=$1',[id,action==='submit'?'IN_REVIEW':'APPROVED']);
  }
  return (await db.query('SELECT id,title,lifecycle,version::text,updated_at FROM catalog_core.product WHERE id=$1',[id])).rows[0];
}
