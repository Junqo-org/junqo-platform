import { Test, TestingModule } from '@nestjs/testing';
import { ConversationsController } from './conversations.controller';
import { ConversationsService } from './conversations.service';
import { CreateConversationDTO, ConversationDTO } from './dto/conversation.dto';
import { AuthUserDTO } from '../shared/dto/auth-user.dto';
import {
  ConversationQueryDTO,
  ConversationQueryOutputDTO,
} from './dto/conversation-query.dto';

const mockConversationsService = {
  create: jest.fn(),
  findByQuery: jest.fn(),
  findOneById: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('ConversationsController', () => {
  let controller: ConversationsController;
  let service: ConversationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConversationsController],
      providers: [
        {
          provide: ConversationsService,
          useValue: mockConversationsService,
        },
      ],
    }).compile();

    controller = module.get<ConversationsController>(ConversationsController);
    service = module.get<ConversationsService>(ConversationsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a conversation', async () => {
      const currentUser: AuthUserDTO = {
        id: 'user-id',
        email: 'test@example.com',
        role: 'user',
      };
      const createDto: CreateConversationDTO = {
        title: 'Test Conversation',
        participantsIds: ['participant-id'],
      };
      const result: ConversationDTO = {
        id: 'conversation-id',
        title: 'Test Conversation',
        participantsIds: ['user-id', 'participant-id'],
        lastActivityAt: new Date(),
      };

      jest.spyOn(service, 'create').mockResolvedValue(result);

      expect(await controller.create(currentUser, createDto)).toBe(result);
      expect(service.create).toHaveBeenCalledWith(currentUser, createDto);
    });
  });

  describe('findByQuery', () => {
    it('should find conversations by query', async () => {
      const currentUser: AuthUserDTO = {
        id: 'user-id',
        email: 'test@example.com',
        role: 'user',
      };
      const query: ConversationQueryDTO = { participantId: 'participant-id' };
      const result: ConversationQueryOutputDTO = {
        conversations: [
          {
            id: 'conversation-id',
            title: 'Test Conversation',
            participantsIds: ['user-id', 'participant-id'],
            lastActivityAt: new Date(),
          },
        ],
        total: 1,
      };

      jest.spyOn(service, 'findByQuery').mockResolvedValue(result);

      expect(await controller.findByQuery(currentUser, query)).toBe(result);
      expect(service.findByQuery).toHaveBeenCalledWith(currentUser, query);
    });
  });

  describe('findOne', () => {
    it('should find a conversation by id', async () => {
      const currentUser: AuthUserDTO = {
        id: 'user-id',
        email: 'test@example.com',
        role: 'user',
      };
      const id = 'conversation-id';
      const result: ConversationDTO = {
        id,
        title: 'Test Conversation',
        participantsIds: ['user-id', 'participant-id'],
        lastActivityAt: new Date(),
      };

      jest.spyOn(service, 'findOneById').mockResolvedValue(result);

      expect(await controller.findOne(currentUser, id)).toBe(result);
      expect(service.findOneById).toHaveBeenCalledWith(currentUser, id);
    });
  });

  describe('update', () => {
    it('should update a conversation', async () => {
      const currentUser: AuthUserDTO = {
        id: 'user-id',
        email: 'test@example.com',
        role: 'user',
      };
      const id = 'conversation-id';
      const updateDto: UpdateConversationDTO = { title: 'Updated Title' };
      const result: ConversationDTO = {
        id,
        title: 'Updated Title',
        participantsIds: ['user-id', 'participant-id'],
        lastActivityAt: new Date(),
      };

      jest.spyOn(service, 'update').mockResolvedValue(result);

      expect(await controller.update(currentUser, id, updateDto)).toBe(result);
      expect(service.update).toHaveBeenCalledWith(currentUser, id, updateDto);
    });
  });

  describe('remove', () => {
    it('should remove a conversation', async () => {
      const currentUser: AuthUserDTO = {
        id: 'user-id',
        email: 'test@example.com',
        role: 'user',
      };
      const id = 'conversation-id';

      jest.spyOn(service, 'remove').mockResolvedValue(undefined);

      await controller.remove(currentUser, id);
      expect(service.delete).toHaveBeenCalledWith(currentUser, id);
    });
  });
});
