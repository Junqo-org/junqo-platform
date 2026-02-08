import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { AppSetup } from './app.setup';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

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
