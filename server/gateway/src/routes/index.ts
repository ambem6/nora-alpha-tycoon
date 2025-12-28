import { FastifyPluginAsync } from 'fastify';
import { AuthController } from '../controllers/auth.controller';
import { GameController } from '../controllers/game.controller';
import { SocialController } from '../controllers/social.controller';
import { PaymentController } from '../controllers/payment.controller';
import { ProtocolController } from '../controllers/protocol.controller';
import { telegramAuthMiddleware } from '../middleware/telegram.auth';

export const apiRoutes: FastifyPluginAsync = async (fastify) => {
  // Public
  fastify.post('/webhooks/telegram', PaymentController.handleTelegramWebhook);
  fastify.post('/auth/login', AuthController.login);

  // Protected
  fastify.register(async (protectedRoutes) => {
    protectedRoutes.addHook('preHandler', telegramAuthMiddleware);
    
    protectedRoutes.post('/game/sync', GameController.sync);
    protectedRoutes.get('/game/leaderboard', GameController.getLeaderboard);
    
    protectedRoutes.post('/social/claim-referral', SocialController.claimReferral);
    protectedRoutes.post('/social/boost', SocialController.activateBoost);
    protectedRoutes.get('/social/alliance', SocialController.getAlliance);
    
    protectedRoutes.get('/lab/market', GameController.getMarketRates);
    protectedRoutes.post('/lab/protocol/unlock', ProtocolController.unlock);
    protectedRoutes.post('/lab/protocol/fork', ProtocolController.fork);
    
    protectedRoutes.post('/payment/stars', PaymentController.createStarsInvoice);
    protectedRoutes.post('/payment/verify-ton', PaymentController.verifyTonTransaction);
  });
};
