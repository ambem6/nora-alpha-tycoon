import { FastifyReply, FastifyRequest } from 'fastify';
import { prisma } from '../server';
import { reduce_batch } from '../../core';
import { GameEvent, PlayerState } from '../../../shared/src/types/game.types';
import rawConfig from '../../../shared/data/game-balance.json';
import { CacheService } from '../services/cache.service';

const CONFIG_STRING = JSON.stringify(rawConfig);

export class GameController {
  
  static async sync(req: FastifyRequest<{ Body: { events: GameEvent[] } }>, reply: FastifyReply) {
    const { telegramId } = req.user!;
    const incomingEvents = req.body.events;

    if (!Array.isArray(incomingEvents)) return reply.status(400).send({ error: 'Invalid events' });
    if (incomingEvents.length > 50) return reply.status(400).send({ error: 'Batch too large' });

    // 1. Resolve User
    const userMap = await prisma.user.findUnique({ where: { telegramId: BigInt(telegramId) }, select: { id: true } });
    if (!userMap) return reply.status(404).send({ error: 'User not found' });
    const userId = userMap.id;

    // 2. Load State (Cache -> DB -> Genesis)
    let currentState: PlayerState;
    let currentVersion = 0;
    const cachedState = await CacheService.getUserSnapshot(userId);

    if (cachedState) {
      currentState = cachedState;
    } else {
      const user = await prisma.user.findUnique({ 
          where: { id: userId }, 
          include: { snapshots: { orderBy: { version: 'desc' }, take: 1 } } 
      });

      if (user && user.snapshots.length > 0) {
        currentState = user.snapshots[0].data as unknown as PlayerState;
        currentVersion = user.snapshots[0].version;
      } else {
         currentState = {
            userId: userId,
            resources: { NP: 0, PSI: 0, P: 0, Z: 0, K: 0 },
            districts: {
                mining_district: { level: 0, tuningFactor: 50, specialization: 'NONE', outputRate: 0 },
                privacy_vault: { level: 0, tuningFactor: 50, specialization: 'NONE', outputRate: 0 },
                compliance_tower: { level: 0, tuningFactor: 50, specialization: 'NONE', outputRate: 0 }
            },
            protocolLevel: 0, prestigeCount: 0, globalMultiplier: 10000,
            lab: { isUnlocked: false, activeModules: [], slippageMalus: 0, slippageExpiry: 0 },
            lastProcessedTick: Date.now()
        };
      }
    }

    // 3. Rust Engine Execution
    let newStateStr: string;
    try {
      newStateStr = reduce_batch(JSON.stringify(currentState), JSON.stringify(incomingEvents), CONFIG_STRING);
    } catch (rustError: any) {
      req.log.error({ err: rustError }, 'Rust Panic');
      return reply.status(500).send({ error: 'Engine Failure', code: 'ENGINE_PANIC' });
    }

    const newState: PlayerState = JSON.parse(newStateStr);

    // 4. Persistence
    await prisma.$transaction(async (tx) => {
      if (incomingEvents.length > 0) {
        await tx.gameEvent.createMany({
          data: incomingEvents.map(evt => ({
            userId, eventType: evt.type, payload: evt as any, 
            clientTimestamp: BigInt(evt.timestamp), serverTimestamp: BigInt(Date.now())
          }))
        });
      }
      
      await tx.gameSnapshot.create({
        data: { 
            userId, version: currentVersion + 1, data: newState as any, 
            lastEventId: incomingEvents.length > 0 ? 'BATCH' : 'SYNC', 
            serverTimestamp: BigInt(newState.lastProcessedTick) 
        }
      });
      
      await tx.user.update({
        where: { id: userId },
        data: { 
            lifetimeNp: BigInt(newState.resources.NP), 
            currentPsi: Number(newState.resources.PSI || 0), 
            prestigeLevel: newState.protocolLevel,
            lastLoginAt: new Date()
        }
      });
    });

    await CacheService.setUserSnapshot(userId, newState);
    if (req.user!.username) CacheService.updateLeaderboard(userId, req.user!.username, BigInt(newState.resources.NP));

    return reply.send({ state: newState, version: currentVersion + 1 });
  }

  static async getLeaderboard(req: FastifyRequest, reply: FastifyReply) {
    const topPlayers = await CacheService.getTopPlayers(100);
    return reply.send(topPlayers);
  }

  static async getMarketRates(req: FastifyRequest, reply: FastifyReply) {
    return reply.send({ rates: { 'P_TO_Z': 100, 'Z_TO_K': 50 }, slippage: 0 });
  }
}
