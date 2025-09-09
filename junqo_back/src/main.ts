import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppSetup } from './app.setup';
import { FileLogger } from './shared/logger/file-logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new FileLogger('NestApplication'),
  });
  const logger = new FileLogger('Bootstrap');

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    logger.log(`Received ${signal}. Starting graceful shutdown...`);
    try {
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Shutdown timeout')), 5000),
      );
      await Promise.race([app.close(), timeout]);
      logger.log('Graceful shutdown completed');
      process.exit(0);
    } catch (err) {
      logger.error('Error during shutdown:', err);
      process.exit(1);
    }
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  await AppSetup(app);
}

bootstrap();
