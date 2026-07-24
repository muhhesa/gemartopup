import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Skema voucher tiered (sesuai simulasi margin: 0 produk jadi rugi/impas).
// <15rb = tanpa voucher, 15rb-50rb = Rp500, >50rb = Rp1.000
function voucherAmountFor(total: number): number {
  if (total >= 50000) return 1000;
  if (total >= 15000) return 500;
  return 0;
}

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const { allowed, retryAfterMs } = rateLimit(`review-submit:${ip}`, 10, 60_000);
    if (!allowed) {
      return NextResponse.json(
        { success: false, message: 'Terlalu banyak percobaan. Coba lagi sebentar.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(retryAfterMs / 1000)) } }
      );
    }

    const body = await req.json();
    const { invoiceId, rating, comment } = body;

    if (!invoiceId || typeof invoiceId !== 'string') {
      return NextResponse.json({ success: false, message: 'invoiceId wajib diisi' }, { status: 400 });
    }
    const ratingNum = Number(rating);
    if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return NextResponse.json({ success: false, message: 'Rating harus antara 1-5' }, { status: 400 });
    }
    const safeComment = typeof comment === 'string' ? comment.trim().slice(0, 500) : '';

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ success: false, message: 'Server configuration error' }, { status: 500 });
    }
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Validasi eksistensi & status di SERVER (bukan localStorage) — ini yang
    // sebelumnya bolong: siapa pun bisa "submit" review tanpa order valid.
    const { data: order, error: orderErr } = await supabaseAdmin
      .from('orders')
      .select('invoice_id, game_id, status, has_reviewed, total, nickname, target_id')
      .eq('invoice_id', invoiceId)
      .single();

    if (orderErr || !order) {
      return NextResponse.json({ success: false, message: 'Invoice tidak ditemukan' }, { status: 404 });
    }
    if (order.status !== 'SUCCESS') {
      return NextResponse.json(
        { success: false, message: 'Pesanan belum berhasil, belum bisa direview' },
        { status: 400 }
      );
    }
    if (order.has_reviewed) {
      return NextResponse.json(
        { success: false, message: 'Invoice ini sudah pernah memberi ulasan' },
        { status: 409 }
      );
    }

    const rawName: string = order.nickname || order.target_id || 'User';
    const displayName =
      rawName.length > 4
        ? `${rawName.substring(0, 4)}****${rawName.substring(rawName.length - 2)}`
        : `${rawName}****`;

    const gameId = order.game_id || invoiceId.split('-')[1]?.toLowerCase() || 'general';

    const { error: reviewErr } = await supabaseAdmin.from('reviews').insert([
      {
        invoice_id: invoiceId,
        game_id: gameId,
        rating: ratingNum,
        comment: safeComment || null,
        display_name: displayName,
      },
    ]);
    if (reviewErr) {
      console.error('Insert review error:', reviewErr);
      return NextResponse.json({ success: false, message: 'Gagal menyimpan ulasan' }, { status: 500 });
    }

    // Hitung & buat voucher reward (kalau nominal ordernya cukup besar).
    const amount = voucherAmountFor(Number(order.total) || 0);
    let voucherCode: string | null = null;

    if (amount > 0) {
      voucherCode = `REV-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
      const { error: voucherErr } = await supabaseAdmin.from('vouchers').insert([
        {
          code: voucherCode,
          amount,
          source_invoice_id: invoiceId,
        },
      ]);
      if (voucherErr) {
        console.error('Insert voucher error:', voucherErr);
        voucherCode = null; // review tetap sukses walau voucher gagal dibuat
      }
    }

    // Tandai has_reviewed = true di server supaya invoice yang sama tidak
    // bisa dipakai review berkali-kali walau localStorage dihapus/diakalin.
    await supabaseAdmin.from('orders').update({ has_reviewed: true }).eq('invoice_id', invoiceId);

    return NextResponse.json({ success: true, voucherCode, voucherAmount: amount });
  } catch (error: any) {
    console.error('Review API Error:', error.message);
    return NextResponse.json({ success: false, message: 'Terjadi kesalahan internal server' }, { status: 500 });
  }
}
