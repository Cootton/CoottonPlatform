import { inputObject, inputText } from './admin';
import { parseEntityId } from './index';

export const PRODUCT_MEDIA_LIMITS = Object.freeze({ images: 9, videos: 1, imageBytes: 3145728, videoBytes: 8388608, videoSeconds: 60, thumbnailPixels: 240 });
export function imageColorFields(payload: unknown) {
  const p = inputObject(payload, ['assetId', 'colorId', 'declaration']);
  return { assetId: parseEntityId(p.assetId), colorId: parseEntityId(p.colorId), declaration: inputText(p.declaration, 10000) };
}
export function videoFields(payload: unknown) {
  const p = inputObject(payload, ['base64', 'alt', 'rights']);
  if (typeof p.base64 !== 'string' || !p.base64.length || p.base64.length > Math.ceil(PRODUCT_MEDIA_LIMITS.videoBytes / 3) * 4 || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(p.base64)) throw new TypeError('INVALID_VIDEO');
  return { base64: p.base64, alt: inputText(p.alt, 300), rights: inputText(p.rights, 10000) };
}
