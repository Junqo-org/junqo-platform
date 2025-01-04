import { Controller, Post, Body } from '@nestjs/common';
import { ChatgptService } from './chat-gpt-api.service';

@Controller('chatgpt')
export class ChatgptController {
  constructor(private readonly chatgptService: ChatgptService) {}

  @Post('simulate')
  async simulateInterview(
    @Body('message') userMessage: string,
  ): Promise<string> {
    const response = await this.chatgptService.simulateInterview(userMessage);
    return response;
  }
}
