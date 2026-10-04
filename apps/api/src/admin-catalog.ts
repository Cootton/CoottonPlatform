import { BadRequestException, Body, ConflictException, Controller, ForbiddenException, Get, Injectable, Module, NotFoundException, Param, Post, Query, Req, ServiceUnavailableException, UseGuards, type OnModuleDestroy } from '@nestjs/common';
import { createHash, randomUUID } from 'node:crypto';
import type { Pool, PoolClient } from 'pg';
import { parseEntityId, inputObject, inputText, inputVersion, draftFields, imageColorFields, PRODUCT_MEDIA_LIMITS } from '@cootton/contracts';
import { createDatabasePool } from './database';
import { addDictionary, intakeDetail, saveIntake } from './product-intake';
import { prepareImage, previewImage, prepareThumbnail, prepareVideo, previewVideo } from './catalog-media';
import { AdminIdentityGuard, type AdminRequest } from './admin-auth';
const productFields = 'id,title,lifecycle,version::text,updated_at';
function canonical(value: unknown): string {
    if (Array.isArray(value))
        return '[' + value.map(canonical).join(',') + ']';
    if (value && typeof value === 'object')
        return '{' + Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => JSON.stringify(k) + ':' + canonical(v)).join(',') + '}';
    return JSON.stringify(value);
}
@Injectable()
class AdminCatalogService implements OnModuleDestroy {
    private pool: Pool | undefined;
    private database(): Pool {
        const url = process.env.ADMIN_DATABASE_URL;
        try {
            if (decodeURIComponent(new URL(url ?? '').username) !== 'cootton_catalog_admin')
                throw new Error();
        }
        catch {
            throw new ServiceUnavailableException('ADMIN_NOT_CONFIGURED');
        }
        return this.pool ??= createDatabasePool(url);
    }
    async onModuleDestroy(): Promise<void> { await this.pool?.end(); }
    private async actor(db: Pool | PoolClient, request: AdminRequest): Promise<string> {
        const identity = request.adminIdentity;
        if (!identity)
            throw new ForbiddenException();
        const result = await db.query('SELECT id FROM catalog_core.principal WHERE project=$1 AND subject=$2 AND active', [identity.project, identity.subject]);
        if (!result.rows[0])
            throw new ForbiddenException('NO_ADMIN_GRANT');
        return result.rows[0].id as string;
    }
    async session(request: AdminRequest) {
        try {
            return { principalId: await this.actor(this.database(), request), capabilities: ['catalog.read', 'catalog.draft'], commerceEnabled: false };
        }
        catch (e) {
            this.safe(e);
        }
    }
    async list(request: AdminRequest, query: Record<string, unknown>) {
        let after: string | null = null;
        try {
            inputObject(query, ['after']);
            if (query.after !== undefined)
                after = parseEntityId(query.after);
        }
        catch {
            throw new BadRequestException();
        }
        try {
            const db = this.database();
            await this.actor(db, request);
            const rows = (await db.query(`SELECT ${productFields} FROM catalog_core.product WHERE ($1::uuid IS NULL OR id>$1) ORDER BY id LIMIT 21`, [after])).rows;
            return { items: rows.slice(0, 20), nextCursor: rows.length > 20 ? rows[19].id : null };
        }
        catch (e) {
            this.safe(e);
        }
    }
    async dictionaries(request: AdminRequest) {
        try {
            const db = this.database();
            await this.actor(db, request);
            return { items: (await db.query('SELECT id,kind,code,label FROM catalog_core.dictionary WHERE active ORDER BY kind,code LIMIT 501')).rows, applicability: (await db.query('SELECT form_id,category_id FROM catalog_core.form_category')).rows, configured: true };
        }
        catch (e) {
            this.safe(e);
        }
    }
    async detail(request: AdminRequest, idValue: string) {
        let id: string;
        try {
            id = parseEntityId(idValue);
        }
        catch {
            throw new BadRequestException();
        }
        let db: PoolClient | undefined;
        try {
            db = await this.database().connect();
            await db.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
            await this.actor(db, request);
            const row = (await db.query(`SELECT ${productFields},description,care,category_id,brand_id,form_id,country_id,origin_evidence_id,care_evidence_id FROM catalog_core.product WHERE id=$1`, [id])).rows[0];
            if (!row)
                throw new NotFoundException();
            const result = { ...row, intake: await intakeDetail(db, id) };
            await db.query('COMMIT');
            return result;
        }
        catch (e) {
            if (db)
                await db.query('ROLLBACK').catch(() => { });
            this.safe(e);
        }
        finally {
            db?.release();
        }
    }
    async command(request: AdminRequest, body: unknown) {
        let input: Record<string, unknown>, key: string, action: string, id: string | null, version: string | null;
        try {
            input = inputObject(body, ['key', 'action', 'id', 'expectedVersion', 'payload']);
            key = parseEntityId(input.key);
            action = inputText(input.action, 40);
            if (!['createDraft', 'saveDraft', 'saveIntake', 'addDictionary', 'uploadImage', 'setImageColor', 'uploadVideo', 'submit', 'approve', 'publish', 'archive'].includes(action))
                throw new Error();
            id = ['createDraft', 'addDictionary'].includes(action) ? null : parseEntityId(input.id);
            version = ['createDraft', 'addDictionary'].includes(action) ? null : inputVersion(input.expectedVersion);
            if (['createDraft', 'addDictionary'].includes(action) && (input.id !== undefined || input.expectedVersion !== undefined))
                throw new Error();
        }
        catch {
            throw new BadRequestException('INVALID_INPUT');
        }
        const fingerprint = createHash('sha256').update(canonical(input)).digest('hex');
        let client: PoolClient | undefined;
        let image: Awaited<ReturnType<typeof prepareImage>> | undefined;
        let thumbnail: Awaited<ReturnType<typeof prepareThumbnail>> | undefined;
        let video: Awaited<ReturnType<typeof prepareVideo>> | undefined;
        try {
            if (['uploadImage', 'setImageColor', 'uploadVideo'].includes(action)) {
                const db = this.database();
                const actor = await this.actor(db, request);
                const replay = (await db.query('SELECT fingerprint,result FROM catalog_core.command WHERE actor_id=$1 AND operation=$2 AND key=$3', [actor, action, key])).rows[0];
                if (replay) {
                    if (replay.fingerprint !== fingerprint)
                        throw new ConflictException();
                    return replay.result;
                }
                const target = (await db.query('SELECT lifecycle,version FROM catalog_core.product WHERE id=$1', [id])).rows[0];
                if (!target || target.lifecycle !== 'DRAFT' || String(target.version) !== version)
                    throw new ConflictException();
                if (action === 'uploadImage') {
                    if (Number((await db.query('SELECT count(*) AS n FROM catalog_core.product_media WHERE product_id=$1', [id])).rows[0].n) >= PRODUCT_MEDIA_LIMITS.images) throw new BadRequestException('IMAGE_LIMIT');
                    image = await prepareImage(input.payload, key);
                } else if (action === 'uploadVideo') {
                    if ((await db.query('SELECT 1 FROM catalog_core.product_video WHERE product_id=$1', [id])).rowCount) throw new ConflictException('VIDEO_EXISTS');
                    video = await prepareVideo(input.payload, key);
                } else {
                    const p = imageColorFields(input.payload);
                    const asset = (await db.query('SELECT a.path,t.asset_id AS thumbnail FROM catalog_core.asset a JOIN catalog_core.product_media m ON m.asset_id=a.id LEFT JOIN catalog_core.media_thumbnail t ON t.asset_id=a.id WHERE m.product_id=$1 AND a.id=$2 AND EXISTS(SELECT 1 FROM catalog_core.sku s JOIN catalog_core.dictionary d ON d.id=s.color_id AND d.active WHERE s.product_id=$1 AND s.color_id=$3)', [id,p.assetId,p.colorId])).rows[0];
                    if (!asset) throw new BadRequestException('INVALID_COLOR_IMAGE');
                    if (!asset.thumbnail) thumbnail = await prepareThumbnail(asset.path, key);
                }
            }
            client = await this.database().connect();
            await client.query('BEGIN');
            const identity = request.adminIdentity!;
            // Bootstrap/revoke maintenance must acquire this same subject guard.
            await client.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))', [identity.project + ':' + identity.subject]);
            const actor = await this.actor(client, request);
            const prior = (await client.query('SELECT fingerprint,result FROM catalog_core.command WHERE actor_id=$1 AND operation=$2 AND key=$3', [actor, action, key])).rows[0];
            if (prior) {
                if (prior.fingerprint !== fingerprint)
                    throw new ConflictException('IDEMPOTENCY_CONFLICT');
                await client.query('COMMIT');
                return prior.result;
            }
            let product: Record<string, unknown> | undefined;
            if (id) {
                product = (await client.query('SELECT * FROM catalog_core.product WHERE id=$1 FOR UPDATE', [id])).rows[0];
                if (!product)
                    throw new NotFoundException();
                if (String(product.version) !== version)
                    throw new ConflictException('VERSION_CONFLICT');
            }
            let result: Record<string, unknown>;
            if (action === 'addDictionary') {
                result = await addDictionary(client, input.payload);
            }
            else if (action === 'saveIntake') {
                if (product!.lifecycle !== 'DRAFT')
                    throw new ConflictException('DRAFT_REQUIRED');
                result = await saveIntake(client, product!, input.payload, actor);
            }
            else if (action === 'uploadImage') {
                if (product!.lifecycle !== 'DRAFT' || !image)
                    throw new ConflictException();
                const position = Number((await client.query('SELECT count(*) AS n FROM catalog_core.product_media WHERE product_id=$1', [id])).rows[0].n) + 1;
                if (position > PRODUCT_MEDIA_LIMITS.images)
                    throw new BadRequestException();
                const evidence = randomUUID();
                await client.query('INSERT INTO catalog_core.evidence(id,seller_id,declaration,actor_id) VALUES($1,$2,$3,$4)', [evidence, product!.seller_id, image.rights, actor]);
                await client.query('INSERT INTO catalog_core.asset(id,seller_id,path,sha256,width,height,rights_evidence_id) VALUES($1,$2,$3,$4,$5,$6,$7)', [key, product!.seller_id, image.path, image.sha, image.width, image.height, evidence]);
                await client.query('INSERT INTO catalog_core.product_media(product_id,asset_id,position,alt) VALUES($1,$2,$3,$4)', [id, key, position, image.alt]);
                result = (await client.query('UPDATE catalog_core.product SET version=version+1,updated_at=clock_timestamp() WHERE id=$1 RETURNING ' + productFields, [id])).rows[0];
            }
            else if (action === 'setImageColor') {
                if (product!.lifecycle !== 'DRAFT') throw new ConflictException('DRAFT_REQUIRED');
                const p = imageColorFields(input.payload);
                if (!(await client.query('SELECT 1 FROM catalog_core.product_media m WHERE m.product_id=$1 AND m.asset_id=$2 AND EXISTS(SELECT 1 FROM catalog_core.sku s JOIN catalog_core.dictionary d ON d.id=s.color_id AND d.active WHERE s.product_id=$1 AND s.color_id=$3)', [id,p.assetId,p.colorId])).rowCount) throw new BadRequestException('INVALID_COLOR_IMAGE');
                if (thumbnail) await client.query('INSERT INTO catalog_core.media_thumbnail(asset_id,path,sha256,width,height) VALUES($1,$2,$3,$4,$5) ON CONFLICT(asset_id) DO NOTHING', [p.assetId,thumbnail.path,thumbnail.sha,thumbnail.width,thumbnail.height]);
                const evidence = randomUUID();
                await client.query('INSERT INTO catalog_core.evidence(id,seller_id,declaration,actor_id) VALUES($1,$2,$3,$4)', [evidence,product!.seller_id,p.declaration,actor]);
                await client.query('INSERT INTO catalog_core.product_color_image(product_id,color_id,asset_id,source_id) VALUES($1,$2,$3,$4) ON CONFLICT(product_id,color_id) DO UPDATE SET asset_id=EXCLUDED.asset_id,source_id=EXCLUDED.source_id', [id,p.colorId,p.assetId,evidence]);
                result = (await client.query('UPDATE catalog_core.product SET version=version+1,updated_at=clock_timestamp() WHERE id=$1 RETURNING ' + productFields, [id])).rows[0];
            }
            else if (action === 'uploadVideo') {
                if (product!.lifecycle !== 'DRAFT' || !video) throw new ConflictException('DRAFT_REQUIRED');
                if ((await client.query('SELECT 1 FROM catalog_core.product_video WHERE product_id=$1', [id])).rowCount) throw new ConflictException('VIDEO_EXISTS');
                const evidence = randomUUID();
                await client.query('INSERT INTO catalog_core.evidence(id,seller_id,declaration,actor_id) VALUES($1,$2,$3,$4)', [evidence,product!.seller_id,video.rights,actor]);
                await client.query('INSERT INTO catalog_core.video_asset(id,seller_id,path,sha256,poster_path,width,height,duration_ms,byte_length,alt,rights_evidence_id) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)', [key,product!.seller_id,video.path,video.sha,video.posterPath,video.width,video.height,video.durationMs,video.byteLength,video.alt,evidence]);
                await client.query('INSERT INTO catalog_core.product_video(product_id,seller_id,video_id) VALUES($1,$2,$3)', [id,product!.seller_id,key]);
                result = (await client.query('UPDATE catalog_core.product SET version=version+1,updated_at=clock_timestamp() WHERE id=$1 RETURNING ' + productFields, [id])).rows[0];
            }
            else if (action === 'createDraft') {
                const payload = inputObject(input.payload, ['title']);
                const title = inputText(payload.title, 160);
                const seller = (await client.query('SELECT id FROM catalog_core.seller WHERE singleton')).rows[0];
                if (!seller)
                    throw new ConflictException('SELLER_NOT_CONFIGURED');
                const newId = randomUUID(), token = 'M' + newId.replaceAll('-', '').slice(0, 12).toUpperCase();
                result = (await client.query(`INSERT INTO catalog_core.product(id,seller_id,model_token,title) VALUES($1,$2,$3,$4) RETURNING ${productFields}`, [newId, seller.id, token, title])).rows[0];
            }
            else if (action === 'saveDraft') {
                if (product!.lifecycle !== 'DRAFT')
                    throw new ConflictException('DRAFT_REQUIRED');
                const fields = draftFields(input.payload);
                const refs = [fields.categoryId, fields.brandId, fields.formId, fields.countryId];
                const found = (await client.query('SELECT id,kind FROM catalog_core.dictionary WHERE active AND id=ANY($1::uuid[])', [refs.filter(Boolean)])).rows;
                if (fields.formId && (!fields.categoryId || !(await client.query('SELECT 1 FROM catalog_core.form_category WHERE form_id=$1 AND category_id=$2', [fields.formId, fields.categoryId])).rowCount))
                    throw new BadRequestException('FORM_NOT_APPLICABLE');
                const kinds = ['CATEGORY', 'BRAND', 'FORM', 'COUNTRY'];
                for (let i = 0; i < refs.length; i++)
                    if (refs[i] && !found.some(r => r.id === refs[i] && r.kind === kinds[i]))
                        throw new BadRequestException('INVALID_DICTIONARY');
                for (const evidence of [fields.originEvidenceId, fields.careEvidenceId])
                    if (evidence && !(await client.query('SELECT 1 FROM catalog_core.evidence WHERE id=$1 AND seller_id=$2', [evidence, product!.seller_id])).rowCount)
                        throw new BadRequestException('INVALID_EVIDENCE');
                result = (await client.query(`UPDATE catalog_core.product SET title=$2,description=$3,care=$4,category_id=$5,brand_id=$6,form_id=$7,country_id=$8,origin_evidence_id=$9,care_evidence_id=$10,version=version+1,updated_at=clock_timestamp() WHERE id=$1 RETURNING ${productFields}`, [id, fields.title, fields.description, fields.care, fields.categoryId, fields.brandId, fields.formId, fields.countryId, fields.originEvidenceId, fields.careEvidenceId])).rows[0];
            }
            else {
                inputObject(input.payload, action === 'archive' ? ['reason'] : []);
                if (action === 'archive') {
                    inputText((input.payload as Record<string, unknown>).reason, 1000);
                    if (product!.lifecycle === 'ARCHIVED')
                        throw new ConflictException('ALREADY_ARCHIVED');
                    result = (await client.query(`UPDATE catalog_core.product SET lifecycle='ARCHIVED',version=version+1,updated_at=clock_timestamp() WHERE id=$1 RETURNING ${productFields}`, [id])).rows[0];
                    // Withdraw public data atomically; immutable source/history retained.
                    await client.query('UPDATE catalog_read.public_product SET b2c_eligible=false,b2b_eligible=false WHERE id=$1', [id]);
                }
                else {
                    // No dishonest approval/publication while source/media/offering execution is absent.
                    throw new ConflictException('PUBLICATION_PREREQUISITES_NOT_READY');
                }
            }
            const resource = String(result.id), newVersion = String(result.version);
            await client.query('INSERT INTO catalog_core.audit(id,actor_id,action,resource_id,version) VALUES($1,$2,$3,$4,$5)', [randomUUID(), actor, action, resource, newVersion]);
            await client.query('INSERT INTO catalog_core.outbox(id,resource_id,version,action) VALUES($1,$2,$3,$4)', [randomUUID(), resource, newVersion, action]);
            await client.query('INSERT INTO catalog_core.command(actor_id,operation,key,fingerprint,result) VALUES($1,$2,$3,$4,$5)', [actor, action, key, fingerprint, JSON.stringify(result)]);
            await client.query('COMMIT');
            return result;
        }
        catch (e) {
            if (client)
                try {
                    await client.query('ROLLBACK');
                }
                catch { }
            this.safe(e);
        }
        finally {
            client?.release();
        }
    }
    async image(request: AdminRequest, idValue: string, assetValue: string, thumbnail = false) {
        let id: string, asset: string;
        try {
            id = parseEntityId(idValue);
            asset = parseEntityId(assetValue);
        }
        catch {
            throw new BadRequestException();
        }
        try {
            const db = this.database();
            await this.actor(db, request);
            const row = (await db.query(thumbnail ? 'SELECT t.path FROM catalog_core.media_thumbnail t JOIN catalog_core.product_media m ON m.asset_id=t.asset_id WHERE m.product_id=$1 AND t.asset_id=$2' : 'SELECT a.path FROM catalog_core.asset a JOIN catalog_core.product_media m ON m.asset_id=a.id JOIN catalog_core.product p ON p.id=m.product_id AND p.seller_id=a.seller_id WHERE p.id=$1 AND a.id=$2', [id, asset])).rows[0];
            if (!row)
                throw new NotFoundException();
            return await previewImage(row.path);
        }
        catch (e) {
            this.safe(e);
        }
    }
    async video(request: AdminRequest, idValue: string, poster: boolean) {
        try {
            const id = parseEntityId(idValue), db = this.database();
            await this.actor(db, request);
            const row = (await db.query('SELECT v.path,v.poster_path FROM catalog_core.video_asset v JOIN catalog_core.product_video p ON p.video_id=v.id AND p.seller_id=v.seller_id WHERE p.product_id=$1', [id])).rows[0];
            if (!row) throw new NotFoundException();
            return poster ? await previewImage(row.poster_path) : await previewVideo(row.path);
        } catch(e) { this.safe(e); }
    }
    private safe(error: unknown): never {
        if (error instanceof BadRequestException || error instanceof ForbiddenException || error instanceof ConflictException || error instanceof NotFoundException || error instanceof ServiceUnavailableException)
            throw error;
        if (error instanceof TypeError)
            throw new BadRequestException('INVALID_INPUT');
        const code = error && typeof error === 'object' && 'code' in error ? String(error.code) : '';
        if (['23505', '23503', '23514', '22001', '22P02'].includes(code))
            throw new ConflictException('CONSTRAINT_CONFLICT');
        throw new ServiceUnavailableException('ADMIN_UNAVAILABLE');
    }
}
@Controller('admin')
@UseGuards(AdminIdentityGuard)
class AdminCatalogController {
    constructor(private readonly catalog: AdminCatalogService) { }
    @Get('session')
    session(
    @Req()
    request: AdminRequest) { return this.catalog.session(request); }
    @Get('catalog/products')
    list(
    @Req()
    request: AdminRequest, 
    @Query()
    query: Record<string, unknown>) { return this.catalog.list(request, query); }
    @Get('catalog/products/:id')
    detail(
    @Req()
    request: AdminRequest, 
    @Param('id')
    id: string) { return this.catalog.detail(request, id); }
    @Get('catalog/dictionaries')
    dictionaries(
    @Req()
    request: AdminRequest) { return this.catalog.dictionaries(request); }
    @Get('catalog/products/:id/images/:asset')
    image(
    @Req()
    request: AdminRequest, 
    @Param('id')
    id: string, 
    @Param('asset')
    asset: string) { return this.catalog.image(request, id, asset); }
    @Post('catalog/commands')
    command(
    @Req()
    request: AdminRequest, 
    @Body()
    body: unknown) { return this.catalog.command(request, body); }
    @Get('catalog/products/:id/thumbnails/:asset')
    thumbnail(@Req() request: AdminRequest, @Param('id') id: string, @Param('asset') asset: string) { return this.catalog.image(request,id,asset,true); }
    @Get('catalog/products/:id/video')
    video(@Req() request: AdminRequest, @Param('id') id: string) { return this.catalog.video(request,id,false); }
    @Get('catalog/products/:id/video/poster')
    poster(@Req() request: AdminRequest, @Param('id') id: string) { return this.catalog.video(request,id,true); }
}
@Module({ controllers: [AdminCatalogController], providers: [AdminCatalogService, AdminIdentityGuard] })
export class AdminCatalogModule {
}
