import { BadRequestException, ServiceUnavailableException } from '@nestjs/common';
import { createHash } from 'node:crypto';
import sharp from 'sharp';
import { getApps } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import { inputObject, inputText } from '@cootton/contracts';
sharp.cache({ memory: 16, files: 0, items: 32 });
sharp.concurrency(1);
let processing = false;
const bucket = () => {
    const name = process.env.COOTTON_MEDIA_BUCKET;
    if (!name || !/^[a-z0-9][a-z0-9._-]{2,220}[a-z0-9]$/.test(name))
        throw new ServiceUnavailableException('MEDIA_NOT_CONFIGURED');
    const app = getApps().find(a => a.name === 'cootton-admin');
    if (!app)
        throw new ServiceUnavailableException('MEDIA_NOT_CONFIGURED');
    return getStorage(app).bucket(name);
};
export async function normalizeImage(bytes: Buffer) {
    if (!bytes.length || bytes.length > 3145728)
        throw new BadRequestException('INVALID_IMAGE');
    try {
        const image = sharp(bytes, { limitInputPixels: 16000000, failOn: 'warning' });
        const meta = await image.metadata();
        if (!['jpeg', 'png', 'webp'].includes(meta.format ?? '') || !meta.width || !meta.height || meta.width > 8192 || meta.height > 8192 || (meta.pages ?? 1) !== 1)
            throw new Error();
        const result = await image.rotate().resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true }).webp({ quality: 82 }).toBuffer({ resolveWithObject: true });
        if (result.data.length > 3145728)
            throw new Error();
        return { output: result.data, width: result.info.width, height: result.info.height, sha: createHash('sha256').update(result.data).digest('hex') };
    }
    catch {
        throw new BadRequestException('INVALID_IMAGE');
    }
}
export async function prepareImage(payload: unknown, key: string) {
    if (processing)
        throw new ServiceUnavailableException('MEDIA_BUSY');
    processing = true;
    try {
        const p = inputObject(payload, ['base64', 'alt', 'rights']);
        const alt = inputText(p.alt, 300), rights = inputText(p.rights, 10000);
        if (typeof p.base64 !== 'string' || p.base64.length > 4194304 || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(p.base64))
            throw new BadRequestException();
        const { output, width, height, sha } = await normalizeImage(Buffer.from(p.base64, 'base64'));
        const path = '/media/' + key + '/' + sha + '.webp';
        try {
            await bucket().file(path.slice(1)).save(output, { resumable: false, contentType: 'image/webp', preconditionOpts: { ifGenerationMatch: 0 }, metadata: { cacheControl: 'private, no-store' } });
        }
        catch (e) {
            if (!(e && typeof e === 'object' && 'code' in e && Number(e.code) === 412))
                throw new ServiceUnavailableException('MEDIA_UNAVAILABLE');
        }
        return { path, sha, width, height, rights, alt };
    }
    finally {
        processing = false;
    }
}
export async function previewImage(path: string) {
    const [bytes] = await bucket().file(path.slice(1)).download();
    if (bytes.length > 3145728)
        throw new ServiceUnavailableException();
    return { mime: 'image/webp', base64: bytes.toString('base64') };
}
