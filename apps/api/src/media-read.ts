import { firebaseApp } from './firebase-app';

/** Fixed Google endpoint, existing ADC, pinned generation and a local byte bound.
 * Native fetch avoids the overlapping node-fetch/teeny-request/Storage pipelines.
 * No redirect, decompression allowance, listener-limit change or unbounded Buffer.
 */
export async function readPinnedMedia(name: string, generation: string, maxBytes: number, consume: (chunk: Buffer) => void): Promise<void> {
  const bucket = process.env.COOTTON_MEDIA_BUCKET;
  if (!bucket || !/^[a-z0-9][a-z0-9._-]{2,220}[a-z0-9]$/.test(bucket) || !name || name.length > 1024 || !/^[1-9][0-9]*$/.test(String(generation)) || !Number.isSafeInteger(maxBytes) || maxBytes < 1 || maxBytes > 8388608) throw new Error('MEDIA_READ_INVALID');
  const controller = new AbortController();
  let rejectDeadline: (reason: Error) => void = () => {};
  const deadline = new Promise<never>((_resolve, reject) => { rejectDeadline = reject; });
  const timer = setTimeout(() => { controller.abort(); rejectDeadline(new Error('MEDIA_READ_TIMEOUT')); }, 15000);
  timer.unref();
  let response: Response | undefined;
  let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
  try {
    const credential = firebaseApp().options.credential;
    if (!credential) throw new Error('MEDIA_CREDENTIAL_UNAVAILABLE');
    const token = await Promise.race([credential.getAccessToken(), deadline]);
    const url = 'https://storage.googleapis.com/storage/v1/b/' + encodeURIComponent(bucket) + '/o/' + encodeURIComponent(name) + '?alt=media&generation=' + encodeURIComponent(generation);
    response = await fetch(url, { method: 'GET', redirect: 'error', signal: controller.signal, headers: { Authorization: 'Bearer ' + token.access_token, 'Accept-Encoding': 'identity', 'Cache-Control': 'no-store', Range: 'bytes=0-' + maxBytes } });
    const encoding = response.headers.get('content-encoding');
    const returnedGeneration = response.headers.get('x-goog-generation');
    if (![200, 206].includes(response.status) || !response.body || (encoding !== null && encoding !== 'identity') || (returnedGeneration !== null && returnedGeneration !== generation)) throw new Error('MEDIA_RESPONSE_INVALID');
    reader = response.body.getReader();
    let total = 0;
    for (;;) {
      const value = await reader.read();
      if (value.done) break;
      if (value.value.byteLength > maxBytes - total) throw new Error('MEDIA_READ_BOUND');
      const chunk = Buffer.from(value.value);
      total += chunk.length;
      consume(chunk);
    }
    if (total !== maxBytes) throw new Error('MEDIA_READ_TRUNCATED');
  } finally {
    if (reader) { await reader.cancel().catch(() => {}); reader.releaseLock(); }
    else if (response?.body) await response.body.cancel().catch(() => {});
    clearTimeout(timer);
    controller.abort();
  }
}
