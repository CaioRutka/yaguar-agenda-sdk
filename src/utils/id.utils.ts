/**
 * ID generation helper.
 *
 * Prefers the platform `crypto.randomUUID()` (isomorphic: available in modern
 * browsers and Node >= 19), falling back to a timestamp + random suffix when
 * unavailable so the SDK never throws on exotic runtimes.
 */

interface CryptoLike {
  randomUUID?: () => string;
}

function randomFallback(): string {
  const time = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 10);
  return `${time}${rand}`;
}

export function generateId(prefix?: string): string {
  const cryptoObj = (globalThis as { crypto?: CryptoLike }).crypto;
  const uuid =
    cryptoObj && typeof cryptoObj.randomUUID === "function"
      ? cryptoObj.randomUUID()
      : randomFallback();
  return prefix ? `${prefix}_${uuid}` : uuid;
}
