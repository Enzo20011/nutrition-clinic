/**
 * In-Memory Rate Limiter — Zero dependencies, works on Vercel/Edge/Serverless
 *
 * Strategy: Sliding Window. Stores request timestamps per IP in a global Map.
 * The Map auto-purges old entries to avoid memory leaks.
 */

interface RateLimitEntry {
  timestamps: number[];
}

// Global map — persists across requests within the same process
const store = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  store.forEach((entry, key) => {
    if (entry.timestamps.every(ts => ts < now - 60_000 * 60)) {
      store.delete(key);
    }
  });
}, 5 * 60 * 1000);

interface RateLimitOptions {
  /** Max requests allowed in the window */
  limit: number;
  /** Window size in milliseconds */
  windowMs: number;
}

interface RateLimitResult {
  ok: boolean;
  remaining: number;
  resetAt: Date;
}

/**
 * Check rate limit for a given identifier (usually IP address).
 *
 * @example
 * const { ok, remaining } = checkRateLimit(ip, { limit: 5, windowMs: 60_000 });
 * if (!ok) return NextResponse.json({ error: 'Demasiadas solicitudes. Intente en unos minutos.' }, { status: 429 });
 */
export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions
): RateLimitResult {
  const now = Date.now();
  const windowStart = now - options.windowMs;

  const entry = store.get(identifier) ?? { timestamps: [] };

  // Filter only timestamps within the current window
  entry.timestamps = entry.timestamps.filter(ts => ts > windowStart);

  const ok = entry.timestamps.length < options.limit;
  
  if (ok) {
    entry.timestamps.push(now);
    store.set(identifier, entry);
  }

  const oldest = entry.timestamps[0] ?? now;
  const resetAt = new Date(oldest + options.windowMs);

  return {
    ok,
    remaining: Math.max(0, options.limit - entry.timestamps.length),
    resetAt,
  };
}

/**
 * Extract the real client IP from a Next.js request.
 * Handles Vercel, Cloudflare, and direct connections.
 */
export function getClientIP(req: Request): string {
  const headers = req.headers as Headers;
  return (
    headers.get('x-real-ip') ??
    headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    '127.0.0.1'
  );
}
