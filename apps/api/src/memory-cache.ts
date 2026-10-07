import { Global, Injectable, Module } from '@nestjs/common';

type Entry = { json: string; expires: number; bytes: number };
/** Public DTOs only. No credentials, private data or media bytes. */
@Injectable()
export class MemoryCache {
  private entries = new Map<string, Entry>();
  private pending = new Map<string, Promise<string>>();
  private generation = 0;
  private bytes = 0;
  private counters = { hits: 0, misses: 0, evictions: 0, coalesced: 0 };
  constructor(private readonly limits = { bytes: 16 * 1024 * 1024, entries: 1000, itemBytes: 256 * 1024, pending: 100 }, private readonly now = () => performance.now()) {}

  /** Called only after a canonical transaction commits. Old reads cannot repopulate. */
  invalidate(): void { this.generation++; this.entries.clear(); this.bytes = 0; }
  stats() { return { ...this.counters, entries: this.entries.size, bytes: this.bytes, pending: this.pending.size }; }
  private remove(key: string): void { const e = this.entries.get(key); if (e) { this.bytes -= e.bytes; this.entries.delete(key); } }
  async read<T>(key: string, ttlMs: number, load: () => Promise<T>, validate?: (value: T) => Promise<boolean>): Promise<T> {
    if (process.env.COOTTON_CACHE_DISABLED === 'true') return load();
    const generation = this.generation;
    const entry = this.entries.get(key);
    if (entry && entry.expires > this.now()) {
      const value = JSON.parse(entry.json) as T;
      // Fail closed on validation errors; never serve stale on database failure.
      if ((!validate || await validate(value)) && generation === this.generation && entry.expires > this.now()) {
        this.entries.delete(key); this.entries.set(key, entry); this.counters.hits++; return value;
      }
      if (this.entries.get(key) === entry) this.remove(key);
    } else if (entry) this.remove(key);
    this.counters.misses++;
    const flightKey = generation + ':' + key;
    const existing = this.pending.get(flightKey);
    if (existing) { this.counters.coalesced++; return JSON.parse(await existing) as T; }
    // Bound unique in-flight keys as well as retained cache entries.
    if (this.pending.size >= this.limits.pending) return load();
    const work = (async () => {
      const json = JSON.stringify(await load());
      const bytes = Buffer.byteLength(key) + Buffer.byteLength(json);
      if (generation === this.generation && ttlMs > 0 && bytes <= this.limits.itemBytes && bytes <= this.limits.bytes) {
        for (const [k, e] of this.entries) if (e.expires <= this.now()) this.remove(k);
        this.remove(key);
        while (this.entries.size && (this.entries.size >= this.limits.entries || this.bytes + bytes > this.limits.bytes)) {
          this.remove(this.entries.keys().next().value!); this.counters.evictions++;
        }
        this.entries.set(key, { json, bytes, expires: this.now() + ttlMs * (0.9 + Math.random() * 0.1) }); this.bytes += bytes;
      }
      return json;
    })();
    this.pending.set(flightKey, work);
    try { return JSON.parse(await work) as T; }
    finally { if (this.pending.get(flightKey) === work) this.pending.delete(flightKey); }
  }
}

@Global()
@Module({ providers: [{ provide: MemoryCache, useFactory: () => new MemoryCache() }], exports: [MemoryCache] })
export class MemoryCacheModule {}
