import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();

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

    // Initialize a Supabase client with the SERVICE ROLE KEY (bypasses RLS)
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const { data, error } = await supabaseAdmin
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("Error fetching orders:", error.message);
    return NextResponse.json({ success: false, message: "Failed to fetch orders" }, { status: 500 });
  }
}
