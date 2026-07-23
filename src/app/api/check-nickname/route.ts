import { NextResponse } from 'next/server';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

// Mapping gameId di katalog lo -> slug endpoint isan.eu.org
// paramMode: 'id' = cuma butuh id, 'id_server' = butuh id + server(zoneId)
const NICKNAME_API_MAP: Record<string, { slug: string; paramMode: 'id' | 'id_server' }> = {
  'mlbb': { slug: 'ml', paramMode: 'id_server' },
  'aov': { slug: 'aov', paramMode: 'id' },
  'ff': { slug: 'ff', paramMode: 'id' },
  'call-of-duty-mobile': { slug: 'codm', paramMode: 'id' },
  'valo': { slug: 'valo', paramMode: 'id' }, // id = "Name#Tag"
  'genshin': { slug: 'gi', paramMode: 'id_server' },
  'honkai--star-rail': { slug: 'hsr', paramMode: 'id_server' },
};

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const { allowed } = rateLimit(`check-nickname:${ip}`, 15, 60_000);
  if (!allowed) {
    return NextResponse.json({ success: false, message: 'Terlalu banyak percobaan, coba lagi sebentar.' }, { status: 429 });
  }

  const { gameId, userId, zoneId } = await req.json();

  const mapping = NICKNAME_API_MAP[gameId];
  if (!mapping) {
    // Game ini belum didukung API otomatis -> biarkan lolos, verifikasi manual oleh admin
    return NextResponse.json({ success: false, unsupported: true, message: 'Verifikasi otomatis belum tersedia untuk game ini.' });
  }

  if (!userId || (mapping.paramMode === 'id_server' && !zoneId)) {
    return NextResponse.json({ success: false, message: 'Data tidak lengkap.' }, { status: 400 });
  }

  try {
    const params = new URLSearchParams({ id: userId });
    if (mapping.paramMode === 'id_server') params.set('server', zoneId);

    const upstream = await fetch(`https://api.isan.eu.org/nickname/${mapping.slug}?${params.toString()}`, {
      signal: AbortSignal.timeout(8000),
    });
    const data = await upstream.json();

    if (data.success && data.name) {
      return NextResponse.json({ success: true, nickname: data.name });
    }
    return NextResponse.json({ success: false, message: 'Akun tidak ditemukan / ID salah.' });
  } catch (err) {
    console.error('Nickname check error:', err);
    return NextResponse.json({ success: false, message: 'Layanan cek nickname sedang gangguan, coba lagi.' }, { status: 502 });
  }
}