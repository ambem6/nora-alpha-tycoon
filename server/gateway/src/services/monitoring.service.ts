import { FastifyRequest } from 'fastify';
import { redis } from '../server'; 

export class MonitoringService {
    private static localMetrics = {
        requests: 0, errors: 0, engineCalls: 0
    };

    static trackRequest(req: FastifyRequest) {
        this.localMetrics.requests++;
        redis.incr('metrics:requests:total').catch(console.error);
        if (req.user?.telegramId) {
            redis.pfAdd('metrics:users:active_daily', req.user.telegramId).catch(console.error);
        }
    }

    static trackError(error: any, context: string) {
        this.localMetrics.errors++;
        redis.incr('metrics:errors:total').catch(console.error);
        console.error(`[MONITORING] Error in ${context}:`, error.message);
    }

    static async getMetrics() {
        const [reqs, errs, users] = await Promise.all([
            redis.get('metrics:requests:total'),
            redis.get('metrics:errors:total'),
            redis.pfCount('metrics:users:active_daily')
        ]);
        return {
            ...this.localMetrics,
            persistentRequests: parseInt(reqs || '0'),
            persistentErrors: parseInt(errs || '0'),
            activeUsers: users
        };
    }
}
