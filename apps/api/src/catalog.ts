import { Controller, Get, Injectable, Module, Param, Query, BadRequestException, NotFoundException, ServiceUnavailableException, type OnModuleDestroy } from '@nestjs/common';
import { parseEntityId, category, publicProduct, type CatalogPage, type CatalogDetail, type CatalogSku, type CategoryCode, type SalesMode } from '@cootton/contracts';
import type { Pool } from 'pg';
import { createDatabasePool } from './database';
import { MemoryCache } from './memory-cache';

const fields = 'id,version,category,title,brand,description,form,material,origin,care,images';
interface Cursor { readonly version: 1; readonly mode: SalesMode; readonly category: CategoryCode | null; readonly limit: number; readonly at: string; readonly id: string }
function parameters(query: Record<string, unknown>): { mode: SalesMode; cat: CategoryCode | null; limit: number; cursor: Cursor | null } {
  try {
    if (Object.keys(query).some(k=>!['mode','category','limit','cursor'].includes(k))) throw new Error();
    const mode = query.mode ?? 'B2C'; if (mode !== 'B2C' && mode !== 'B2B') throw new Error();
    const cat = category(query.category);
    if (query.limit !== undefined && (typeof query.limit !== 'string' || !/^[1-9][0-9]?$/.test(query.limit))) throw new Error();
    const limit = query.limit === undefined ? 20 : Number(query.limit); if (limit > 50) throw new Error();
    let cursor: Cursor | null = null;
    if (query.cursor !== undefined) {
      if (typeof query.cursor !== 'string' || !/^[A-Za-z0-9_-]{1,1024}$/.test(query.cursor)) throw new Error();
      const decoded = JSON.parse(Buffer.from(query.cursor,'base64url').toString('utf8')) as Cursor;
      if (decoded.version!==1 || decoded.mode!==mode || decoded.category!==cat || decoded.limit!==limit ||
          typeof decoded.at!=='string' || !/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{6}Z$/.test(decoded.at)) throw new Error();
      const date = new Date(decoded.at); if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0,23)!==decoded.at.slice(0,23)) throw new Error();
      cursor = {...decoded,id:parseEntityId(decoded.id)};
    }
    return {mode,cat,limit,cursor};
  } catch { throw new BadRequestException('INVALID_INPUT'); }
}

@Injectable()
class CatalogRepository implements OnModuleDestroy {
  constructor(private readonly cache: MemoryCache) {}
  private pool: Pool | undefined;
  private database(): Pool {
    // Never fall back to the maintenance/owner connection.
    if (new URL(process.env.DATABASE_URL ?? '').username!=='cootton_catalog_reader') throw new Error('RUNTIME_ROLE_REQUIRED');
    return this.pool ??= createDatabasePool();
  }
  async onModuleDestroy(): Promise<void> { await this.pool?.end(); }
  async list(query: Record<string,unknown>): Promise<CatalogPage> {
    const {mode,cat,limit,cursor}=parameters(query);
    const key = 'catalog:list:' + JSON.stringify([mode,cat,limit,cursor]);
    return this.cache.read(key, 30000, () => this.loadList(query), page => this.visible(page.items)).catch(() => { throw new ServiceUnavailableException('UNAVAILABLE'); });
  }
  private async visible(products: readonly {id:string;version:string}[]): Promise<boolean> {
    if (!products.length) return true;
    const rows = (await this.database().query<{id:string;version:string}>('SELECT id,version FROM catalog_read.visible_product WHERE id=ANY($1::uuid[])', [products.map(p=>p.id)])).rows;
    return rows.length === products.length && products.every(p=>rows.some(r=>r.id===p.id && r.version===p.version));
  }
  private async loadList(query: Record<string,unknown>): Promise<CatalogPage> {
    const {mode,cat,limit,cursor}=parameters(query);
    try {
      const eligible=mode==='B2C' ? 'b2c_eligible' : 'b2b_eligible';
      const result=await this.database().query<Record<string,unknown> & {cursor_at:string}>(
        `SELECT ${fields},to_char(updated_at AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"') AS cursor_at
         FROM catalog_read.visible_product WHERE ${eligible}
         AND ($1::text IS NULL OR category=$1) AND ($2::timestamptz IS NULL OR (updated_at,id)<($2::timestamptz,$3::uuid))
         ORDER BY updated_at DESC,id DESC LIMIT $4`, [cat,cursor?.at??null,cursor?.id??null,limit+1]);
      const page=result.rows.slice(0,limit), last=page.at(-1);
      const nextCursor=result.rows.length>limit && last ? Buffer.from(JSON.stringify({version:1,mode,category:cat,limit,at:last.cursor_at,id:last.id})).toString('base64url') : null;
      return {items:page.map(publicProduct),nextCursor,mode,commerceEnabled:false};
    } catch { throw new ServiceUnavailableException('UNAVAILABLE'); }
  }
  async detail(id:string, query: Record<string,unknown>): Promise<CatalogDetail> {
    let productId:string;
    let after:string|null=null;
    try { productId=parseEntityId(id); if(Object.keys(query).some(k=>k!=='skuAfter')) throw new Error();
      if(query.skuAfter!==undefined) after=parseEntityId(query.skuAfter);
    } catch { throw new BadRequestException('INVALID_INPUT'); }
    const key = 'catalog:detail:' + JSON.stringify([productId,after]);
    return this.cache.read(key, 60000, () => this.loadDetail(productId,after), value => this.visible([value.product])).catch(error => { if(error instanceof NotFoundException) throw error; throw new ServiceUnavailableException('UNAVAILABLE'); });
  }
  private async loadDetail(productId:string, after:string|null): Promise<CatalogDetail> {
    try {
      const pool=this.database();
      const result=await pool.query(`SELECT ${fields} FROM catalog_read.visible_product WHERE id=$1`,[productId]);
      if(!result.rows[0]) throw new NotFoundException('NOT_FOUND');
      const product=publicProduct(result.rows[0]);
      const skus=await pool.query<CatalogSku>('SELECT id,code,color,size FROM catalog_read.visible_sku WHERE product_id=$1 AND ($2::uuid IS NULL OR id>$2::uuid) ORDER BY id LIMIT 21',[productId,after]);
      const items=skus.rows.slice(0,20).map(s=>({id:parseEntityId(s.id),code:s.code,color:s.color,size:s.size}));
      return {product,skus:{items,nextCursor:skus.rows.length>20 ? items.at(-1)!.id : null},commerceEnabled:false};
    } catch(error) { if(error instanceof NotFoundException) throw error; throw new ServiceUnavailableException('UNAVAILABLE'); }
  }
}
@Controller('catalog/products')
class CatalogController {
  constructor(private readonly catalog:CatalogRepository) {}
  @Get() list(@Query() query:Record<string,unknown>):Promise<CatalogPage>{return this.catalog.list(query);}
  @Get(':id') detail(@Param('id') id:string,@Query() query:Record<string,unknown>):Promise<CatalogDetail>{return this.catalog.detail(id,query);}
}
@Module({controllers:[CatalogController],providers:[CatalogRepository]})
export class CatalogModule {}

