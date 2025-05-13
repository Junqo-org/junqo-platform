import { Test, TestingModule } from '@nestjs/testing';
import { ConversationsService } from './conversations.service';
import { ConversationsRepository } from './repository/conversations.repository';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import {
  CreateConversationDTO,
  ConversationDTO,
  UpdateConversationDTO,
} from './dto/conversation.dto';
import { AuthUserDTO } from '../shared/dto/auth-user.dto';
import { ConversationQueryDTO } from './dto/conversation-query.dto';

const mockConversationsRepository = {
  create: jest.fn(),
  findByQuery: jest.fn(),
  findOneById: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('ConversationsService', () => {
  let service: ConversationsService;
  let repository: ConversationsRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConversationsService,
        {
          provide: ConversationsRepository,
          useValue: mockConversationsRepository,
        },
      ],
    }).compile();

    service = module.get<ConversationsService>(ConversationsService);
    repository = module.get<ConversationsRepository>(ConversationsRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a conversation and ensure current user is a participant', async () => {
      const currentUser: AuthUserDTO = {
        id: 'user-id',
        email: 'test@example.com',
        role: 'user',
      };
      const createDto: CreateConversationDTO = {
        title: 'Test Conversation',
        participantsIds: ['participant-id'],
      };
      const expectedData = {
        ...createDto,
        participantsIds: ['participant-id', 'user-id'],
        lastActivityAt: expect.any(Date),
      };
      const result: ConversationDTO = {
        id: 'conversation-id',
        title: 'Test Conversation',
        participantsIds: ['participant-id', 'user-id'],
        lastActivityAt: new Date(),
      };

      jest.spyOn(repository, 'create').mockResolvedValue(result);

      expect(await service.create(currentUser, createDto)).toBe(result);
      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining(expectedData),
      );
    });
  });

  describe('findByQuery', () => {
    it('should return conversations based on query and filter by current user', async () => {
      const currentUser: AuthUserDTO = {
        id: 'user-id',
        email: 'test@example.com',
        role: 'user',
      };
      const query: ConversationQueryDTO = {};
      const repositoryResult = {
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

      jest.spyOn(repository, 'findByQuery').mockResolvedValue(repositoryResult);

      const result = await service.findByQuery(currentUser, query);
      expect(result).toEqual(repositoryResult);
      expect(repository.findByQuery).toHaveBeenCalledWith({
        participantId: 'user-id',
      });
    });

    it('should respect the provided participant ID but ensure current user is also included', async () => {
      const currentUser: AuthUserDTO = {
        id: 'user-id',
        email: 'test@example.com',
        role: 'user',
      };
      const query: ConversationQueryDTO = { participantId: 'specific-user-id' };
      const repositoryResult = {
        conversations: [],
        total: 0,
      };

      jest.spyOn(repository, 'findByQuery').mockResolvedValue(repositoryResult);

      await service.findByQuery(currentUser, query);
      // Current user's ID overrides any other participantId in the query
      expect(repository.findByQuery).toHaveBeenCalledWith({
        participantId: 'user-id',
      });
    });
  });

  describe('findOneById', () => {
    it('should return a conversation by ID if user is a participant', async () => {
      const currentUser: AuthUserDTO = {
        id: 'user-id',
        email: 'test@example.com',
        role: 'user',
      };
      const id = 'conversation-id';
      const conversation: ConversationDTO = {
        id,
        title: 'Test Conversation',
        participantsIds: ['user-id', 'participant-id'],
        lastActivityAt: new Date(),
      };

      jest.spyOn(repository, 'findOneById').mockResolvedValue(conversation);

      expect(await service.findOneById(currentUser, id)).toBe(conversation);
      expect(repository.findOneById).toHaveBeenCalledWith(id);
    });

    it('should throw NotFoundException if conversation not found', async () => {
      const currentUser: AuthUserDTO = {
        id: 'user-id',
        email: 'test@example.com',
        role: 'user',
      };
      const id = 'nonexistent-id';

      jest.spyOn(repository, 'findOneById').mockResolvedValue(null);

      await expect(service.findOneById(currentUser, id)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if user is not a participant', async () => {
      const currentUser: AuthUserDTO = {
        id: 'user-id',
        email: 'test@example.com',
        role: 'user',
      };
      const id = 'conversation-id';
      const conversation: ConversationDTO = {
        id,
        title: 'Test Conversation',
        participantsIds: ['other-user-id', 'participant-id'],
        lastActivityAt: new Date(),
      };

      jest.spyOn(repository, 'findOneById').mockResolvedValue(conversation);

      await expect(service.findOneById(currentUser, id)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('update', () => {
    it('should update a conversation if user is a participant', async () => {
      const currentUser: AuthUserDTO = {
        id: 'user-id',
        email: 'test@example.com',
        role: 'user',
      };
      const id = 'conversation-id';
      const updateDto: UpdateConversationDTO = { title: 'Updated Title' };
      const existingConversation: ConversationDTO = {
        id,
        title: 'Test Conversation',
        participantsIds: ['user-id', 'participant-id'],
        lastActivityAt: new Date(Date.now() - 1000), // older timestamp
      };
      const updatedConversation: ConversationDTO = {
        id,
        title: 'Updated Title',
        participantsIds: ['user-id', 'participant-id'],
        lastActivityAt: new Date(), // newer timestamp
      };

      jest
        .spyOn(repository, 'findOneById')
        .mockResolvedValue(existingConversation);
      jest.spyOn(repository, 'update').mockResolvedValue(updatedConversation);

      expect(await service.update(currentUser, id, updateDto)).toBe(
        updatedConversation,
      );
      expect(repository.update).toHaveBeenCalledWith(
        id,
        expect.objectContaining({
          title: 'Updated Title',
          participantsIds: ['user-id', 'participant-id'],
          lastActivityAt: expect.any(Date),
        }),
      );
    });

    it('should update participant list correctly', async () => {
      const currentUser: AuthUserDTO = {
        id: 'user-id',
        email: 'test@example.com',
        role: 'user',
      };
      const id = 'conversation-id';
      const updateDto: UpdateConversationDTO = {
        addParticipantsIds: ['new-user-id'],
        removeParticipantsIds: ['participant-id'],
      };
      const existingConversation: ConversationDTO = {
        id,
        title: 'Test Conversation',
        participantsIds: ['user-id', 'participant-id'],
        lastActivityAt: new Date(Date.now() - 1000),
      };
      const updatedConversation: ConversationDTO = {
        id,
        title: 'Test Conversation',
        participantsIds: ['user-id', 'new-user-id'],
        lastActivityAt: new Date(),
      };

      jest
        .spyOn(repository, 'findOneById')
        .mockResolvedValue(existingConversation);
      jest.spyOn(repository, 'update').mockResolvedValue(updatedConversation);

      await service.update(currentUser, id, updateDto);
      expect(repository.update).toHaveBeenCalledWith(
        id,
        expect.objectContaining({
          participantsIds: ['user-id', 'new-user-id'],
        }),
      );
    });

    it('should prevent removing current user from participants', async () => {
      const currentUser: AuthUserDTO = {
        id: 'user-id',
        email: 'test@example.com',
        role: 'user',
      };
      const id = 'conversation-id';
      const updateDto: UpdateConversationDTO = {
        removeParticipantsIds: ['user-id', 'participant-id'],
      };
      const existingConversation: ConversationDTO = {
        id,
        title: 'Test Conversation',
        participantsIds: ['user-id', 'participant-id'],
        lastActivityAt: new Date(),
      };

      jest
        .spyOn(repository, 'findOneById')
        .mockResolvedValue(existingConversation);

      await expect(service.update(currentUser, id, updateDto)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('remove', () => {
    it('should remove a conversation if user is a participant', async () => {
      const currentUser: AuthUserDTO = {
        id: 'user-id',
        email: 'test@example.com',
        role: 'user',
      };
      const id = 'conversation-id';
      const conversation: ConversationDTO = {
        id,
        title: 'Test Conversation',
        participantsIds: ['user-id', 'participant-id'],
        lastActivityAt: new Date(),
      };

      jest.spyOn(repository, 'findOneById').mockResolvedValue(conversation);
      jest.spyOn(repository, 'remove').mockResolvedValue(undefined);

      await service.remove(currentUser, id);
      expect(repository.remove).toHaveBeenCalledWith(id);
    });
  });
});
