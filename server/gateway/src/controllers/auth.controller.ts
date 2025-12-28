import { FastifyReply, FastifyRequest } from 'fastify';
import { prisma } from '../server';
import { createHmac } from 'crypto';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;

export class AuthController {
  static async login(request: FastifyRequest<{ Body: { initData: string; referrerId?: string } }>, reply: FastifyReply) {
    const { initData, referrerId } = request.body;

    if (!initData || !AuthController.verifyTelegramSignature(initData)) {
      return reply.status(403).send({ error: 'Invalid Signature', code: 'AUTH_FAILED' });
    }

    const params = new URLSearchParams(initData);
    const userJson = params.get('user');
    if (!userJson) return reply.status(400).send({ error: 'Missing user data' });

    const tgUser = JSON.parse(userJson);
    const telegramId = BigInt(tgUser.id);

    // Atomic Upsert
    const user = await prisma.user.upsert({
      where: { telegramId },
      update: {
        username: tgUser.username,
        firstName: tgUser.first_name,
        lastName: tgUser.last_name,
        isPremium: tgUser.is_premium || false,
        lastLoginAt: new Date(),
      },
      create: {
        telegramId,
        username: tgUser.username,
        firstName: tgUser.first_name,
        lastName: tgUser.last_name,
        languageCode: tgUser.language_code,
        isPremium: tgUser.is_premium || false,
      }
    });

    // Referral Logic (New Users Only)
    if (Date.now() - user.createdAt.getTime() < 5000) {
      const startParam = params.get('start_param') || referrerId;
      if (startParam && startParam !== user.id) {
        await AuthController.processReferral(user.id, startParam);
      }
    }

    return reply.send({
      user: {
        ...user,
        telegramId: user.telegramId.toString(),
        lifetimeNp: user.lifetimeNp.toString(),
      },
      token: 'session_via_init_data' 
    });
  }

  private static verifyTelegramSignature(initData: string): boolean {
    const urlParams = new URLSearchParams(initData);
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

  private static async processReferral(newUserId: string, referrerCode: string) {
    try {
      const referrer = await prisma.user.findUnique({ where: { id: referrerCode } });
      if (referrer) {
        await prisma.referral.create({
          data: { referrerId: referrer.id, refereeId: newUserId }
        });
      }
    } catch (e) { /* Ignore duplicates */ }
  }
}
