import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request, { params }: { params: { invoiceId: string } }) {
  try {
    const { invoiceId } = params;

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
      .select("*")
      .eq("invoice_id", invoiceId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Not found
        return NextResponse.json({ success: false, message: "Invoice not found" }, { status: 404 });
      }
      throw error;
    }

    // Return the safe data
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("Error fetching invoice:", error.message);
    return NextResponse.json({ success: false, message: "Failed to fetch invoice" }, { status: 500 });
  }
}
