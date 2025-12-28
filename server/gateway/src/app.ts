import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import { apiRoutes } from './routes';
import { logger } from './services/logger.service';
import { GAME_CONFIG } from '../../../shared/src/config/game.config';
import { MonitoringService } from './services/monitoring.service';
import { redis } from './server';

export const app: FastifyInstance = Fastify({
  logger: logger,
  trustProxy: true,
  bodyLimit: 1024 * 1024, // 1MB
  genReqId: (req) => req.headers['x-request-id']?.toString() || `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
});

// --------------------------------------------------------
// MIDDLEWARE & PLUGINS
// --------------------------------------------------------

// 1. Request Tracking
app.addHook('onRequest', (request, reply, done) => {
  MonitoringService.trackRequest(request);
  done();
});

// 2. Rate Limiting
app.register(rateLimit, {
  max: GAME_CONFIG.SECURITY.RATE_LIMITS.GLOBAL,
  timeWindow: GAME_CONFIG.SECURITY.WINDOW_MS,
  redis: redis,
  keyGenerator: (req) => req.user?.telegramId ? `rate:user:${req.user.telegramId}` : `rate:ip:${req.ip}`,
  global: false // Apply per-route
});

// 3. CORS
app.register(cors, {
  origin: (origin, cb) => {
    if (process.env.NODE_ENV === 'development' || !origin) {
      return cb(null, true);
    }
    const allowed = [process.env.CORS_ORIGIN, 'https://web.telegram.org'];
    if (allowed.includes(origin) || origin.endsWith('.telegram.org')) {
      cb(null, true);
    } else {
      cb(new Error("Not allowed"), false);
    }
  },
  credentials: true
});

// --------------------------------------------------------
// ROUTES & ERROR HANDLING
// --------------------------------------------------------

app.register(apiRoutes, { prefix: process.env.API_PREFIX || '/api/v1' });

app.get('/health', async () => ({ status: 'ok', uptime: process.uptime() }));

app.setErrorHandler((error, request, reply) => {
  MonitoringService.trackError(error, 'request-error');
  
  const statusCode = error.statusCode || 500;
  if (statusCode >= 500) request.log.error(error);
  
  reply.status(statusCode).send({
    error: error.name,
    message: process.env.NODE_ENV === 'production' && statusCode === 500 ? 'Internal Error' : error.message,
    code: error.code
  });
});

declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      telegramId: string;
      username?: string;
      isPremium?: boolean;
    };
  }
}

export default app;
