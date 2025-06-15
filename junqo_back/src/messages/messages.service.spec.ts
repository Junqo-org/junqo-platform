import { TestBed, Mocked } from '@suites/unit';
import { MessagesService } from './messages.service';
import { MessagesRepository } from './repository/messages.repository';
import { Actions, CaslAbilityFactory } from '../casl/casl-ability.factory';
import { ConversationsService } from '../conversations/conversations.service';
import {
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { AuthUserDTO } from '../shared/dto/auth-user.dto';
import { UserType } from '../users/dto/user-type.enum';
import { plainToInstance } from 'class-transformer';
import {
  CreateMessageDTO,
  MessageDTO,
  UpdateMessageDTO,
} from './dto/message.dto';
import { MessageReadStatusDTO } from './dto/message-read-status.dto';
import { MessageQueryDTO } from './dto/message-query.dto';
import { MessageResource } from '../casl/dto/message-resource.dto';
import { ConversationResource } from '../casl/dto/conversation-resource.dto';
import { ConversationDTO } from '../conversations/dto/conversation.dto';

const messagesList: MessageDTO[] = [
  plainToInstance(MessageDTO, {
    id: 'm69cc25b-0cc4-4032-83c2-0d34c84318ba',
    senderId: 's69cc25b-0cc4-4032-83c2-0d34c84318ba',
    conversationId: 'c69cc25b-0cc4-4032-83c2-0d34c84318ba',
    content: 'Hello, this is a test message',
  }),
  plainToInstance(MessageDTO, {
    id: 'm69cc25b-0cc4-4032-83c2-0d34c84318bb',
    senderId: 's69cc25b-0cc4-4032-83c2-0d34c84318bb',
    conversationId: 'c69cc25b-0cc4-4032-83c2-0d34c84318bb',
    content: 'Another test message',
  }),
];

const authUsersList: AuthUserDTO[] = [
  plainToInstance(AuthUserDTO, {
    id: 's69cc25b-0cc4-4032-83c2-0d34c84318ba',
    type: UserType.STUDENT,
    email: 'student@test.com',
    name: 'Student User',
  }),
  plainToInstance(AuthUserDTO, {
    id: 's69cc25b-0cc4-4032-83c2-0d34c84318bb',
    type: UserType.COMPANY,
    email: 'company@test.com',
    name: 'Company User',
  }),
];

const mockConversation: ConversationDTO = plainToInstance(ConversationDTO, {
  id: 'c69cc25b-0cc4-4032-83c2-0d34c84318ba',
  participantsIds: [
    's69cc25b-0cc4-4032-83c2-0d34c84318ba',
    's69cc25b-0cc4-4032-83c2-0d34c84318bb',
  ],
});

describe('MessagesService', () => {
  let messagesService: MessagesService;
  let messagesRepository: Mocked<MessagesRepository>;
  let caslAbilityFactory: Mocked<CaslAbilityFactory>;
  let conversationsService: Mocked<ConversationsService>;
  let canMockFn: jest.Mock;
  let cannotMockFn: jest.Mock;
  let canMockFnRev: jest.Mock;
  let cannotMockFnRev: jest.Mock;

  beforeEach(async () => {
    canMockFn = jest.fn().mockReturnValue(true);
    cannotMockFn = jest.fn().mockReturnValue(false);
    canMockFnRev = jest.fn().mockReturnValue(false);
    cannotMockFnRev = jest.fn().mockReturnValue(true);

    const mockCaslAbilityFactory = () => ({
      createForUser: jest.fn(() => {
        const ability = {
          can: canMockFn,
          cannot: cannotMockFn,
        };
        return ability;
      }),
    });

    const { unit, unitRef } = await TestBed.solitary(MessagesService)
      .mock(CaslAbilityFactory)
      .impl(mockCaslAbilityFactory)
      .compile();

    messagesService = unit;
    messagesRepository = unitRef.get(MessagesRepository);
    caslAbilityFactory = unitRef.get(CaslAbilityFactory);
    conversationsService = unitRef.get(ConversationsService);
  });

  it('should be defined', () => {
    expect(messagesService).toBeDefined();
  });

  describe('findByConversationId', () => {
    const query: MessageQueryDTO = plainToInstance(MessageQueryDTO, {
      limit: 10,
    });

    it('should return messages from a conversation', async () => {
      conversationsService.findOneById.mockResolvedValue(mockConversation);
      messagesRepository.findByConversationId.mockResolvedValue(messagesList);

      const result = await messagesService.findByConversationId(
        authUsersList[0],
        mockConversation.id,
        query,
      );

      expect(result.rows).toEqual(messagesList);
      expect(result.count).toBe(messagesList.length);
      expect(conversationsService.findOneById).toHaveBeenCalledWith(
        authUsersList[0],
        mockConversation.id,
      );
      expect(messagesRepository.findByConversationId).toHaveBeenCalledWith(
        mockConversation.id,
        query,
      );
      expect(caslAbilityFactory.createForUser).toHaveBeenCalledWith(
        authUsersList[0],
      );
    });

    it('should throw ForbiddenException if user cannot read conversation', async () => {
      conversationsService.findOneById.mockResolvedValue(mockConversation);
      caslAbilityFactory.createForUser.mockImplementationOnce(
        jest.fn().mockReturnValue({
          can: canMockFnRev,
          cannot: cannotMockFnRev,
        }),
      );

      await expect(
        messagesService.findByConversationId(
          authUsersList[0],
          mockConversation.id,
          query,
        ),
      ).rejects.toThrow(ForbiddenException);

      expect(caslAbilityFactory.createForUser).toHaveBeenCalledWith(
        authUsersList[0],
      );
      expect(cannotMockFnRev).toHaveBeenCalledWith(
        Actions.READ,
        expect.any(ConversationResource),
      );
    });

    it('should filter out messages user cannot read', async () => {
      conversationsService.findOneById.mockResolvedValue(mockConversation);
      messagesRepository.findByConversationId.mockResolvedValue(messagesList);

      // Mock ability to filter out some messages
      const canMockFnFiltered = jest.fn();
      canMockFnFiltered
        .mockReturnValueOnce(false) // For conversation cannot check (should return false for cannot)
        .mockReturnValueOnce(true) // For first message can check
        .mockReturnValueOnce(false); // For second message can check (false = cannot read)

      const cannotMockFnFiltered = jest.fn();
      cannotMockFnFiltered.mockReturnValueOnce(false); // For conversation cannot check (false = can read)

      caslAbilityFactory.createForUser.mockImplementationOnce(
        jest.fn().mockReturnValue({
          can: canMockFnFiltered,
          cannot: cannotMockFnFiltered,
        }),
      );

      const result = await messagesService.findByConversationId(
        authUsersList[0],
        mockConversation.id,
        query,
      );

      expect(result.rows).toHaveLength(1);
      expect(result.count).toBe(1);
    });

    it('should throw InternalServerErrorException on unexpected error', async () => {
      conversationsService.findOneById.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(
        messagesService.findByConversationId(
          authUsersList[0],
          mockConversation.id,
          query,
        ),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('findOneById', () => {
    it('should return a message by ID', async () => {
      messagesRepository.findOneById.mockResolvedValue(messagesList[0]);

      const result = await messagesService.findOneById(
        authUsersList[0],
        messagesList[0].id,
      );

      expect(result).toBe(messagesList[0]);
      expect(messagesRepository.findOneById).toHaveBeenCalledWith(
        messagesList[0].id,
      );
      expect(caslAbilityFactory.createForUser).toHaveBeenCalledWith(
        authUsersList[0],
      );
      expect(cannotMockFn).toHaveBeenCalledWith(Actions.READ, messagesList[0]);
    });

    it('should throw NotFoundException if message does not exist', async () => {
      messagesRepository.findOneById.mockResolvedValue(null);

      await expect(
        messagesService.findOneById(authUsersList[0], messagesList[0].id),
      ).rejects.toThrow(NotFoundException);

      expect(messagesRepository.findOneById).toHaveBeenCalledWith(
        messagesList[0].id,
      );
    });

    it('should throw ForbiddenException if user cannot read message', async () => {
      messagesRepository.findOneById.mockResolvedValue(messagesList[0]);
      caslAbilityFactory.createForUser.mockImplementationOnce(
        jest.fn().mockReturnValue({
          can: canMockFnRev,
          cannot: cannotMockFnRev,
        }),
      );

      await expect(
        messagesService.findOneById(authUsersList[0], messagesList[0].id),
      ).rejects.toThrow(ForbiddenException);

      expect(caslAbilityFactory.createForUser).toHaveBeenCalledWith(
        authUsersList[0],
      );
      expect(cannotMockFnRev).toHaveBeenCalledWith(
        Actions.READ,
        messagesList[0],
      );
    });
  });

  describe('create', () => {
    const createMessageDto: CreateMessageDTO = plainToInstance(
      CreateMessageDTO,
      {
        senderId: authUsersList[0].id,
        conversationId: mockConversation.id,
        content: 'New test message',
      },
    );

    it('should create a new message', async () => {
      const expectedMessage = plainToInstance(MessageDTO, {
        id: 'new-message-id',
        ...createMessageDto,
      });

      conversationsService.findOneById.mockResolvedValue(mockConversation);
      messagesRepository.create.mockResolvedValue(expectedMessage);
      conversationsService.update.mockResolvedValue(mockConversation);

      const result = await messagesService.create(
        authUsersList[0],
        createMessageDto,
      );

      expect(result).toBe(expectedMessage);
      expect(conversationsService.findOneById).toHaveBeenCalledWith(
        authUsersList[0],
        createMessageDto.conversationId,
      );
      expect(messagesRepository.create).toHaveBeenCalledWith(
        authUsersList[0].id,
        createMessageDto,
      );
      expect(conversationsService.update).toHaveBeenCalledWith(
        authUsersList[0],
        mockConversation.id,
        { lastMessageId: expectedMessage.id },
      );
      expect(caslAbilityFactory.createForUser).toHaveBeenCalledWith(
        authUsersList[0],
      );
    });

    it('should throw BadRequestException if conversation does not exist', async () => {
      conversationsService.findOneById.mockResolvedValue(null);

      await expect(
        messagesService.create(authUsersList[0], createMessageDto),
      ).rejects.toThrow(BadRequestException);

      expect(conversationsService.findOneById).toHaveBeenCalledWith(
        authUsersList[0],
        createMessageDto.conversationId,
      );
    });

    it('should throw ForbiddenException if user cannot create message', async () => {
      conversationsService.findOneById.mockResolvedValue(mockConversation);
      caslAbilityFactory.createForUser.mockImplementationOnce(
        jest.fn().mockReturnValue({
          can: canMockFnRev,
          cannot: cannotMockFnRev,
        }),
      );

      await expect(
        messagesService.create(authUsersList[0], createMessageDto),
      ).rejects.toThrow(ForbiddenException);

      expect(caslAbilityFactory.createForUser).toHaveBeenCalledWith(
        authUsersList[0],
      );
      expect(cannotMockFnRev).toHaveBeenCalledWith(
        Actions.CREATE,
        expect.any(MessageResource),
      );
    });

    it('should throw InternalServerErrorException on unexpected error', async () => {
      conversationsService.findOneById.mockResolvedValue(mockConversation);
      messagesRepository.create.mockRejectedValue(new Error('Database error'));

      await expect(
        messagesService.create(authUsersList[0], createMessageDto),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('update', () => {
    const updateMessageDto: UpdateMessageDTO = plainToInstance(
      UpdateMessageDTO,
      {
        content: 'Updated message content',
      },
    );

    it('should update a message', async () => {
      const updatedMessage = plainToInstance(MessageDTO, {
        ...messagesList[0],
        ...updateMessageDto,
      });

      messagesRepository.findOneById.mockResolvedValue(messagesList[0]);
      messagesRepository.update.mockResolvedValue(updatedMessage);

      const result = await messagesService.update(
        authUsersList[0],
        messagesList[0].id,
        updateMessageDto,
      );

      expect(result).toBe(updatedMessage);
      expect(messagesRepository.findOneById).toHaveBeenCalledWith(
        messagesList[0].id,
      );
      expect(messagesRepository.update).toHaveBeenCalledWith(
        messagesList[0].id,
        updateMessageDto,
      );
      expect(caslAbilityFactory.createForUser).toHaveBeenCalledWith(
        authUsersList[0],
      );
      expect(cannotMockFn).toHaveBeenCalledWith(
        Actions.UPDATE,
        messagesList[0],
      );
    });

    it('should throw NotFoundException if message does not exist', async () => {
      messagesRepository.findOneById.mockResolvedValue(null);

      await expect(
        messagesService.update(
          authUsersList[0],
          messagesList[0].id,
          updateMessageDto,
        ),
      ).rejects.toThrow(NotFoundException);

      expect(messagesRepository.findOneById).toHaveBeenCalledWith(
        messagesList[0].id,
      );
    });

    it('should throw ForbiddenException if user cannot update message', async () => {
      messagesRepository.findOneById.mockResolvedValue(messagesList[0]);
      caslAbilityFactory.createForUser.mockImplementationOnce(
        jest.fn().mockReturnValue({
          can: canMockFnRev,
          cannot: cannotMockFnRev,
        }),
      );

      await expect(
        messagesService.update(
          authUsersList[0],
          messagesList[0].id,
          updateMessageDto,
        ),
      ).rejects.toThrow(ForbiddenException);

      expect(caslAbilityFactory.createForUser).toHaveBeenCalledWith(
        authUsersList[0],
      );
      expect(cannotMockFnRev).toHaveBeenCalledWith(
        Actions.UPDATE,
        messagesList[0],
      );
    });

    it('should throw InternalServerErrorException on unexpected error', async () => {
      messagesRepository.findOneById.mockResolvedValue(messagesList[0]);
      messagesRepository.update.mockRejectedValue(new Error('Database error'));

      await expect(
        messagesService.update(
          authUsersList[0],
          messagesList[0].id,
          updateMessageDto,
        ),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('delete', () => {
    it('should delete a message', async () => {
      messagesRepository.findOneById.mockResolvedValue(messagesList[0]);
      messagesRepository.delete.mockResolvedValue(true);

      await messagesService.delete(authUsersList[0], messagesList[0].id);

      expect(messagesRepository.findOneById).toHaveBeenCalledWith(
        messagesList[0].id,
      );
      expect(messagesRepository.delete).toHaveBeenCalledWith(
        messagesList[0].id,
      );
      expect(caslAbilityFactory.createForUser).toHaveBeenCalledWith(
        authUsersList[0],
      );
      expect(cannotMockFn).toHaveBeenCalledWith(
        Actions.DELETE,
        messagesList[0],
      );
    });

    it('should throw NotFoundException if message does not exist', async () => {
      messagesRepository.findOneById.mockResolvedValue(null);

      await expect(
        messagesService.delete(authUsersList[0], messagesList[0].id),
      ).rejects.toThrow(NotFoundException);

      expect(messagesRepository.findOneById).toHaveBeenCalledWith(
        messagesList[0].id,
      );
    });

    it('should throw ForbiddenException if user cannot delete message', async () => {
      messagesRepository.findOneById.mockResolvedValue(messagesList[0]);
      caslAbilityFactory.createForUser.mockImplementationOnce(
        jest.fn().mockReturnValue({
          can: canMockFnRev,
          cannot: cannotMockFnRev,
        }),
      );

      await expect(
        messagesService.delete(authUsersList[0], messagesList[0].id),
      ).rejects.toThrow(ForbiddenException);

      expect(caslAbilityFactory.createForUser).toHaveBeenCalledWith(
        authUsersList[0],
      );
      expect(cannotMockFnRev).toHaveBeenCalledWith(
        Actions.DELETE,
        messagesList[0],
      );
    });

    it('should throw InternalServerErrorException if deletion fails', async () => {
      messagesRepository.findOneById.mockResolvedValue(messagesList[0]);
      messagesRepository.delete.mockResolvedValue(false);

      await expect(
        messagesService.delete(authUsersList[0], messagesList[0].id),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should throw InternalServerErrorException on unexpected error', async () => {
      messagesRepository.findOneById.mockResolvedValue(messagesList[0]);
      messagesRepository.delete.mockRejectedValue(new Error('Database error'));

      await expect(
        messagesService.delete(authUsersList[0], messagesList[0].id),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('markAsRead', () => {
    it('should mark a message as read', async () => {
      messagesRepository.findOneById.mockResolvedValue(messagesList[0]);
      const mockReadStatus: MessageReadStatusDTO = plainToInstance(
        MessageReadStatusDTO,
        {
          id: 'read-status-id',
          messageId: messagesList[0].id,
          userId: authUsersList[0].id,
          readAt: new Date(),
        },
      );
      messagesRepository.markAsRead.mockResolvedValue(mockReadStatus);

      await messagesService.markAsRead(messagesList[0].id, authUsersList[0].id);

      expect(messagesRepository.findOneById).toHaveBeenCalledWith(
        messagesList[0].id,
      );
      expect(messagesRepository.markAsRead).toHaveBeenCalledWith(
        messagesList[0].id,
        authUsersList[0].id,
      );
    });

    it('should throw NotFoundException if message does not exist', async () => {
      messagesRepository.findOneById.mockResolvedValue(null);

      await expect(
        messagesService.markAsRead(messagesList[0].id, authUsersList[0].id),
      ).rejects.toThrow(NotFoundException);

      expect(messagesRepository.findOneById).toHaveBeenCalledWith(
        messagesList[0].id,
      );
    });

    it('should throw InternalServerErrorException if mark as read fails', async () => {
      messagesRepository.findOneById.mockResolvedValue(messagesList[0]);
      // markAsRead should throw an error to indicate failure
      messagesRepository.markAsRead.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(
        messagesService.markAsRead(messagesList[0].id, authUsersList[0].id),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });
});
