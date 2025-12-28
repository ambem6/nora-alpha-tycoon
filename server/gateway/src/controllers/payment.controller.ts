import { FastifyReply, FastifyRequest } from 'fastify';
import { prisma } from '../server';
import { TelegramService } from '../services/telegram.service';
import { GAME_CONFIG, PackId } from '../../../shared/src/config/game.config';

export class PaymentController {

  static async createStarsInvoice(req: FastifyRequest<{ Body: { packId: string } }>, reply: FastifyReply) {
    const { telegramId } = req.user!;
    const { packId } = req.body;
    const pack = GAME_CONFIG.PAYMENTS.PACKS[packId as PackId];

    if (!pack) return reply.status(400).send({ error: 'Invalid Pack' });

    const user = await prisma.user.findUnique({ where: { telegramId: BigInt(telegramId) } });
    if (!user) return reply.status(404).send({ error: 'User not found' });

    const payment = await prisma.payment.create({
      data: {
        userId: user.id, provider: 'STARS', currency: 'XTR',
        amount: BigInt(pack.STARS_PRICE), packId: pack.ID,
        externalId: `TEMP_${Date.now()}_${Math.random()}`, status: 'PENDING',
      },
    });

    const invoiceLink = await TelegramService.createInvoiceLink(
      telegramId, `Purchase ${pack.PSI_AMOUNT} PSI`, `Architecture Boost`,
      payment.id, pack.STARS_PRICE
    );

    return reply.send({ invoiceLink });
  }

  static async handleTelegramWebhook(req: FastifyRequest, reply: FastifyReply) {
    const update: any = req.body;
    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;

    if (update.pre_checkout_query) {
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/answerPreCheckoutQuery`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pre_checkout_query_id: update.pre_checkout_query.id, ok: true }),
      });
      return reply.send({ ok: true });
    }

    if (update.message?.successful_payment) {
      const { invoice_payload: paymentId, telegram_payment_charge_id: chargeId } = update.message.successful_payment;
      
      const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
      if (!payment || payment.status === 'COMPLETED') return reply.send({ ok: true });

      const pack = GAME_CONFIG.PAYMENTS.PACKS[payment.packId as PackId];
      if (!pack) return reply.send({ ok: true });

      const grantAmount = pack.PSI_AMOUNT * GAME_CONFIG.CORE.PRECISION_BASIS;

      await prisma.$transaction(async (tx) => {
        const res = await tx.payment.updateMany({
          where: { id: paymentId, status: 'PENDING' },
          data: { status: 'COMPLETED', externalId: chargeId, completedAt: new Date() }
        });

        if (res.count > 0) {
          await tx.gameEvent.create({
            data: {
              userId: payment.userId, eventType: 'PAYMENT_GRANT',
              payload: { resource: 'PSI', amount: grantAmount, source: 'STARS' },
              clientTimestamp: BigInt(Date.now()), serverTimestamp: BigInt(Date.now()),
            },
          });
          await tx.user.update({
            where: { id: payment.userId },
            data: { currentPsi: { increment: grantAmount } },
          });
        }
      });
    }

    return reply.send({ ok: true });
  }

  static async verifyTonTransaction(req: FastifyRequest, reply: FastifyReply) {
    const { telegramId } = req.user!;
    const { txHash, packId } = req.body as any;
    const pack = GAME_CONFIG.PAYMENTS.PACKS[packId as PackId];
    if (!pack) return reply.status(400).send({ error: 'Invalid Pack' });

    const existing = await prisma.payment.findUnique({ where: { externalId: txHash } });
    if (existing) return reply.status(400).send({ error: 'Already claimed' });

    const response = await fetch(`https://tonapi.io/v2/blockchain/transactions/${txHash}`, {
        headers: { Authorization: `Bearer ${process.env.TONAPI_KEY}` }
    });
    if (!response.ok) return reply.status(400).send({ error: 'TON API Error' });
    
    const txData: any = await response.json();
    if (!txData || txData.aborted) return reply.status(400).send({ error: 'Failed TX' });

    const outMsg = txData.out_msgs?.[0];
    if (!outMsg) return reply.status(400).send({ error: 'No Transfer' });

    const destination = outMsg.destination?.address;
    const amountNano = BigInt(outMsg.value);
    const comment = outMsg.decoded_body?.text;

    if (destination !== process.env.ADMIN_TON_WALLET) return reply.status(400).send({ error: 'Wrong Address' });
    
    const user = await prisma.user.findUnique({ where: { telegramId: BigInt(telegramId) } });
    if (!user || comment !== user.id) return reply.status(400).send({ error: 'Memo Mismatch' });

    const expectedNano = BigInt(pack.TON_PRICE) * 1_000_000_000n;
    if (amountNano < expectedNano) return reply.status(400).send({ error: 'Insufficient Amount' });

    const grantAmount = pack.PSI_AMOUNT * GAME_CONFIG.CORE.PRECISION_BASIS;

    await prisma.$transaction([
        prisma.payment.create({
            data: {
                userId: user.id, provider: 'TON', currency: 'TON', amount: amountNano,
                packId: pack.ID, externalId: txHash, status: 'COMPLETED', completedAt: new Date(),
            },
        }),
        prisma.gameEvent.create({
            data: {
                userId: user.id, eventType: 'PAYMENT_GRANT',
                payload: { resource: 'PSI', amount: grantAmount, source: 'TON' },
                clientTimestamp: BigInt(Date.now()), serverTimestamp: BigInt(Date.now()),
            },
        }),
        prisma.user.update({
            where: { id: user.id },
            data: { currentPsi: { increment: grantAmount } },
        })
    ]);

    return reply.send({ success: true });
  }
}
