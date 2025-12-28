import { redis } from '../server';
import { PlayerState as SharedPlayerState } from '../../../../shared/src/types/game.types';

const TTL_SECONDS = 3600;

export class CacheService {
  static async getUserSnapshot(userId: string): Promise<SharedPlayerState | null> {
    try {
      const data = await redis.get(`user:${userId}:state`);
      return data ? JSON.parse(data) : null;
    } catch (err) { console.error('Redis Error:', err); return null; }
  }

  static async setUserSnapshot(userId: string, state: SharedPlayerState): Promise<void> {
    try { await redis.set(`user:${userId}:state`, JSON.stringify(state), { EX: TTL_SECONDS }); } 
    catch (err) { console.error('Redis Error:', err); }
  }

  static async updateLeaderboard(userId: string, username: string, score: bigint) {
    try {
      await redis.zAdd('leaderboard:global', { score: Number(score), value: userId });
      await redis.hSet('user:metadata', userId, username || 'Anonymous');
    } catch (err) { console.error('Leaderboard Error:', err); }
  }

  static async getTopPlayers(limit: number = 100) {
    try {
      const results = await redis.zRangeWithScores('leaderboard:global', 0, limit - 1, { REV: true });
      if (!results.length) return [];
      const response = [];
      for (const r of results) {
        const name = await redis.hGet('user:metadata', r.value) || 'Unknown';
        response.push({ rank: response.length + 1, name, score: r.score });
      }
      return response;
    } catch (err) { return []; }
  }
}
