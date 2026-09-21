type Bucket = { count: number; reset: number };
const buckets = new Map<string, Bucket>();

export function checkRateLimit(key: string, max: number, windowMs: number) {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.reset <= now) { buckets.set(key, { count: 1, reset: now + windowMs }); return true; }
  if (bucket.count >= max) return false;
  bucket.count += 1;
  return true;
}

// In-memory limits are a defense-in-depth measure. Configure a distributed Vercel
// rate limiter for multi-instance production deployments; database duplicate guards remain authoritative.
