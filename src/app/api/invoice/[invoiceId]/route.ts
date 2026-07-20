import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

// Kolom yang aman untuk ditampilkan ke publik lewat halaman invoice.
// Sengaja TIDAK menyertakan kolom seperti nomor WhatsApp / kontak pelanggan,
// meskipun kolom itu ada di tabel — supaya endpoint ini tidak jadi sumber
// kebocoran data pribadi walau invoice_id-nya berhasil ditebak orang lain.
const SAFE_INVOICE_COLUMNS = [
  'invoice_id',
  'target_id',
  'nickname',
  'package_name',
  'payment_method',
  'price',
  'fee',
  'total',
  'status',
  'created_at',
  'game_id',
].join(', ');

export async function GET(request: Request, { params }: { params: Promise<{ invoiceId: string }> }) {
  try {
    // Rate limit: 30 request / menit per IP. Invoice ini dipoll tiap 5 detik oleh
    // halaman invoice, jadi 30/menit cukup longgar untuk pemakaian normal tapi
    // tetap membatasi percobaan brute-force invoice ID.
    const ip = getClientIp(request);
    const { allowed, retryAfterMs } = rateLimit(`invoice:${ip}`, 30, 60_000);
    if (!allowed) {
      return NextResponse.json(
        { success: false, message: 'Terlalu banyak percobaan. Coba lagi sebentar.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(retryAfterMs / 1000)) } }
      );
    }

    const { invoiceId } = await params;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ success: false, message: "Server configuration error" }, { status: 500 });
    }

    // Initialize a Supabase client with the SERVICE ROLE KEY
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const { data, error } = await supabaseAdmin
      .from("orders")
      .select(SAFE_INVOICE_COLUMNS)
      .eq("invoice_id", invoiceId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Not found
        return NextResponse.json({ success: false, message: "Invoice not found" }, { status: 404 });
      }
      throw error;
    }

    // Return the safe data only (lihat SAFE_INVOICE_COLUMNS di atas)
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("Error fetching invoice:", error.message);
    return NextResponse.json({ success: false, message: "Failed to fetch invoice" }, { status: 500 });
  }
}
