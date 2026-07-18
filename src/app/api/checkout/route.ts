import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import catalogData from "@/data/catalog.json";

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
    const data = await req.json();
    const { gameId, nominalId, paymentId, targetId, nickname } = data;

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
    const invoiceId = `INV-${game.code}-${Math.floor(Math.random() * 1000000)}`;

    // 6. Buat Data Pesanan (Status dipaksa AWAITING_PAYMENT)
    const orderData = {
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
    const { error: insertError } = await supabaseAdmin.from('orders').insert([orderData]);

    if (insertError) {
      console.error("Supabase Insert Error:", insertError);
      return NextResponse.json({ error: 'Gagal menyimpan pesanan ke database' }, { status: 500 });
    }

    // 8. Kirim Notifikasi Telegram
    try {
      // Kita panggil API notify lokal
      const protocol = req.headers.get('x-forwarded-proto') || 'http';
      const host = req.headers.get('host');
      const baseUrl = `${protocol}://${host}`;

      await fetch(`${baseUrl}/api/notify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId,
          targetId,
          nickname: orderData.nickname,
          packageName,
          paymentMethod,
          price,
          total: totalPrice
        })
      });
    } catch (notifyErr) {
      console.error('Failed to send notification via internal API:', notifyErr);
      // Walaupun notif gagal, pesanan tetap sukses
    }

    // 9. Kembalikan respons sukses ke Client
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
