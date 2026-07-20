import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import { createSessionToken, getSessionCookieOptions } from '@/lib/adminAuth';

export async function POST(request: Request) {
  try {
    // Rate limit ketat: 5 percobaan login / 5 menit per IP, untuk mencegah
    // brute-force ADMIN_PASSWORD.
    const ip = getClientIp(request);
    const { allowed, retryAfterMs } = rateLimit(`admin-login:${ip}`, 5, 5 * 60_000);
    if (!allowed) {
      return NextResponse.json(
        { success: false, message: 'Terlalu banyak percobaan login. Coba lagi nanti.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(retryAfterMs / 1000)) } }
      );
    }

    const { password } = await request.json();

    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword || !password) {
      return NextResponse.json({ success: false, message: "Server configuration error" }, { status: 500 });
    }

    // Constant-time compare supaya tidak bocor lewat timing attack
    const passwordBuf = Buffer.from(String(password));
    const adminBuf = Buffer.from(adminPassword);
    const isMatch =
      passwordBuf.length === adminBuf.length &&
      crypto.timingSafeEqual(passwordBuf, adminBuf);

    if (!isMatch) {
      return NextResponse.json({ success: false, message: "Invalid password" }, { status: 401 });
    }

    // Login sukses -> buat session token, simpan di httpOnly cookie.
    // Setelah ini, request berikutnya (orders, update-status) tidak perlu
    // kirim ulang password mentah lagi.
    const token = createSessionToken();
    const cookieOpts = getSessionCookieOptions();

    const res = NextResponse.json({ success: true });
    res.cookies.set(cookieOpts.name, token, {
      httpOnly: cookieOpts.httpOnly,
      secure: cookieOpts.secure,
      sameSite: cookieOpts.sameSite,
      path: cookieOpts.path,
      maxAge: cookieOpts.maxAge,
    });
    return res;
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
