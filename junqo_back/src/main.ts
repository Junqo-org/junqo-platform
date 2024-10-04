import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ChatgptService } from './chat-gpt-api/chat-gpt-api.service';
import * as dotenv from 'dotenv';

async function bootstrap() {
  dotenv.config();
  const app = await NestFactory.create(AppModule);
  const chatgptService = app.get(ChatgptService);

  const testMessage = "Je postule pour un poste de développeur.";
  const response = await chatgptService.simulateInterview(testMessage);
  
  console.log('Réponse de l\'API ChatGPT:', response);

  await app.listen(3000);
}
bootstrap();
