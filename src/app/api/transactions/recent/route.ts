import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Pastikan force-dynamic agar API tidak di-cache oleh Vercel
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ success: false, message: "Server configuration error" }, { status: 500 });
    }

    // Gunakan Kunci Master agar bisa menembus RLS
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Ambil 15 transaksi terakhir
    const { data, error } = await supabaseAdmin
      .from("orders")
      .select("created_at, invoice_id, package_name, price, status")
      .order("created_at", { ascending: false })
      .limit(15);

    if (error) {
      throw error;
    }

    // SENSOR OTOMATIS: Masking nomor invoice (misal: INV-MLBB-123456 -> INV-MLBB-12***56)
    const safeData = data.map((order: any) => {
      let maskedInvoice = order.invoice_id;
      if (maskedInvoice && maskedInvoice.length > 8) {
        const prefix = maskedInvoice.substring(0, maskedInvoice.length - 5);
        const suffix = maskedInvoice.substring(maskedInvoice.length - 2);
        maskedInvoice = `${prefix}***${suffix}`;
      }

      return {
        ...order,
        invoice_id: maskedInvoice
      };
    });

    return NextResponse.json({ success: true, data: safeData });
  } catch (error: any) {
    console.error("Error fetching recent transactions:", error.message);
    return NextResponse.json({ success: false, message: "Failed to fetch transactions" }, { status: 500 });
  }
}
