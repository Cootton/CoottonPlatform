import { createHash } from 'node:crypto';
import { catalogSearch, normalizeSearch, parseEntityId, type CatalogSearch } from '@cootton/contracts';

interface SearchCursor {v:1;key:string;rank:number;at:string;id:string}
export function searchKey(input: CatalogSearch): string {
  return createHash('sha256').update(JSON.stringify([input.mode,input.category,input.limit,...[input.q,input.brand,input.form,input.color,input.size].map(normalizeSearch)])).digest('hex');
}
function cursor(input: CatalogSearch): SearchCursor | null {
  if (!input.cursor) return null;
  const value = JSON.parse(Buffer.from(input.cursor,'base64url').toString('utf8')) as SearchCursor;
  if (Object.keys(value).sort().join(',') !== 'at,id,key,rank,v' || value.v !== 1 || value.key !== searchKey(input) ||
    !Number.isInteger(value.rank) || value.rank < 0 || value.rank > 100 || typeof value.at !== 'string' ||
    !/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{6}Z$/.test(value.at)) throw new TypeError('INVALID_CURSOR');
  if (new Date(value.at).toISOString().slice(0,23) !== value.at.slice(0,23)) throw new TypeError('INVALID_CURSOR');
  return {...value,id:parseEntityId(value.id)};
}
export function searchCursor(input:CatalogSearch,row:{search_rank:number;cursor_at:string;id:unknown}):string {
  return Buffer.from(JSON.stringify({v:1,key:searchKey(input),rank:row.search_rank,at:row.cursor_at,id:parseEntityId(row.id)})).toString('base64url');
}
// PostgreSQL16 UTF8 NFD matches the shared Vietnamese normalization. No extension or DDL.
function normalized(expression:string):string {
  return `btrim(regexp_replace(replace(lower(regexp_replace(normalize(coalesce(${expression},''), NFD),'[̀-ͯ]','','g')),'đ','d'),'[[:space:]]+',' ','g'))`;
}
export function searchPlan(query:Record<string,unknown>) {
  const input = catalogSearch(query), after = cursor(input), values: unknown[] = [];
  const bind = (value:unknown) => {values.push(value);return '$'+values.length;};
  const q = normalizeSearch(input.q), phrase = bind(q);
  const title = normalized('p.title'), brand = normalized('p.brand');
  const eligible = input.mode === 'B2C' ? 'p.b2c_eligible' : 'p.b2b_eligible';
  const filters = [eligible];
  if (input.category) filters.push(`p.category=${bind(input.category)}`);
  if (input.brand) filters.push(`${brand}=${bind(normalizeSearch(input.brand))}`);
  if (input.form) filters.push(`${normalized('p.form')}=${bind(normalizeSearch(input.form))}`);
  const skuFilters = ['s.product_id=p.id'];
  if (input.color) skuFilters.push(`${normalized('s.color')}=${bind(normalizeSearch(input.color))}`);
  if (input.size) skuFilters.push(`${normalized('s.size')}=${bind(normalizeSearch(input.size))}`);
  if (input.color || input.size) filters.push(`EXISTS(SELECT 1 FROM catalog_read.visible_sku s WHERE ${skuFilters.join(' AND ')})`);
  for (const token of q.split(' ').filter(Boolean)) {
    const parameter=bind(token);
    filters.push(`(strpos(${normalized("concat_ws(' ',p.title,p.brand,p.description,p.material,p.form,p.category)")},${parameter})>0 OR EXISTS(SELECT 1 FROM catalog_read.visible_sku s WHERE s.product_id=p.id AND strpos(${normalized("concat_ws(' ',s.code,s.color,s.size)")},${parameter})>0))`);
  }
  const rank = q ? `CASE WHEN EXISTS(SELECT 1 FROM catalog_read.visible_sku s WHERE s.product_id=p.id AND ${normalized('s.code')}=${phrase}) THEN 60 WHEN ${title}=${phrase} THEN 50 WHEN starts_with(${title},${phrase}) THEN 30 WHEN strpos(${title},${phrase})>0 THEN 20 WHEN ${brand}=${phrase} THEN 10 ELSE 0 END` : `0*length(${phrase}::text)`;
  const pageFilter = after ? `WHERE (search_rank,updated_at,id)<(${bind(after.rank)}::int,${bind(after.at)}::timestamptz,${bind(after.id)}::uuid)` : '';
  const limit=bind(input.limit+1);
  const text = `WITH ranked AS (SELECT p.id,p.version,p.category,p.title,p.brand,p.description,p.form,p.material,p.origin,p.care,p.images,p.updated_at,${rank} AS search_rank FROM catalog_read.visible_product p WHERE ${filters.join(' AND ')}) SELECT *,to_char(updated_at AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"') AS cursor_at FROM ranked ${pageFilter} ORDER BY search_rank DESC,updated_at DESC,id DESC LIMIT ${limit}`;
  return {input,text,values};
}
