import 'dotenv/config'; 
import { app } from './app'; 
import { PrismaClient } from '@prisma/client';
import { createClient } from 'redis';
import { init_engine } from '../../core'; 
import { MonitoringService } from './services/monitoring.service';

// --------------------------------------------------------
// INFRASTRUCTURE SINGLETONS
// --------------------------------------------------------

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'info', 'warn', 'error']
    : ['warn', 'error'],
    
  datasources: {
    db: {
      url: process.env.DATABASE_URL?.includes('?') 
        ? `${process.env.DATABASE_URL}&connection_limit=20&pool_timeout=5`
        : `${process.env.DATABASE_URL}?connection_limit=20&pool_timeout=5`
    }
  },
});

export const redis = createClient({
  url: process.env.REDIS_URL,
  socket: {
    reconnectStrategy: (retries) => Math.min(retries * 100, 3000)
  }
});

redis.on('error', (err) => {
  console.error('🔴 Redis Client Error:', err);
  MonitoringService.trackError(err, 'redis');
});

// --------------------------------------------------------
// BOOTSTRAP
// --------------------------------------------------------

async function bootstrap() {
  try {
    console.log('🚀 Starting Nora Alpha Gateway...');
    
    // 1. Initialize Rust Core
    init_engine();
    
    // 2. Connect to Database
    await prisma.$connect();
    console.log('✅ Database connected');

    // 3. Connect to Redis
    await redis.connect();
    console.log('✅ Redis connected');

    // 4. Start HTTP Server
    const PORT = process.env.PORT || 3000;
    const HOST = '0.0.0.0'; 
    
    await app.listen({ port: Number(PORT), host: HOST });
    console.log(`✅ Server listening on http://${HOST}:${PORT}`);

  } catch (err) {
    console.error('❌ Bootstrap failure:', err);
    process.exit(1);
  }
}

bootstrap();
