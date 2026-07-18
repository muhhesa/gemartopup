import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    // Jika token tidak di-set, return 200 agar tidak memblokir proses checkout
    if (!botToken || !chatId) {
      console.log('Telegram Bot Token or Chat ID is not configured.');
      return NextResponse.json({ success: true, warning: 'Telegram not configured' });
    }

    const { invoiceId, targetId, nickname, packageName, paymentMethod, price, total } = data;

    const message = `
🚨 *PESANAN BARU MASUK!* 🚨

*Invoice:* \`${invoiceId}\`
*Status:* ⏳ Menunggu Pembayaran
*Item:* ${packageName}
*Target ID:* \`${targetId}\` ${nickname ? `(${nickname})` : ''}
*Metode Bayar:* ${paymentMethod}
*Total Tagihan:* *Rp ${Number(total).toLocaleString('id-ID')}*

[Lihat Dashboard Admin](https://gemartopup.com/admin)
`;

    const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
    
    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown',
      }),
    });

    if (!response.ok) {
      throw new Error(`Telegram API Error: ${response.statusText}`);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error sending telegram notification:', error.message);
    // Kita tetap return success: false (status 500) tapi jangan sampai membuat checkout crash di client
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
