import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { invoiceId, newStatus, password } = body;

    const adminPassword = process.env.ADMIN_PASSWORD;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!adminPassword || !supabaseUrl || !supabaseServiceKey) {
      console.error("Server configuration error: missing admin password or supabase keys.");
      return NextResponse.json({ success: false, message: "Server configuration error" }, { status: 500 });
    }

    if (password !== adminPassword) {
      return NextResponse.json({ success: false, message: "Unauthorized: Invalid password" }, { status: 401 });
    }

    const VALID_STATUSES = ['AWAITING_PAYMENT', 'PROCESS', 'PENDING', 'SUCCESS', 'FAILED', 'EXPIRED'];
    if (!newStatus || !VALID_STATUSES.includes(newStatus)) {
      return NextResponse.json({ success: false, message: `Status tidak valid. Harus salah satu dari: ${VALID_STATUSES.join(', ')}` }, { status: 400 });
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
