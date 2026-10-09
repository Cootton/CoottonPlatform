import { AsyncLocalStorage } from 'node:async_hooks';
import { performance } from 'node:perf_hooks';
import { randomUUID } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Pool, PoolClient } from 'pg';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { ServiceUnavailableException } from '@nestjs/common';

const context = new AsyncLocalStorage<CommandBudget>();
// Conservative source default fits within the observed 60s serving timeout.
// Higher values require a separately reviewed API/Web timeout configuration.
export function commandTimeoutMs(): number {
  const value = process.env.COOTTON_COMMAND_DEADLINE_MS ?? '45000';
  if (!/^[1-9][0-9]*$/.test(value) || Number(value) < 1000 || Number(value) > 150000) throw new Error('COMMAND_DEADLINE_CONFIG_INVALID');
  return Number(value);
}
export class CommandBudget {
  private readonly controller = new AbortController();
  private readonly ends: number;
  private readonly timer: ReturnType<typeof setTimeout>;
  private closed = false;
  readonly error = new ServiceUnavailableException('COMMAND_DEADLINE_EXCEEDED');
  constructor(milliseconds: number) {
    if (!Number.isSafeInteger(milliseconds) || milliseconds < 1 || milliseconds > 150000) throw new Error('COMMAND_DEADLINE_CONFIG_INVALID');
    this.ends = performance.now() + milliseconds;
    this.timer = setTimeout(() => this.cancel(), milliseconds);
    this.timer.unref();
  }
  get signal(): AbortSignal { return this.controller.signal; }
  assert(): void {
    if (performance.now() >= this.ends) this.cancel();
    if (this.closed || this.signal.aborted) throw this.error;
  }
  remaining(cap: number): number { this.assert(); return Math.max(1, Math.min(cap, Math.floor(this.ends - performance.now()))); }
  cancel(): void { if (!this.signal.aborted) this.controller.abort(this.error); }
  dispose(): void { clearTimeout(this.timer); this.closed = true; this.cancel(); }
  // Cancellable/read-only waits return promptly. Observe late rejection/result;
  // callers owning a resource must provide cancellation or late disposal.
  wait<T>(task: () => Promise<T>, cancel: () => void = () => {}): Promise<T> {
    this.assert();
    return new Promise<T>((resolve, reject) => {
      let settled = false;
      const finish = (error: unknown, value?: T) => {
        if (settled) return;
        settled = true; this.signal.removeEventListener('abort', abort);
        if (error) reject(error); else resolve(value as T);
      };
      const abort = () => { try { cancel(); } catch {} finish(this.error); };
      this.signal.addEventListener('abort', abort, { once: true });
      try {
        Promise.resolve(task()).then(value => {
          try { this.assert(); finish(null, value); } catch (error) { finish(error); }
        }, error => finish(error));
      } catch (error) { finish(error); }
    });
  }
}
export const commandBudget = (): CommandBudget | undefined => context.getStore();
export function inCommandBudget<T>(budget: CommandBudget, task: () => T): T { return context.run(budget, task); }
export function assertCommandActive(): void { commandBudget()?.assert(); }
export async function commandWait<T>(task: () => Promise<T>, cancel?: () => void): Promise<T> {
  const budget = commandBudget(); return budget ? budget.wait(task, cancel) : task();
}
// Do not race an opaque immutable SDK write and release the media-processing
// slot early. HTTP may already have returned503; wait for settlement, then
// forbid poster/SQL/COMMIT follow-ups. Dispatched remote outcome is uncertain.
export async function commandWrite<T>(task: () => Promise<T>): Promise<T> {
  assertCommandActive(); const value = await task(); assertCommandActive(); return value;
}

const execute = promisify(execFile);
export async function executeCommandFile(file: string, args: string[], timeout: number) {
  const budget = commandBudget(); budget?.assert();
  const pending = execute(file, args, { timeout: budget?.remaining(timeout) ?? timeout, signal: budget?.signal, killSignal: 'SIGKILL', maxBuffer: 262144 });
  // AbortError may arrive before process close. Keep the media slot and temp
  // directory alive until the directly spawned encoder has actually closed.
  const closed = new Promise<void>(resolve => pending.child.once('close', () => resolve()));
  try { const result = await pending; budget?.assert(); return result; }
  finally { await closed; }
}

/** Scoped promise-only adapter; never changes credentials, TLS or role grants. */
export function commandPool(pool: Pool): Pool {
  const budget = commandBudget(); if (!budget) return pool;
  const connect = async (): Promise<PoolClient> => budget.wait(async () => {
    const raw = await pool.connect();
    try { budget.assert(); } catch (error) { raw.release(true); throw error; }
    let released = false;
    const release = (destroy = false) => {
      if (released) return;
      released = true; budget.signal.removeEventListener('abort', abort); raw.removeListener('error', connectionError); raw.release(destroy);
    };
    const abort = () => release(true);
    const connectionError = () => budget.cancel();
    budget.signal.addEventListener('abort', abort, { once: true }); raw.on('error', connectionError);
    return new Proxy(raw, { get(target, property) {
      if (property === 'release') return release;
      if (property === 'query') return async (...args: unknown[]) => {
        budget.assert(); if (released) throw budget.error;
        try { return await budget.wait(() => (target.query as (...values: unknown[]) => Promise<unknown>).apply(target, args), abort); }
        catch (error) { release(true); throw error; }
      };
      const value = Reflect.get(target, property); return typeof value === 'function' ? value.bind(target) : value;
    }});
  });
  return new Proxy(pool, { get(target, property) {
    if (property === 'connect') return connect;
    if (property === 'query') return async (...args: unknown[]) => {
      const client = await connect();
      try { return await (client.query as (...values: unknown[]) => Promise<unknown>)(...args); }
      finally { client.release(); }
    };
    const value = Reflect.get(target, property); return typeof value === 'function' ? value.bind(target) : value;
  }});
}

export function commandDeadlineMiddleware(milliseconds = commandTimeoutMs()) {
  return (request: IncomingMessage & { path?: string }, response: ServerResponse, next: () => void): void => {
    if (request.method !== 'POST' || request.path?.toLowerCase().replace(/\/+$/, '') !== '/v1/admin/catalog/commands') { next(); return; }
    const budget = new CommandBudget(milliseconds);
    const cancel = () => budget.cancel();
    const close = () => { if (!response.writableFinished) budget.cancel(); cleanup(); };
    const expired = () => {
      if (response.destroyed || response.writableEnded || response.headersSent) return;
      response.statusCode = 503;
      response.setHeader('Content-Type', 'application/json'); response.setHeader('Cache-Control', 'no-store'); response.setHeader('X-Content-Type-Options', 'nosniff'); response.setHeader('Connection', 'close');
      response.end(JSON.stringify({ code: 'UNAVAILABLE', message: 'UNAVAILABLE', requestId: randomUUID() }));
    };
    const cleanup = () => {
      request.removeListener('aborted', cancel); response.removeListener('finish', cleanup); response.removeListener('close', close); budget.signal.removeEventListener('abort', expired); budget.dispose();
    };
    request.once('aborted', cancel); response.once('close', close); response.once('finish', cleanup); budget.signal.addEventListener('abort', expired, { once: true });
    inCommandBudget(budget, next);
  };
}
