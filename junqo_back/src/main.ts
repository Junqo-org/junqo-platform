import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

const PORT_MIN = 1;
const PORT_MAX = 65535;

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

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      enableDebugMessages: process.env.NODE_ENV !== 'production',
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  const port = Number(process.env.BACK_PORT ?? 3000);

  if (Number.isNaN(port) || port < PORT_MIN || port > PORT_MAX) {
    throw new Error(`Invalid port number: ${port}`);
  }
  await app.listen(port);
}

bootstrap();
