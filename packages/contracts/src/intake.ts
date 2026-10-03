import { inputObject, inputText, optionalId, inputVersion } from './admin';
import { parseEntityId } from './index';
export function decimal(value: unknown, allowZero = false): string {
    if (typeof value !== 'string' || !/^(0|[1-9][0-9]{0,5})(\.[0-9]{1,2})?$/.test(value) || (!allowZero && Number(value) <= 0))
        throw new TypeError('INVALID_DECIMAL');
    return value;
}
export function integer(value: unknown, max = '2147483647', zero = false): string {
    if (typeof value !== 'string' || !/^(0|[1-9][0-9]*)$/.test(value) || value.length > 30 || BigInt(value) > BigInt(max) || (!zero && BigInt(value) === 0n))
        throw new TypeError('INVALID_INTEGER');
    return value;
}
function collection(value: unknown, max: number): unknown[] {
    if (!Array.isArray(value) || value.length > max)
        throw new TypeError('INVALID_COLLECTION');
    return value;
}
export function intakeFields(value: unknown) {
    const p = inputObject(value, ['declaration', 'fabric', 'gsmKind', 'gsmMin', 'gsmMax', 'variants', 'chart', 'location']);
    const declaration = inputText(p.declaration, 10000);
    const fabric = inputText(p.fabric, 1000, false);
    const gsmKind = inputText(p.gsmKind, 10);
    if (!['UNKNOWN', 'EXACT', 'RANGE'].includes(gsmKind))
        throw new TypeError('INVALID_GSM');
    const gsmMin = gsmKind === 'UNKNOWN' ? null : decimal(p.gsmMin);
    const gsmMax = gsmKind === 'UNKNOWN' ? null : gsmKind === 'EXACT' ? gsmMin : decimal(p.gsmMax);
    if (gsmKind === 'EXACT' && p.gsmMax !== p.gsmMin)
        throw new TypeError('INVALID_GSM');
    if (gsmMin && gsmMax && Number(gsmMax) < Number(gsmMin))
        throw new TypeError('INVALID_GSM');
    if (gsmKind === 'UNKNOWN' && (p.gsmMin !== null || p.gsmMax !== null))
        throw new TypeError('INVALID_GSM');
    if (!fabric && gsmKind !== 'UNKNOWN')
        throw new TypeError('FABRIC_REQUIRED');
    const variants = collection(p.variants, 100).map(v => {
        const o = inputObject(v, ['colorId', 'sizeId', 'price', 'tiers', 'stock']);
        const tiers = collection(o.tiers, 100).map(t => { const q = inputObject(t, ['quantity', 'price']); return { quantity: integer(q.quantity), price: integer(q.price, '999999999999999999999999999999') }; });
        if (tiers.length && tiers[0]!.quantity !== '1')
            throw new TypeError('INVALID_TIER');
        for (let i = 1; i < tiers.length; i++)
            if (BigInt(tiers[i]!.quantity) <= BigInt(tiers[i - 1]!.quantity) || BigInt(tiers[i]!.price) > BigInt(tiers[i - 1]!.price))
                throw new TypeError('INVALID_TIER');
        return { colorId: parseEntityId(o.colorId), sizeId: parseEntityId(o.sizeId), price: o.price === null ? null : integer(o.price, '999999999999999999999999999999'), tiers, stock: o.stock === null ? null : integer(o.stock, '2147483647', true) };
    });
    if (new Set(variants.map(v => v.colorId + v.sizeId)).size !== variants.length)
        throw new TypeError('DUPLICATE_SKU');
    const chart = collection(p.chart, 200).map(v => { const o = inputObject(v, ['sizeId', 'measurementId', 'cm']); return { sizeId: parseEntityId(o.sizeId), measurementId: parseEntityId(o.measurementId), cm: decimal(o.cm) }; });
    if (new Set(chart.map(v => v.sizeId + v.measurementId)).size !== chart.length)
        throw new TypeError('DUPLICATE_MEASUREMENT');
    if (chart.some(c => !variants.some(v => v.sizeId === c.sizeId)))
        throw new TypeError('SIZE_NOT_SELECTED');
    return { declaration, fabric, gsmKind, gsmMin, gsmMax, variants, chart, location: p.location === null ? null : inputText(p.location, 160) };
}
export function dictionaryFields(value: unknown) {
    const p = inputObject(value, ['kind', 'code', 'token', 'label', 'source']);
    const kind = inputText(p.kind, 32);
    if (!['COLOR', 'SIZE', 'COUNTRY', 'MEASUREMENT'].includes(kind))
        throw new TypeError('DICTIONARY_KIND');
    const code = inputText(p.code, 32), token = inputText(p.token, 16);
    if (!/^[A-Z0-9_]{1,32}$/.test(code) || !/^[A-Z0-9]{1,16}$/.test(token))
        throw new TypeError('DICTIONARY_CODE');
    return { kind, code, token, label: inputText(p.label, 160), source: inputText(p.source, 2000) };
}
