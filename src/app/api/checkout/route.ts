import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import catalogData from "@/data/catalog.json";
import { sendTelegramNotification } from "@/lib/telegram";
import { rateLimit, getClientIp } from "@/lib/rateLimit";

// Inisialisasi Supabase menggunakan Service Role Key agar bisa menembus RLS
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Data metode pembayaran dipindah ke backend agar aman
const PAYMENTS = [
  { id: "ewallet", name: "OVO / GOPAY / DANA", type: "E-Wallet", fee: 0 },
  { id: "bri", name: "Bank BRI", type: "Bank Transfer", fee: 0 },
  { id: "bca", name: "Bank BCA", type: "Bank Transfer", fee: 0 },
];

export async function POST(req: Request) {
  try {
    // Rate limit: 8 pesanan / menit per IP, cukup untuk pemakaian normal
    // tapi mempersulit spam checkout otomatis.
    const ip = getClientIp(req);
    const { allowed, retryAfterMs } = rateLimit(`checkout:${ip}`, 8, 60_000);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Terlalu banyak percobaan checkout. Coba lagi sebentar.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(retryAfterMs / 1000)) } }
      );
    }

    const data = await req.json();
    const { gameId, nominalId, paymentId, targetId, nickname, whatsapp } = data;

    // 0. Validasi Input Dasar
    if (!targetId || typeof targetId !== 'string' || targetId.trim().length === 0) {
      return NextResponse.json({ error: 'Target ID wajib diisi' }, { status: 400 });
    }
    if (!whatsapp || typeof whatsapp !== 'string' || whatsapp.length < 9 || whatsapp.length > 20) {
      return NextResponse.json({ error: 'Nomor WhatsApp tidak valid' }, { status: 400 });
    }

    // 1. Validasi Game
    const game = catalogData.games.find(g => g.id === gameId);
    if (!game) {
      return NextResponse.json({ error: 'Game tidak ditemukan' }, { status: 400 });
    }

    // 2. Validasi Nominal & Ambil Harga Asli dari Server
    const nominalsList = (catalogData.products as any)[gameId] || [];
    const nominalData = nominalsList.find((n: any) => n.id === nominalId);
    if (!nominalData) {
      return NextResponse.json({ error: 'Paket tidak valid' }, { status: 400 });
    }

    // 3. Validasi Metode Bayar & Ambil Fee Asli dari Server
    const paymentData = PAYMENTS.find(p => p.id === paymentId);
    if (!paymentData) {
      return NextResponse.json({ error: 'Metode pembayaran tidak valid' }, { status: 400 });
    }

    // 4. Kalkulasi Total di Backend
    const price = nominalData.price;
    const fee = paymentData.fee;
    const totalPrice = price + fee;
    const packageName = `${nominalData.name} (${game.name})`;
    const paymentMethod = paymentData.name;

    // 5. Buat Invoice ID
    // Pakai crypto.randomBytes (bukan Math.random) supaya tidak predictable,
    // dan panjang token cukup besar (12 karakter hex = 48 bit entropy) supaya
    // tidak feasible di-brute-force lewat endpoint /api/invoice/[invoiceId].
    const invoiceId = `INV-${game.code}-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;

    // 6. Buat Data Pesanan (Status dipaksa AWAITING_PAYMENT)
    const dbInsertData = {
      invoice_id: invoiceId,
      target_id: targetId,
      nickname: nickname || null,
      package_name: packageName,
      payment_method: paymentMethod,
      price: price,
      fee: fee,
      total: totalPrice,
      status: 'AWAITING_PAYMENT'
    };

    // 7. Simpan ke Supabase menggunakan Admin Key (Kebal RLS)
    const { error: insertError } = await supabaseAdmin.from('orders').insert([dbInsertData]);

    if (insertError) {
      console.error("Supabase Insert Error:", insertError);
      return NextResponse.json({ error: 'Gagal menyimpan pesanan ke database' }, { status: 500 });
    }

    // 8. Kirim Notifikasi Telegram
    try {
      const message = `🚨 <b>PESANAN BARU MASUK!</b> 🚨

<b>Invoice:</b> <code>${invoiceId}</code>
<b>Status:</b> ⏳ Menunggu Pembayaran
<b>Item:</b> ${packageName}
<b>Target ID:</b> <code>${targetId}</code> ${nickname ? `(${nickname})` : ''}
<b>WA Pelanggan:</b> ${whatsapp ? `<a href="https://wa.me/${whatsapp}">${whatsapp}</a>` : '-'}
<b>Metode Bayar:</b> ${paymentMethod}
<b>Total Tagihan:</b> <b>Rp ${Number(totalPrice).toLocaleString('id-ID')}</b>

<a href="https://gemartopup.vercel.app/admin">Lihat Dashboard Admin</a>`;
      await sendTelegramNotification(message);
    } catch (notifyErr) {
      console.error('Failed to send notification:', notifyErr);
      // Walaupun notif gagal, pesanan tetap sukses
    }

    // 9. Kembalikan respons sukses ke Client
    const orderData = {
      ...dbInsertData,
      game_id: gameId,
      whatsapp: whatsapp
    };

    return NextResponse.json({ 
      success: true, 
      invoiceId, 
      orderData 
    });

  } catch (error: any) {
    console.error('Checkout API Error:', error.message);
    return NextResponse.json({ error: 'Terjadi kesalahan internal server' }, { status: 500 });
  }
}
