// Simple in-memory rate limiter.
//
// CATATAN PENTING (baca sebelum production):
// Ini menyimpan counter di memory proses Node. Di Vercel serverless,
// tiap "cold start" / instance function terpisah bisa punya memory sendiri-sendiri,
// jadi limit ini TIDAK 100% akurat kalau traffic besar dan di-load-balance ke banyak
// instance. Untuk proteksi yang solid & konsisten lintas instance, ganti dengan
// Upstash Redis (@upstash/ratelimit) — gratis untuk trafik kecil-menengah.
//
// Tapi untuk sekarang, ini tetap jauh lebih baik daripada tanpa rate limit sama sekali:
// tetap akan memperlambat/memblokir brute-force sederhana pada instance yang sama.

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

// Bersihkan bucket kadaluarsa secara berkala supaya memory tidak terus tumbuh.
let lastCleanup = Date.now();
function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < 60_000) return;
  lastCleanup = now;
  for (const [key, bucket] of buckets.entries()) {
    if (bucket.resetAt < now) buckets.delete(key);
  }
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;
  return "unknown";
}

/**
 * Rate limit sederhana berbasis fixed window.
 * @param key Identifier unik, biasanya `${routeName}:${ip}`
 * @param limit Jumlah request maksimum dalam window
 * @param windowMs Panjang window dalam milidetik
 * @returns { allowed, remaining, retryAfterMs }
 */
export function rateLimit(key: string, limit: number, windowMs: number) {
  cleanup();
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, retryAfterMs: 0 };
  }

  if (existing.count >= limit) {
    return { allowed: false, remaining: 0, retryAfterMs: existing.resetAt - now };
  }

  existing.count += 1;
  return { allowed: true, remaining: limit - existing.count, retryAfterMs: 0 };
}
