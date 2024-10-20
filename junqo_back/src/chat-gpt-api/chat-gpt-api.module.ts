import { Module } from '@nestjs/common';
import { ChatgptController } from './chat-gpt-api.controller';
import { ChatgptService } from './chat-gpt-api.service';

@Module({
  controllers: [ChatgptController],
  providers: [ChatgptService],
})
export class ChatGptApiModule {}
