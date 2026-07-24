import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const gameId = searchParams.get('gameId');
    if (!gameId) {
      return NextResponse.json({ success: false, message: 'gameId wajib diisi' }, { status: 400 });
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ success: false, message: 'Server configuration error' }, { status: 500 });
    }
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data, error } = await supabaseAdmin
      .from('reviews')
      .select('id, rating, comment, display_name, created_at')
      .eq('game_id', gameId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;

    return NextResponse.json({ success: true, data: data || [] });
  } catch (error: any) {
    console.error('Error fetching reviews:', error.message);
    return NextResponse.json({ success: false, message: 'Failed to fetch reviews' }, { status: 500 });
  }
}
