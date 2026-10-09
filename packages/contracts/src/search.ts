import { category, publicProduct, type CategoryCode, type CatalogPage } from './catalog';
import type { SalesMode } from './index';

export interface CatalogSearch {
  readonly mode: SalesMode;
  readonly q: string;
  readonly category: CategoryCode | null;
  readonly brand: string;
  readonly form: string;
  readonly color: string;
  readonly size: string;
  readonly limit: number;
  readonly cursor: string | null;
}
export function normalizeSearch(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[đĐ]/g, 'd').toLowerCase().trim().replace(/\s+/g, ' ');
}
export function catalogSearch(query: Record<string, unknown>): CatalogSearch {
  if (Object.keys(query).some(k => !['mode','q','category','brand','form','color','size','limit','cursor'].includes(k))) throw new TypeError('INVALID_SEARCH');
  const text = (key: string, max: number): string => {
    const value = query[key] ?? '';
    if (typeof value !== 'string' || value.length > max || /[\u0000-\u001f\u007f]/.test(value)) throw new TypeError('INVALID_SEARCH');
    return value.normalize('NFC').trim().replace(/\s+/g, ' ');
  };
  const mode = query.mode ?? 'B2C';
  if (mode !== 'B2C' && mode !== 'B2B') throw new TypeError('INVALID_SEARCH');
  const q = text('q',160);
  if (normalizeSearch(q).split(' ').filter(Boolean).length > 8) throw new TypeError('INVALID_SEARCH');
  if (query.limit !== undefined && (typeof query.limit !== 'string' || !/^[1-9][0-9]?$/.test(query.limit))) throw new TypeError('INVALID_SEARCH');
  const limit = query.limit === undefined ? 20 : Number(query.limit);
  if (limit > 50) throw new TypeError('INVALID_SEARCH');
  const cursor = query.cursor ?? null;
  if (cursor !== null && (typeof cursor !== 'string' || !/^[A-Za-z0-9_-]{1,1024}$/.test(cursor))) throw new TypeError('INVALID_SEARCH');
  return {mode,q,category:category(query.category),brand:text('brand',160),form:text('form',80),color:text('color',80),size:text('size',80),limit,cursor};
}
export function searchQuery(input: CatalogSearch, cursor: string | null = input.cursor): URLSearchParams {
  const query = new URLSearchParams({mode:input.mode,limit:String(input.limit)});
  for (const key of ['q','category','brand','form','color','size'] as const) if (input[key]) query.set(key,input[key]!);
  if (cursor) query.set('cursor',cursor);
  return query;
}
/** Rebuild the public allowlist rather than forwarding arbitrary backend fields. */
export function publicSearchPage(value: unknown, mode: SalesMode, limit = 50): CatalogPage {
  const page = value as CatalogPage;
  if (!page || !Array.isArray(page.items) || page.items.length > limit || page.mode !== mode || page.commerceEnabled !== false ||
    (page.nextCursor !== null && (typeof page.nextCursor !== 'string' || !/^[A-Za-z0-9_-]{1,1024}$/.test(page.nextCursor)))) throw new TypeError('INVALID_SEARCH_PAGE');
  return {items:page.items.map(publicProduct),mode,commerceEnabled:false,nextCursor:page.nextCursor};
}
