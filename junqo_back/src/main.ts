import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { IAinterview } from './chat-gpt-api/chat-gpt-discussion';

async function bootstrap() {
  dotenv.config();
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
  await IAinterview(app);
}

bootstrap();
