import fetch from 'node-fetch';
import { createHmac } from 'crypto';
import dotenv from 'dotenv';
dotenv.config();
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;

function getMockInitData(userId: number) {
  const user = JSON.stringify({ id: userId, first_name: 'Sim', username: 'bot' });
  const authDate = Math.floor(Date.now() / 1000);
  const dataString = `auth_date=${authDate}\nuser=${user}`;
  const secretKey = createHmac('sha256', 'WebAppData').update(BOT_TOKEN).digest();
  const hash = createHmac('sha256', secretKey).update(dataString).digest('hex');
  return `auth_date=${authDate}&user=${encodeURIComponent(user)}&hash=${hash}`;
}

async function simulateTick(userId: number, hours: number) {
  const payload = { events: [{ type: 'TICK_OFFLINE', timestamp: Date.now(), deltaMs: hours * 3600000 }] };
  const res = await fetch('http://localhost:3000/api/v1/game/sync', {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Telegram-Init-Data': getMockInitData(userId) },
    body: JSON.stringify(payload)
  });
  const data: any = await res.json();
  console.log(data.error ? `❌ Error: ${data.error}` : `✅ Success! New Balance: ${(Number(data.state.resources.NP) / 10000).toFixed(2)} NP`);
}
simulateTick(parseInt(process.argv[2] || '999999'), parseFloat(process.argv[3] || '24'));
