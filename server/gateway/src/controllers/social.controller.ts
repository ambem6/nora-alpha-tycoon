import { FastifyReply, FastifyRequest } from 'fastify';
import { prisma } from '../server';
import { GameEvent } from '../../../shared/src/types/game.types';

export class SocialController {

  static async claimReferral(request: FastifyRequest, reply: FastifyReply) {
    const { telegramId } = request.user!;
    const user = await prisma.user.findUnique({ where: { telegramId: BigInt(telegramId) } });
    
    if (!user) return reply.status(404).send({ error: 'User not found' });

    const referral = await prisma.referral.findUnique({ where: { refereeId: user.id } });
    if (!referral) return reply.status(400).send({ error: 'No referrer' });
    if (referral.isClaimed) return reply.status(200).send({ message: 'Already claimed' });

    await prisma.referral.update({
      where: { id: referral.id },
      data: { isClaimed: true }
    });

    return reply.send({ success: true, referrerId: referral.referrerId });
  }

  static async activateBoost(request: FastifyRequest<{ Body: { boostId: string } }>, reply: FastifyReply) {
    const { boostId } = request.body;
    const validBoosts = ['EMOJI_MINING', 'EMOJI_SHIELD', 'EMOJI_SCALE'];
    
    if (!validBoosts.includes(boostId)) return reply.status(400).send({ error: 'Invalid Boost' });

    const boostEvent: GameEvent = {
      type: 'BOOST_ACTIVATE',
      timestamp: Date.now(),
      boostId: boostId
    };

    return reply.send({ success: true, event: boostEvent });
  }

  static async getAlliance(request: FastifyRequest, reply: FastifyReply) {
    const { telegramId } = request.user!;
    const user = await prisma.user.findUnique({ 
      where: { telegramId: BigInt(telegramId) },
      include: { alliance: true }
    });

    if (!user?.alliance) return reply.send({ alliance: null });

    return reply.send({
      alliance: {
        id: user.alliance.id,
        name: user.alliance.name,
        members: user.alliance.totalMembers,
        totalNp: user.alliance.totalNp.toString()
      }
    });
  }
}
