/** Transport primitives only. These types do not define a database schema. */
export const CONTRACT_VERSION = '0.1.0' as const;
declare const opaqueId: unique symbol;
export type EntityId = string & { readonly [opaqueId]: true };
/** IDs contain no name, email, phone, price or SKU semantics. */
export function parseEntityId(value: unknown): EntityId {
  if (typeof value !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)) {
    throw new TypeError('INVALID_ENTITY_ID');
  }
  return value.toLowerCase() as EntityId;
}
export type Vnd = Readonly<{ currency: 'VND'; amount: string }>;
/** Decimal integer strings keep precision beyond JavaScript safe integers. */
export function vnd(value: unknown): Vnd {
  if (typeof value !== 'string' || !/^(0|[1-9][0-9]*)$/.test(value)) throw new TypeError('INVALID_VND_AMOUNT');
  return Object.freeze({ currency: 'VND', amount: value });
}
export type SalesMode = 'B2C' | 'B2B';
export type PointKind = 'CP' | 'VC' | 'VCS';
export type Surface = 'buyer' | 'seller' | 'admin';
export type ErrorCode = 'INVALID_INPUT' | 'UNAUTHENTICATED' | 'FORBIDDEN' | 'NOT_FOUND' | 'CONFLICT' | 'RATE_LIMITED' | 'UNAVAILABLE' | 'INTERNAL_ERROR';
export interface ApiError { readonly code: ErrorCode; readonly message: string; readonly requestId: string }
export interface CursorPage<T> { readonly items: readonly T[]; readonly nextCursor: string | null }
export interface Liveness { readonly status: 'alive'; readonly contractVersion: typeof CONTRACT_VERSION }
/** Candidate baseline rules; runtime policy must be versioned and server-owned. */
export const OWNER_BASELINE = Object.freeze({ cpVndPerPoint: '1000', platformFeePercent: '10', returnDays: 15, b2bMinimumQuantity: 10, b2bMinimumVnd: '1000000' });
export * from './catalog';
export * from './admin';
