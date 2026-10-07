import { BadRequestException, ServiceUnavailableException } from '@nestjs/common';
import { createHash } from 'node:crypto';
import sharp from 'sharp';
import { firebaseApp } from './firebase-app';
import { getStorage } from 'firebase-admin/storage';
import { inputObject, inputText } from '@cootton/contracts';
import { PRODUCT_MEDIA_LIMITS, videoFields } from '@cootton/contracts';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const execute = promisify(execFile);
sharp.cache({ memory: 16, files: 0, items: 32 });
sharp.concurrency(1);
let processing = false;
const bucket = () => {
    const name = process.env.COOTTON_MEDIA_BUCKET;
    if (!name || !/^[a-z0-9][a-z0-9._-]{2,220}[a-z0-9]$/.test(name))
        throw new ServiceUnavailableException('MEDIA_NOT_CONFIGURED');
    return getStorage(firebaseApp()).bucket(name);
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
        await storeImmutable(path, output, 'image/webp');
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

export async function storeImmutable(path: string, output: Buffer, contentType: string) {
    const storage = bucket(), name = path.slice(1), file = storage.file(name);
    try { await file.save(output, { resumable: false, contentType, preconditionOpts: { ifGenerationMatch: 0 }, metadata: { cacheControl: 'private, no-store' } }); }
    catch (e) {
        if (!(e && typeof e === 'object' && 'code' in e && Number(e.code) === 412)) throw new ServiceUnavailableException('MEDIA_UNAVAILABLE');
        // A partial upload/retry may reuse only the exact immutable object. Pin
        // the generation so replacement between metadata and download cannot pass.
        try {
            const [meta] = await file.getMetadata();
            if (!meta.generation || Number(meta.size) !== output.length || meta.contentType !== contentType || meta.cacheControl !== 'private, no-store') throw new Error();
            const [existing] = await storage.file(name, { generation: meta.generation }).download({ start: 0, end: output.length });
            if (!existing.equals(output)) throw new Error();
        } catch { throw new ServiceUnavailableException('MEDIA_RECOVERY_CONFLICT'); }
    }
}
export async function prepareThumbnail(imagePath: string, key: string) {
    if (processing) throw new ServiceUnavailableException('MEDIA_BUSY');
    processing = true;
    try {
        const [bytes] = await bucket().file(imagePath.slice(1)).download();
        if (bytes.length > PRODUCT_MEDIA_LIMITS.imageBytes) throw new BadRequestException();
        const result = await sharp(bytes, { limitInputPixels: 16000000 }).resize({ width: 240, height: 240, fit: 'inside', withoutEnlargement: true }).webp({ quality: 75 }).toBuffer({ resolveWithObject: true });
        const sha = createHash('sha256').update(result.data).digest('hex'), path = '/thumbnails/' + key + '/' + sha + '.webp';
        await storeImmutable(path, result.data, 'image/webp');
        return { path, sha, width: result.info.width, height: result.info.height };
    } finally { processing = false; }
}

export function validateVideoProbe(probe: any) {
    const streams = probe.streams;
    if (!Array.isArray(streams) || streams.length !== 1) throw new BadRequestException('INVALID_VIDEO');
    const s = streams[0], seconds = Number(probe.format?.duration);
    if (s.codec_type !== 'video' || s.codec_name !== 'h264' || s.pix_fmt !== 'yuv420p' || !Number.isFinite(seconds) || seconds <= 0 || seconds > 60 || !Number.isInteger(s.width) || !Number.isInteger(s.height) || s.width < 2 || s.height < 2 || s.width > 720 || s.height > 720) throw new BadRequestException('INVALID_VIDEO');
    const [n, d] = String(s.avg_frame_rate).split('/').map(Number), fps = n! / d!;
    if (!Number.isFinite(fps) || fps <= 0 || fps > 30.1) throw new BadRequestException('INVALID_VIDEO');
    return { width: s.width as number, height: s.height as number, durationMs: Math.ceil(seconds * 1000) };
}

/** Bounded optimized MP4 input. Large camera originals are converted offline, never sent as JSON. */
export async function normalizeVideo(bytes: Buffer) {
    let folder: string | undefined;
    try {
        if (!bytes.length || bytes.length > PRODUCT_MEDIA_LIMITS.videoBytes || bytes.toString('ascii', 4, 8) !== 'ftyp' || !['isom', 'iso2', 'mp41', 'mp42', 'avc1'].includes(bytes.toString('ascii', 8, 12))) throw new BadRequestException('INVALID_VIDEO');
        folder = await mkdtemp(join(tmpdir(), 'cootton-video-'));
        const source = join(folder, 'input.mp4'), output = join(folder, 'output.mp4'), poster = join(folder, 'poster.webp');
        await writeFile(source, bytes);
        const inspected = await execute('ffprobe', ['-v', 'error', '-protocol_whitelist', 'file,pipe', '-show_streams', '-show_format', '-of', 'json', source], { timeout: 10000, maxBuffer: 262144 });
        validateVideoProbe(JSON.parse(inspected.stdout));
        await execute('ffmpeg', ['-nostdin', '-v', 'error', '-y', '-threads', '1', '-protocol_whitelist', 'file,pipe', '-i', source, '-map', '0:v:0', '-an', '-map_metadata', '-1', '-map_chapters', '-1', '-c:v', 'libx264', '-threads', '1', '-preset', 'veryfast', '-crf', '26', '-maxrate', '900k', '-bufsize', '1800k', '-pix_fmt', 'yuv420p', '-r', '30', '-movflags', '+faststart', output], { timeout: 80000, maxBuffer: 262144 });
        const result = await readFile(output);
        if (!result.length || result.length > PRODUCT_MEDIA_LIMITS.videoBytes) throw new BadRequestException('VIDEO_TOO_LARGE');
        const checked = await execute('ffprobe', ['-v', 'error', '-protocol_whitelist', 'file,pipe', '-show_streams', '-show_format', '-of', 'json', output], { timeout: 10000, maxBuffer: 262144 });
        const metadata = validateVideoProbe(JSON.parse(checked.stdout));
        await execute('ffmpeg', ['-nostdin', '-v', 'error', '-y', '-threads', '1', '-i', output, '-frames:v', '1', '-vf', 'scale=480:480:force_original_aspect_ratio=decrease', '-c:v', 'libwebp', '-threads', '1', '-quality', '75', poster], { timeout: 10000, maxBuffer: 262144 });
        const posterBytes = await readFile(poster);
        if (posterBytes.length > 262144) throw new BadRequestException('INVALID_POSTER');
        return { ...metadata, output: result, poster: posterBytes };
    } catch (e) {
        if (e instanceof BadRequestException || e instanceof TypeError || e instanceof ServiceUnavailableException) throw e;
        throw new ServiceUnavailableException('VIDEO_PROCESSING_UNAVAILABLE');
    } finally {
        if (folder) await rm(folder, { recursive: true, force: true }).catch(() => {});
    }
}
export async function prepareVideo(payload: unknown, key: string) {
    if (processing) throw new ServiceUnavailableException('MEDIA_BUSY');
    processing = true;
    try {
        const p = videoFields(payload), result = await normalizeVideo(Buffer.from(p.base64, 'base64'));
        const { path, sha, posterPath } = await storeVideoMedia(result, key);
        return { width: result.width, height: result.height, durationMs: result.durationMs, path, sha, posterPath, byteLength: result.output.length, alt: p.alt, rights: p.rights };
    } finally { processing = false; }
}
/** Only called with normalized, bounded output; no transport route accepts paths. */
export async function storeVideoMedia(result: { output: Buffer; poster: Buffer }, key: string) {
    const sha = createHash('sha256').update(result.output).digest('hex'), posterSha = createHash('sha256').update(result.poster).digest('hex');
    const path = '/videos/' + key + '/' + sha + '.mp4', posterPath = '/posters/' + key + '/' + posterSha + '.webp';
    await storeImmutable(path, result.output, 'video/mp4');
    await storeImmutable(posterPath, result.poster, 'image/webp');
    return { path, sha, posterPath };
}
export async function previewVideo(path: string) {
    const [bytes] = await bucket().file(path.slice(1)).download();
    if (bytes.length > PRODUCT_MEDIA_LIMITS.videoBytes) throw new ServiceUnavailableException();
    return { mime: 'video/mp4', base64: bytes.toString('base64') };
}
