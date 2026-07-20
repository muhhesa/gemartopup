import crypto from "crypto";

const SESSION_COOKIE_NAME = "gemartopup_admin_session";
const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 jam

function getSecret(): string {
  // Idealnya pakai secret terpisah (ADMIN_SESSION_SECRET) supaya kalaupun
  // token bocor, password admin tidak ikut ter-derive. Tapi biar tidak perlu
  // env var baru untuk deploy cepat, kita fallback ke ADMIN_PASSWORD.
  // REKOMENDASI: tambahkan ADMIN_SESSION_SECRET di .env (string acak panjang)
  // lalu set env itu di Vercel.
  const secret = process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD;
  if (!secret) throw new Error("Missing ADMIN_SESSION_SECRET / ADMIN_PASSWORD env");
  return secret;
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", getSecret()).update(payload).digest("hex");
}

/** Buat session token baru: base64(expiresAt).base64(signature) */
export function createSessionToken(): string {
  const expiresAt = Date.now() + SESSION_TTL_MS;
  const payload = String(expiresAt);
  const signature = sign(payload);
  return Buffer.from(`${payload}.${signature}`).toString("base64url");
}

/** Verifikasi session token dari cookie. Return true kalau valid & belum expired. */
export function verifySessionToken(token: string | undefined | null): boolean {
  if (!token) return false;
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const [payload, signature] = decoded.split(".");
    if (!payload || !signature) return false;

    const expectedSignature = sign(payload);
    // Constant-time compare supaya tidak rentan timing attack
    const sigBuf = Buffer.from(signature);
    const expectedBuf = Buffer.from(expectedSignature);
    if (sigBuf.length !== expectedBuf.length) return false;
    if (!crypto.timingSafeEqual(sigBuf, expectedBuf)) return false;

    const expiresAt = Number(payload);
    if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) return false;

    return true;
  } catch {
    return false;
  }
}

export function getSessionCookieOptions() {
  return {
    name: SESSION_COOKIE_NAME,
    httpOnly: true,
    secure: true,
    sameSite: "strict" as const,
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  };
}

export { SESSION_COOKIE_NAME };

/** Helper untuk baca & verifikasi cookie session langsung dari Request (Next.js Route Handler). */
export function isAuthenticatedRequest(request: Request): boolean {
  const cookieHeader = request.headers.get("cookie") || "";
  const match = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${SESSION_COOKIE_NAME}=`));
  if (!match) return false;
  const token = decodeURIComponent(match.split("=").slice(1).join("="));
  return verifySessionToken(token);
}
