import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { invoiceId, targetId, nickname, packageName, paymentMethod, total } = body;

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      console.error("Telegram bot token or chat ID is missing");
      return NextResponse.json({ success: false, message: "Server configuration error" }, { status: 500 });
    }

    const message = `🔔 *PESANAN BARU MASUK!* 🔔\n\n` +
      `*Invoice:* \`${invoiceId}\`\n` +
      `*Item:* ${packageName}\n` +
      `*Target:* \`${targetId}\` ${nickname ? `(${nickname})` : ''}\n` +
      `*Metode:* ${paymentMethod}\n` +
      `*Total:* Rp ${Number(total).toLocaleString('id-ID')}\n\n` +
      `Cek Dashboard: https://gemartopup.vercel.app/admin`;

    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    
    const response = await fetch(url, {
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
      const errorData = await response.json();
      console.error("Telegram API Error:", errorData);
      return NextResponse.json({ success: false, message: "Failed to send Telegram message" }, { status: response.status });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Telegram Webhook Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
