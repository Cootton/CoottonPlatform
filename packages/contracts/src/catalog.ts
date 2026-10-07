import { parseEntityId, type CursorPage, type SalesMode } from './index';

export const CATEGORIES = Object.freeze({ CREWNECK_TSHIRT: 'Áo thun cổ tròn', HOODIE: 'Hoodie', SWEATER: 'Sweater', SHORTS: 'Quần short', TROUSERS: 'Quần dài' });
export type CategoryCode = keyof typeof CATEGORIES;
export interface CatalogImage { readonly path: string; readonly alt: string; readonly width: number; readonly height: number }
export interface CatalogProduct {
  readonly id: string; readonly version: string; readonly slug: string; readonly title: string;
  readonly category: CategoryCode; readonly brand: string; readonly description: string;
  readonly form: string | null; readonly material: string; readonly origin: string;
  readonly care: string; readonly images: readonly CatalogImage[];
}
export interface CatalogSku { readonly id: string; readonly code: string; readonly color: string; readonly size: string; readonly price?: string }
export interface CatalogDetail { readonly product: CatalogProduct; readonly skus: CursorPage<CatalogSku>; readonly commerceEnabled: false; readonly chart?: readonly {size:string;measurement:string;cm:string}[] }
export interface CatalogPage extends CursorPage<CatalogProduct> { readonly mode: SalesMode; readonly commerceEnabled: false }
export function category(value: unknown): CategoryCode | null {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value !== 'string' || !Object.hasOwn(CATEGORIES, value)) throw new TypeError('INVALID_CATEGORY');
  return value as CategoryCode;
}
export function productSlug(title: string): string {
  return title.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[đĐ]/g, 'd')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 120).replace(/-$/g, '') || 'san-pham';
}
function text(value: unknown, max: number): string {
  if (typeof value !== 'string' || !value.trim() || value.length > max) throw new TypeError('INVALID_PUBLIC_FACT');
  return value;
}
/** Reconstruct an allowlisted DTO. Never spread DB/source records into a public response. */
export function publicProduct(value: unknown): CatalogProduct {
  if (!value || typeof value !== 'object') throw new TypeError('INVALID_PUBLIC_PRODUCT');
  const p = value as Record<string, unknown>;
  const title = text(p.title, 160), cat = category(p.category);
  if (!cat || typeof p.version !== 'string' || !/^[1-9][0-9]{0,18}$/.test(p.version)) throw new TypeError('INVALID_PUBLIC_PRODUCT');
  if (!Array.isArray(p.images) || p.images.length < 1 || p.images.length > 20) throw new TypeError('INVALID_MEDIA');
  const images = p.images.map((value: unknown): CatalogImage => {
    if (!value || typeof value !== 'object') throw new TypeError('INVALID_MEDIA');
    const image = value as Record<string, unknown>;
    const path = text(image.path, 250);
    if (!/^\/media\/[0-9a-f-]{36}\/[a-f0-9]{64}\.(webp|avif|jpg|png)$/.test(path)) throw new TypeError('INVALID_MEDIA');
    parseEntityId(path.split('/')[2]);
    if (typeof image.width !== 'number' || !Number.isInteger(image.width) || image.width < 1 || image.width > 8192 ||
        typeof image.height !== 'number' || !Number.isInteger(image.height) || image.height < 1 || image.height > 8192) throw new TypeError('INVALID_MEDIA');
    return { path, alt: text(image.alt, 300), width: image.width, height: image.height };
  });
  return { id: parseEntityId(p.id), version: p.version, slug: productSlug(title), title, category: cat,
    brand: text(p.brand, 160), description: text(p.description, 10000), form: p.form === null ? null : text(p.form, 160),
    material: text(p.material, 1000), origin: text(p.origin, 160), care: text(p.care, 2000), images };
}
