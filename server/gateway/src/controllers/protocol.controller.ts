import { FastifyReply, FastifyRequest } from 'fastify';
import { GameEvent } from '../../../shared/src/types/game.types';

export class ProtocolController {
    
    static async unlock(req: FastifyRequest, reply: FastifyReply) {
        const event: GameEvent = {
            type: 'PROTOCOL_UNLOCK', // Maps to Rust ProtocolUnlock
            timestamp: Date.now()
        };
        return reply.send({ event });
    }

    static async fork(req: FastifyRequest<{ Body: { type: string } }>, reply: FastifyReply) {
        const { type } = req.body;
        const event: GameEvent = {
            type: 'PROTOCOL_FORK',
            timestamp: Date.now(),
            forkType: type
        };
        return reply.send({ event });
    }
}
