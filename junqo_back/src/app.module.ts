import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatGptApiModule } from './chat-gpt-api/chat-gpt-api.module';

@Module({
  imports: [ChatGptApiModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
