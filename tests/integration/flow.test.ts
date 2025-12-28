import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createHmac } from 'crypto';
import { PrismaClient } from '@prisma/client';
import fetch from 'node-fetch';

const API_URL = 'http://localhost:3000/api/v1';
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '123456789:ABCdefGHIjklMNOpqRSTuvwXYZ';
const TEST_USER_ID = 999999;
const prisma = new PrismaClient();

function generateMockInitData(userId: number): string {
  const user = JSON.stringify({ id: userId, first_name: 'Test', username: 'testuser' });
  const authDate = Math.floor(Date.now() / 1000);
  const dataString = `auth_date=${authDate}\nuser=${user}`;
  const secretKey = createHmac('sha256', 'WebAppData').update(BOT_TOKEN).digest();
  const hash = createHmac('sha256', secretKey).update(dataString).digest('hex');
  return `auth_date=${authDate}&user=${encodeURIComponent(user)}&hash=${hash}`;
}

async function apiCall(endpoint: string, method: 'GET' | 'POST', body?: any, initData?: string) {
  const headers: any = { 'Content-Type': 'application/json' };
  if (initData) headers['X-Telegram-Init-Data'] = initData;
  const res = await fetch(`${API_URL}${endpoint}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || `API Error ${res.status}`);
  return json;
}

describe('E2E Flow', () => {
  let initData: string;
  beforeAll(async () => { initData = generateMockInitData(TEST_USER_ID); });
  afterAll(async () => { await prisma.$disconnect(); });

  it('Authenticates', async () => {
    const res = await apiCall('/auth/login', 'POST', { initData });
    expect(res.user.telegramId).toBe(String(TEST_USER_ID));
  });

  it('Syncs Genesis State', async () => {
    const res = await apiCall('/game/sync', 'POST', { events: [] }, initData);
    expect(res.state.resources.NP).toBe(0);
  });

  it('Processes Taps', async () => {
    const events = [{ type: 'TAP_GENERATE', timestamp: Date.now(), count: 10 }];
    const res = await apiCall('/game/sync', 'POST', { events }, initData);
    expect(res.state.resources.NP).toBeGreaterThanOrEqual(100000);
  });
});
