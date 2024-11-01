import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Graceful shutdown
  // Graceful shutdown
  const shutdown = async (signal: string) => {
    console.log(`Received ${signal}. Starting graceful shutdown...`);
    try {
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Shutdown timeout')), 5000),
      );
      await Promise.race([app.close(), timeout]);
      console.log('Graceful shutdown completed');
      process.exit(0);
    } catch (err) {
      console.error('Error during shutdown:', err);
      process.exit(1);
    }
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  await app.listen(3000);
}
bootstrap();
