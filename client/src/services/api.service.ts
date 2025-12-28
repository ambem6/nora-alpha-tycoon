import { GameEvent, PlayerState } from '../../../../shared/src/types/game.types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export class ApiService {
  private static get telegramInitData(): string {
    // @ts-ignore
    return window.Telegram?.WebApp?.initData || '';
  }

  private static async request<T>(endpoint: string, method: 'GET' | 'POST', body?: any): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Telegram-Init-Data': this.telegramInitData
    };

    const config: RequestInit = { method, headers, body: body ? JSON.stringify(body) : undefined };

    try {
      const res = await fetch(`${API_BASE}${endpoint}`, config);
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `API Error: ${res.status}`);
      }
      return await res.json();
    } catch (err) {
      console.error(`Request failed: ${method} ${endpoint}`, err);
      throw err;
    }
  }

  static async login(referrerId?: string): Promise<{ user: any, token: string }> {
    return this.request('/auth/login', 'POST', { initData: this.telegramInitData, referrerId });
  }

  static async sync(events: GameEvent[]): Promise<{ state: PlayerState, syncedAt: number }> {
    return this.request('/game/sync', 'POST', { events });
  }

  static async claimReferral(): Promise<{ success: boolean }> {
    return this.request('/social/claim-referral', 'POST');
  }

  static async activateBoost(boostId: string): Promise<{ success: boolean }> {
    return this.request('/social/boost', 'POST', { boostId });
  }

  static async getAlliance(): Promise<{ alliance: any }> {
    return this.request('/social/alliance', 'GET');
  }
  
  static async createStarsInvoice(packId: string): Promise<{ invoiceLink: string }> {
      return this.request('/payment/stars', 'POST', { packId });
  }
}
