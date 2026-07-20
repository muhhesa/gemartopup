import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isAuthenticatedRequest } from '@/lib/adminAuth';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const { allowed, retryAfterMs } = rateLimit(`admin-update-status:${ip}`, 60, 60_000);
    if (!allowed) {
      return NextResponse.json(
        { success: false, message: 'Terlalu banyak request. Coba lagi sebentar.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(retryAfterMs / 1000)) } }
      );
    }

    // Auth sekarang lewat session cookie httpOnly, bukan password di body lagi.
    if (!isAuthenticatedRequest(request)) {
      return NextResponse.json({ success: false, message: "Unauthorized: session tidak valid, silakan login ulang" }, { status: 401 });
    }

    const body = await request.json();
    const { invoiceId, newStatus } = body;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Server configuration error: missing supabase keys.");
      return NextResponse.json({ success: false, message: "Server configuration error" }, { status: 500 });
    }

    const VALID_STATUSES = ['AWAITING_PAYMENT', 'PROCESS', 'PENDING', 'SUCCESS', 'FAILED', 'EXPIRED'];
    if (!newStatus || !VALID_STATUSES.includes(newStatus)) {
      return NextResponse.json({ success: false, message: `Status tidak valid. Harus salah satu dari: ${VALID_STATUSES.join(', ')}` }, { status: 400 });
    }
    if (!invoiceId || typeof invoiceId !== 'string') {
      return NextResponse.json({ success: false, message: 'invoiceId wajib diisi' }, { status: 400 });
    }

    // Initialize a Supabase client with the SERVICE ROLE KEY (bypasses RLS)
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const { error } = await supabaseAdmin
      .from("orders")
      .update({ status: newStatus })
      .eq("invoice_id", invoiceId);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, message: "Status updated successfully" });
  } catch (error: any) {
    console.error("Error updating status:", error.message);
    return NextResponse.json({ success: false, message: "Failed to update status" }, { status: 500 });
  }
}
