import fetch from 'node-fetch';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const BASE_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;

export class TelegramService {
  
  static async createInvoiceLink(chatId: string, title: string, description: string, payload: string, starsAmount: number): Promise<string> {
    const response = await fetch(`${BASE_URL}/createInvoiceLink`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title, description, payload,
        provider_token: "", currency: "XTR",
        prices: [{ label: title, amount: starsAmount }]
      })
    });

    const data: any = await response.json();
    if (!data.ok) throw new Error(`Telegram API Error: ${data.description}`);
    return data.result;
  }
}
