import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV === 'production' ? undefined : {
    target: 'pino-pretty',
    options: { colorize: true, ignore: 'pid,hostname' },
  },
  redact: {
    paths: ['req.headers.authorization', 'req.headers["x-telegram-init-data"]', 'body.initData'],
    remove: true,
  },
});
