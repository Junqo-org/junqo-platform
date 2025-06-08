import { TestBed, Mocked } from '@suites/unit';
import { ConversationsController } from './conversations.controller';
import { ConversationsService } from './conversations.service';
import { MessagesService } from '../messages/messages.service';
import { AuthUserDTO } from '../shared/dto/auth-user.dto';
import { UserType } from '../users/dto/user-type.enum';
import { plainToInstance } from 'class-transformer';
import {
  ConversationDTO,
  CreateConversationDTO,
  AddParticipantsDTO,
  RemoveParticipantsDTO,
} from './dto/conversation.dto';
import {
  ConversationQueryDTO,
  ConversationQueryOutputDTO,
} from './dto/conversation-query.dto';
import {
  SetConversationTitleDTO,
  UserConversationTitleDTO,
} from './dto/user-conversation-title.dto';
import { MessageDTO, UpdateMessageDTO } from '../messages/dto/message.dto';
import { MessageQueryOutputDTO } from '../messages/dto/message-query.dto';
import {
  ForbiddenException,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';

const mockConversation: ConversationDTO = plainToInstance(ConversationDTO, {
  id: 'c69cc25b-0cc4-4032-83c2-0d34c84318ba',
  participantsIds: ['u1', 'u2'],
  createdAt: new Date('2023-01-01T00:00:00.000Z'),
  updatedAt: new Date('2023-01-01T00:00:00.000Z'),
  title: 'Test Conversation',
});

const mockConversationsList: ConversationDTO[] = [
  mockConversation,
  plainToInstance(ConversationDTO, {
    id: 'c69cc25b-0cc4-4032-83c2-0d34c84318bb',
    participantsIds: ['u1', 'u3'],
    createdAt: new Date('2023-01-01T00:00:00.000Z'),
    updatedAt: new Date('2023-01-01T00:00:00.000Z'),
  }),
];

const mockConversationQueryOutput: ConversationQueryOutputDTO = {
  rows: mockConversationsList,
  count: 2,
};

const mockUserConversationTitle: UserConversationTitleDTO = plainToInstance(
  UserConversationTitleDTO,
  {
    userId: 'u1',
    conversationId: 'c69cc25b-0cc4-4032-83c2-0d34c84318ba',
    title: 'Custom Title',
  },
);

const mockMessage: MessageDTO = plainToInstance(MessageDTO, {
  id: 'm69cc25b-0cc4-4032-83c2-0d34c84318ba',
  senderId: 'u1',
  conversationId: 'c69cc25b-0cc4-4032-83c2-0d34c84318ba',
  content: 'Test message',
  createdAt: new Date('2023-01-01T00:00:00.000Z'),
  updatedAt: new Date('2023-01-01T00:00:00.000Z'),
});

const mockMessageQueryOutput: MessageQueryOutputDTO = {
  rows: [mockMessage],
  count: 1,
};

const currentUser: AuthUserDTO = plainToInstance(AuthUserDTO, {
  id: 'u1',
  type: UserType.STUDENT,
  email: 'student@test.com',
  name: 'Student User',
});

describe('ConversationsController', () => {
  let controller: ConversationsController;
  let conversationsService: Mocked<ConversationsService>;
  let messagesService: Mocked<MessagesService>;

  beforeEach(async () => {
    const { unit, unitRef } = await TestBed.solitary(
      ConversationsController,
    ).compile();

    controller = unit;
    conversationsService = unitRef.get(ConversationsService);
    messagesService = unitRef.get(MessagesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a conversation', async () => {
      const createDto: CreateConversationDTO = {
        participantsIds: ['u1', 'u2'],
        title: 'Test Conversation',
      };

      conversationsService.create.mockResolvedValue(mockConversation);

      const result = await controller.create(currentUser, createDto);

      expect(result).toEqual(mockConversation);
      expect(conversationsService.create).toHaveBeenCalledWith(
        currentUser,
        createDto,
      );
    });

    it('should handle service errors during creation', async () => {
      const createDto: CreateConversationDTO = {
        participantsIds: ['u1', 'u2'],
        title: 'Test Conversation',
      };

      conversationsService.create.mockRejectedValue(
        new BadRequestException('Invalid participant ID'),
      );

      await expect(controller.create(currentUser, createDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findByQuery', () => {
    it('should return conversations by query', async () => {
      const query: ConversationQueryDTO = {
        limit: 10,
        offset: 0,
      };

      conversationsService.findByQuery.mockResolvedValue(
        mockConversationQueryOutput,
      );

      const result = await controller.findByQuery(currentUser, query);

      expect(result).toEqual(mockConversationQueryOutput);
      expect(conversationsService.findByQuery).toHaveBeenCalledWith(
        currentUser,
        query,
      );
    });

    it('should handle service errors during query', async () => {
      const query: ConversationQueryDTO = {
        limit: 10,
        offset: 0,
      };

      conversationsService.findByQuery.mockRejectedValue(
        new InternalServerErrorException('Database error'),
      );

      await expect(controller.findByQuery(currentUser, query)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findOne', () => {
    it('should return a conversation by ID', async () => {
      const conversationId = 'c69cc25b-0cc4-4032-83c2-0d34c84318ba';

      conversationsService.findOneById.mockResolvedValue(mockConversation);

      const result = await controller.findOne(currentUser, conversationId);

      expect(result).toEqual(mockConversation);
      expect(conversationsService.findOneById).toHaveBeenCalledWith(
        currentUser,
        conversationId,
      );
    });

    it('should handle not found error', async () => {
      const conversationId = 'nonexistent-id';

      conversationsService.findOneById.mockRejectedValue(
        new NotFoundException('Conversation not found'),
      );

      await expect(
        controller.findOne(currentUser, conversationId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should handle forbidden error', async () => {
      const conversationId = 'c69cc25b-0cc4-4032-83c2-0d34c84318ba';

      conversationsService.findOneById.mockRejectedValue(
        new ForbiddenException('Not authorized'),
      );

      await expect(
        controller.findOne(currentUser, conversationId),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('should delete a conversation', async () => {
      const conversationId = 'c69cc25b-0cc4-4032-83c2-0d34c84318ba';

      conversationsService.delete.mockResolvedValue();

      await controller.remove(currentUser, conversationId);

      expect(conversationsService.delete).toHaveBeenCalledWith(
        currentUser,
        conversationId,
      );
    });

    it('should handle not found error during deletion', async () => {
      const conversationId = 'nonexistent-id';

      conversationsService.delete.mockRejectedValue(
        new NotFoundException('Conversation not found'),
      );

      await expect(
        controller.remove(currentUser, conversationId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should handle forbidden error during deletion', async () => {
      const conversationId = 'c69cc25b-0cc4-4032-83c2-0d34c84318ba';

      conversationsService.delete.mockRejectedValue(
        new ForbiddenException('Not authorized to delete'),
      );

      await expect(
        controller.remove(currentUser, conversationId),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('addParticipants', () => {
    it('should add participants to a conversation', async () => {
      const conversationId = 'c69cc25b-0cc4-4032-83c2-0d34c84318ba';
      const addParticipantsDto: AddParticipantsDTO = {
        participantsIds: ['u3', 'u4'],
      };

      const updatedConversation = {
        ...mockConversation,
        participantsIds: ['u1', 'u2', 'u3', 'u4'],
      };

      conversationsService.addParticipants.mockResolvedValue(
        updatedConversation,
      );

      const result = await controller.addParticipants(
        currentUser,
        conversationId,
        addParticipantsDto,
      );

      expect(result).toEqual(updatedConversation);
      expect(conversationsService.addParticipants).toHaveBeenCalledWith(
        currentUser,
        conversationId,
        addParticipantsDto,
      );
    });

    it('should handle errors when adding participants', async () => {
      const conversationId = 'c69cc25b-0cc4-4032-83c2-0d34c84318ba';
      const addParticipantsDto: AddParticipantsDTO = {
        participantsIds: ['invalid-id'],
      };

      conversationsService.addParticipants.mockRejectedValue(
        new BadRequestException('Invalid participant ID'),
      );

      await expect(
        controller.addParticipants(
          currentUser,
          conversationId,
          addParticipantsDto,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('removeParticipants', () => {
    it('should remove participants from a conversation', async () => {
      const conversationId = 'c69cc25b-0cc4-4032-83c2-0d34c84318ba';
      const removeParticipantsDto: RemoveParticipantsDTO = {
        participantsIds: ['u2'],
      };

      const updatedConversation = {
        ...mockConversation,
        participantsIds: ['u1'],
      };

      conversationsService.removeParticipants.mockResolvedValue(
        updatedConversation,
      );

      const result = await controller.removeParticipants(
        currentUser,
        conversationId,
        removeParticipantsDto,
      );

      expect(result).toEqual(updatedConversation);
      expect(conversationsService.removeParticipants).toHaveBeenCalledWith(
        currentUser,
        conversationId,
        removeParticipantsDto,
      );
    });

    it('should handle errors when removing participants', async () => {
      const conversationId = 'c69cc25b-0cc4-4032-83c2-0d34c84318ba';
      const removeParticipantsDto: RemoveParticipantsDTO = {
        participantsIds: ['u1', 'u2'], // Removing all participants
      };

      conversationsService.removeParticipants.mockRejectedValue(
        new ForbiddenException('Cannot remove all participants'),
      );

      await expect(
        controller.removeParticipants(
          currentUser,
          conversationId,
          removeParticipantsDto,
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getConversationTitle', () => {
    it('should get conversation title', async () => {
      const conversationId = 'c69cc25b-0cc4-4032-83c2-0d34c84318ba';

      conversationsService.getConversationTitle.mockResolvedValue(
        mockUserConversationTitle,
      );

      const result = await controller.getConversationTitle(
        currentUser,
        conversationId,
      );

      expect(result).toEqual(mockUserConversationTitle);
      expect(conversationsService.getConversationTitle).toHaveBeenCalledWith(
        currentUser,
        conversationId,
      );
    });

    it('should handle not found error when getting title', async () => {
      const conversationId = 'nonexistent-id';

      conversationsService.getConversationTitle.mockRejectedValue(
        new NotFoundException('Conversation not found'),
      );

      await expect(
        controller.getConversationTitle(currentUser, conversationId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('setConversationTitle', () => {
    it('should set conversation title', async () => {
      const conversationId = 'c69cc25b-0cc4-4032-83c2-0d34c84318ba';
      const titleDto: SetConversationTitleDTO = {
        title: 'New Custom Title',
      };

      const updatedTitle = {
        ...mockUserConversationTitle,
        title: 'New Custom Title',
      };

      conversationsService.setConversationTitle.mockResolvedValue(updatedTitle);

      const result = await controller.setConversationTitle(
        currentUser,
        conversationId,
        titleDto,
      );

      expect(result).toEqual(updatedTitle);
      expect(conversationsService.setConversationTitle).toHaveBeenCalledWith(
        currentUser,
        conversationId,
        titleDto,
      );
    });

    it('should handle errors when setting title', async () => {
      const conversationId = 'c69cc25b-0cc4-4032-83c2-0d34c84318ba';
      const titleDto: SetConversationTitleDTO = {
        title: 'x'.repeat(1000), // Too long title
      };

      conversationsService.setConversationTitle.mockRejectedValue(
        new BadRequestException('Title too long'),
      );

      await expect(
        controller.setConversationTitle(currentUser, conversationId, titleDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('removeConversationTitle', () => {
    it('should remove conversation title', async () => {
      const conversationId = 'c69cc25b-0cc4-4032-83c2-0d34c84318ba';

      conversationsService.removeConversationTitle.mockResolvedValue();

      await controller.removeConversationTitle(currentUser, conversationId);

      expect(conversationsService.removeConversationTitle).toHaveBeenCalledWith(
        currentUser,
        conversationId,
      );
    });

    it('should handle not found error when removing title', async () => {
      const conversationId = 'c69cc25b-0cc4-4032-83c2-0d34c84318ba';

      conversationsService.removeConversationTitle.mockRejectedValue(
        new NotFoundException('Title not found'),
      );

      await expect(
        controller.removeConversationTitle(currentUser, conversationId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getConversationMessages', () => {
    it('should get messages for a conversation', async () => {
      const conversationId = 'c69cc25b-0cc4-4032-83c2-0d34c84318ba';
      const query = { limit: 10, offset: 0 };

      messagesService.findByConversationId.mockResolvedValue(
        mockMessageQueryOutput,
      );

      const result = await controller.getConversationMessages(
        currentUser,
        conversationId,
        query,
      );

      expect(result).toEqual(mockMessageQueryOutput);
      expect(messagesService.findByConversationId).toHaveBeenCalledWith(
        currentUser,
        conversationId,
        query,
      );
    });

    it('should handle errors when getting messages', async () => {
      const conversationId = 'nonexistent-id';
      const query = { limit: 10, offset: 0 };

      messagesService.findByConversationId.mockRejectedValue(
        new NotFoundException('Conversation not found'),
      );

      await expect(
        controller.getConversationMessages(currentUser, conversationId, query),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('sendMessage', () => {
    it('should send a message in a conversation', async () => {
      const conversationId = 'c69cc25b-0cc4-4032-83c2-0d34c84318ba';
      const createMessageDto: UpdateMessageDTO = {
        content: 'New message content',
      };

      messagesService.create.mockResolvedValue(mockMessage);

      const result = await controller.sendMessage(
        currentUser,
        conversationId,
        createMessageDto,
      );

      expect(result).toEqual(mockMessage);
      expect(messagesService.create).toHaveBeenCalledWith(currentUser, {
        senderId: currentUser.id,
        conversationId,
        ...createMessageDto,
      });
    });

    it('should handle errors when sending message', async () => {
      const conversationId = 'c69cc25b-0cc4-4032-83c2-0d34c84318ba';
      const createMessageDto: UpdateMessageDTO = {
        content: 'New message content',
      };

      messagesService.create.mockRejectedValue(
        new ForbiddenException('Not authorized to send messages'),
      );

      await expect(
        controller.sendMessage(currentUser, conversationId, createMessageDto),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
