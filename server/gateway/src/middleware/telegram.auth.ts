import { FastifyReply, FastifyRequest } from 'fastify';
import { createHmac } from 'crypto';
import { GAME_CONFIG } from '../../../shared/src/config/game.config';
import { logger } from '../services/logger.service';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

function verifyTelegramWebAppData(telegramInitData: string): boolean {
  if (!BOT_TOKEN) return false;
  const urlParams = new URLSearchParams(telegramInitData);
  const hash = urlParams.get('hash');
  if (!hash) return false;

  urlParams.delete('hash');
  const paramsToCheck: string[] = [];
  urlParams.forEach((val, key) => paramsToCheck.push(`${key}=${val}`));
  paramsToCheck.sort();

  const secretKey = createHmac('sha256', 'WebAppData').update(BOT_TOKEN).digest();
  const calculatedHash = createHmac('sha256', secretKey).update(paramsToCheck.join('\n')).digest('hex');

  return calculatedHash === hash;
}

export async function telegramAuthMiddleware(request: FastifyRequest, reply: FastifyReply) {
  const initData = request.headers['x-telegram-init-data'] as string;

  if (!initData) return reply.status(401).send({ error: 'Missing Auth Header', code: 'AUTH_MISSING' });

  if (!verifyTelegramWebAppData(initData)) {
    return reply.status(403).send({ error: 'Invalid Signature', code: 'AUTH_INVALID' });
  }

  const params = new URLSearchParams(initData);
  const authDate = parseInt(params.get('auth_date') || '0', 10);
  const nowSeconds = Math.floor(Date.now() / 1000);
  
  if (nowSeconds - authDate > GAME_CONFIG.SECURITY.TELEGRAM_AUTH_TTL) {
    return reply.status(403).send({ error: 'Session Expired', code: 'AUTH_EXPIRED' });
  }

  const userJson = params.get('user');
  if (!userJson) return reply.status(400).send({ error: 'Bad Data', code: 'AUTH_BAD_FORMAT' });

  try {
    const user = JSON.parse(userJson);
    request.user = {
      telegramId: user.id.toString(),
      username: user.username,
      isPremium: user.is_premium || false,
    };
  } catch (e) {
    return reply.status(400).send({ error: 'JSON Parse Error', code: 'AUTH_BAD_JSON' });
  }
}
