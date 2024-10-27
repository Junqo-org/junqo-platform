import { Test, TestingModule } from '@nestjs/testing';
import { ChatgptController } from './chat-gpt-api.controller';

describe('ChatgptController', () => {
  let chatgptController: ChatgptController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatgptController],
    }).compile();

    chatgptController = module.get<ChatgptController>(ChatgptController);
  });

  it('should be defined', () => {
    expect(chatgptController).toBeDefined();
  });
});
