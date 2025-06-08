import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { MessagesRepository } from './messages.repository';
import { MessageModel } from './models/message.model';
import { MessageReadStatusModel } from './models/message-read-status.model';
import {
  CreateMessageDTO,
  MessageDTO,
  UpdateMessageDTO,
} from '../dto/message.dto';
import { MessageQueryDTO } from '../dto/message-query.dto';
import { MessageReadStatusDTO } from '../dto/message-read-status.dto';
import {
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { ForeignKeyConstraintError, Op } from 'sequelize';
import { plainToInstance } from 'class-transformer';

describe('MessagesRepository', () => {
  let repository: MessagesRepository;
  let mockMessageModel: any;
  let mockMessageReadStatusModel: any;

  const mockMessage: MessageDTO = plainToInstance(MessageDTO, {
    id: 'm69cc25b-0cc4-4032-83c2-0d34c84318ba',
    senderId: 's69cc25b-0cc4-4032-83c2-0d34c84318ba',
    conversationId: 'c69cc25b-0cc4-4032-83c2-0d34c84318ba',
    content: 'Test message content',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const mockReadStatus: MessageReadStatusDTO = {
    id: 'rs69cc25b-0cc4-4032-83c2-0d34c84318ba',
    messageId: 'm69cc25b-0cc4-4032-83c2-0d34c84318ba',
    userId: 'u69cc25b-0cc4-4032-83c2-0d34c84318ba',
    readAt: new Date(),
  };

  beforeEach(async () => {
    mockMessageModel = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      findByPk: jest.fn(),
      update: jest.fn(),
      destroy: jest.fn(),
      toMessageDTO: jest.fn(),
    };

    mockMessageReadStatusModel = {
      create: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      toMessageReadStatusDTO: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessagesRepository,
        {
          provide: getModelToken(MessageModel),
          useValue: mockMessageModel,
        },
        {
          provide: getModelToken(MessageReadStatusModel),
          useValue: mockMessageReadStatusModel,
        },
      ],
    }).compile();

    repository = module.get<MessagesRepository>(MessagesRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findOneById', () => {
    it('should find a message by ID', async () => {
      const messageInstance = {
        ...mockMessage,
        toMessageDTO: jest.fn().mockReturnValue(mockMessage),
      };

      mockMessageModel.findByPk.mockResolvedValue(messageInstance);

      const result = await repository.findOneById(mockMessage.id);

      expect(result).toEqual(mockMessage);
      expect(mockMessageModel.findByPk).toHaveBeenCalledWith(mockMessage.id, {
        include: [{ model: MessageReadStatusModel, as: 'readStatus' }],
      });
      expect(messageInstance.toMessageDTO).toHaveBeenCalled();
    });

    it('should throw NotFoundException if message not found', async () => {
      mockMessageModel.findByPk.mockResolvedValue(null);

      await expect(repository.findOneById('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
      expect(mockMessageModel.findByPk).toHaveBeenCalledWith(
        'non-existent-id',
        {
          include: [{ model: MessageReadStatusModel, as: 'readStatus' }],
        },
      );
    });

    it('should throw InternalServerErrorException on database error', async () => {
      const error = new Error('Database error');
      mockMessageModel.findByPk.mockRejectedValue(error);

      await expect(repository.findOneById(mockMessage.id)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should re-throw NotFoundException when already thrown', async () => {
      const notFoundError = new NotFoundException('Message not found');
      mockMessageModel.findByPk.mockRejectedValue(notFoundError);

      await expect(repository.findOneById(mockMessage.id)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByConversationId', () => {
    const conversationId = 'c69cc25b-0cc4-4032-83c2-0d34c84318ba';
    const messageInstances = [
      {
        ...mockMessage,
        toMessageDTO: jest.fn().mockReturnValue(mockMessage),
      },
    ];

    it('should find messages by conversation ID', async () => {
      mockMessageModel.findAll.mockResolvedValue(messageInstances);

      const result = await repository.findByConversationId(conversationId);

      expect(result).toEqual([mockMessage]);
      expect(mockMessageModel.findAll).toHaveBeenCalledWith({
        where: { conversationId },
        order: [['createdAt', 'DESC']],
        include: [{ model: MessageReadStatusModel, as: 'readStatus' }],
      });
    });

    it('should apply query options for pagination', async () => {
      const query: MessageQueryDTO = {
        limit: 10,
        before: new Date('2023-12-01'),
      };

      mockMessageModel.findAll.mockResolvedValue(messageInstances);

      const result = await repository.findByConversationId(
        conversationId,
        query,
      );

      expect(result).toEqual([mockMessage]);
      expect(mockMessageModel.findAll).toHaveBeenCalledWith({
        where: {
          conversationId,
          createdAt: { [Op.lt]: query.before },
        },
        order: [['createdAt', 'DESC']],
        include: [{ model: MessageReadStatusModel, as: 'readStatus' }],
        limit: 10,
      });
    });

    it('should apply only limit when before is not provided', async () => {
      const query: MessageQueryDTO = {
        limit: 5,
      };

      mockMessageModel.findAll.mockResolvedValue(messageInstances);

      await repository.findByConversationId(conversationId, query);

      expect(mockMessageModel.findAll).toHaveBeenCalledWith({
        where: { conversationId },
        order: [['createdAt', 'DESC']],
        include: [{ model: MessageReadStatusModel, as: 'readStatus' }],
        limit: 5,
      });
    });

    it('should apply only before when limit is not provided', async () => {
      const query: MessageQueryDTO = {
        before: new Date('2023-12-01'),
      };

      mockMessageModel.findAll.mockResolvedValue(messageInstances);

      await repository.findByConversationId(conversationId, query);

      expect(mockMessageModel.findAll).toHaveBeenCalledWith({
        where: {
          conversationId,
          createdAt: { [Op.lt]: query.before },
        },
        order: [['createdAt', 'DESC']],
        include: [{ model: MessageReadStatusModel, as: 'readStatus' }],
      });
    });

    it('should throw InternalServerErrorException on database error', async () => {
      const error = new Error('Database error');
      mockMessageModel.findAll.mockRejectedValue(error);

      await expect(
        repository.findByConversationId(conversationId),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('create', () => {
    const senderId = 's69cc25b-0cc4-4032-83c2-0d34c84318ba';
    const createMessageDto: CreateMessageDTO = {
      senderId,
      conversationId: 'c69cc25b-0cc4-4032-83c2-0d34c84318ba',
      content: 'Test message content',
    };

    it('should create a new message', async () => {
      const messageInstance = {
        ...mockMessage,
        toMessageDTO: jest.fn().mockReturnValue(mockMessage),
      };

      mockMessageModel.create.mockResolvedValue(messageInstance);

      const result = await repository.create(senderId, createMessageDto);

      expect(result).toEqual(mockMessage);
      expect(mockMessageModel.create).toHaveBeenCalledWith({
        conversationId: createMessageDto.conversationId,
        senderId: senderId,
        content: createMessageDto.content,
      });
      expect(messageInstance.toMessageDTO).toHaveBeenCalled();
    });

    it('should throw BadRequestException on foreign key constraint error', async () => {
      const error = new ForeignKeyConstraintError({
        parent: { sql: 'INSERT INTO Messages...' } as any,
        fields: { conversationId: 'invalid-id' },
        table: 'Messages',
        value: 'invalid-id',
        index: 'fk_conversation',
      });

      mockMessageModel.create.mockRejectedValue(error);

      await expect(
        repository.create(senderId, createMessageDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw InternalServerErrorException on general error', async () => {
      const error = new Error('Database error');
      mockMessageModel.create.mockRejectedValue(error);

      await expect(
        repository.create(senderId, createMessageDto),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should re-throw NotFoundException when already thrown', async () => {
      const notFoundError = new NotFoundException('Conversation not found');
      mockMessageModel.create.mockRejectedValue(notFoundError);

      await expect(
        repository.create(senderId, createMessageDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const messageId = 'm69cc25b-0cc4-4032-83c2-0d34c84318ba';
    const updateData: UpdateMessageDTO = {
      content: 'Updated message content',
    };

    it('should update a message', async () => {
      const messageInstance = {
        ...mockMessage,
        update: jest.fn().mockResolvedValue(undefined),
        toMessageDTO: jest.fn().mockReturnValue({
          ...mockMessage,
          content: updateData.content,
        }),
      };

      mockMessageModel.findByPk.mockResolvedValue(messageInstance);

      const result = await repository.update(messageId, updateData);

      expect(result.content).toBe(updateData.content);
      expect(mockMessageModel.findByPk).toHaveBeenCalledWith(messageId, {
        include: [{ model: MessageReadStatusModel, as: 'readStatus' }],
      });
      expect(messageInstance.update).toHaveBeenCalledWith(updateData);
      expect(messageInstance.toMessageDTO).toHaveBeenCalled();
    });

    it('should throw NotFoundException if message not found', async () => {
      mockMessageModel.findByPk.mockResolvedValue(null);

      await expect(repository.update(messageId, updateData)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException on foreign key constraint error', async () => {
      const messageInstance = {
        update: jest.fn().mockRejectedValue(
          new ForeignKeyConstraintError({
            parent: { sql: 'UPDATE Messages...' } as any,
            fields: { conversationId: 'invalid-id' },
            table: 'Messages',
            value: 'invalid-id',
            index: 'fk_conversation',
          }),
        ),
      };

      mockMessageModel.findByPk.mockResolvedValue(messageInstance);

      await expect(repository.update(messageId, updateData)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw InternalServerErrorException on general error', async () => {
      const messageInstance = {
        update: jest.fn().mockRejectedValue(new Error('Database error')),
      };

      mockMessageModel.findByPk.mockResolvedValue(messageInstance);

      await expect(repository.update(messageId, updateData)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should re-throw NotFoundException when already thrown', async () => {
      const notFoundError = new NotFoundException('Message not found');
      mockMessageModel.findByPk.mockRejectedValue(notFoundError);

      await expect(repository.update(messageId, updateData)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('delete', () => {
    const messageId = 'm69cc25b-0cc4-4032-83c2-0d34c84318ba';

    it('should delete a message', async () => {
      const messageInstance = {
        destroy: jest.fn().mockResolvedValue(undefined),
      };

      mockMessageModel.findByPk.mockResolvedValue(messageInstance);

      const result = await repository.delete(messageId);

      expect(result).toBe(true);
      expect(mockMessageModel.findByPk).toHaveBeenCalledWith(messageId);
      expect(messageInstance.destroy).toHaveBeenCalled();
    });

    it('should throw NotFoundException if message not found', async () => {
      mockMessageModel.findByPk.mockResolvedValue(null);

      await expect(repository.delete(messageId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw InternalServerErrorException on database error', async () => {
      const messageInstance = {
        destroy: jest.fn().mockRejectedValue(new Error('Database error')),
      };

      mockMessageModel.findByPk.mockResolvedValue(messageInstance);

      await expect(repository.delete(messageId)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should re-throw NotFoundException when already thrown', async () => {
      const notFoundError = new NotFoundException('Message not found');
      mockMessageModel.findByPk.mockRejectedValue(notFoundError);

      await expect(repository.delete(messageId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('markAsRead', () => {
    const messageId = 'm69cc25b-0cc4-4032-83c2-0d34c84318ba';
    const userId = 'u69cc25b-0cc4-4032-83c2-0d34c84318ba';

    it('should create new read status if not exists', async () => {
      const messageInstance = { id: messageId };
      const readStatusInstance = {
        ...mockReadStatus,
        toMessageReadStatusDTO: jest.fn().mockReturnValue(mockReadStatus),
      };

      mockMessageModel.findByPk.mockResolvedValue(messageInstance);
      mockMessageReadStatusModel.findOne.mockResolvedValue(null);
      mockMessageReadStatusModel.create.mockResolvedValue(readStatusInstance);

      const result = await repository.markAsRead(messageId, userId);

      expect(result).toEqual(mockReadStatus);
      expect(mockMessageModel.findByPk).toHaveBeenCalledWith(messageId);
      expect(mockMessageReadStatusModel.findOne).toHaveBeenCalledWith({
        where: { messageId, userId },
      });
      expect(mockMessageReadStatusModel.create).toHaveBeenCalledWith({
        messageId,
        userId,
        readAt: expect.any(Date),
      });
      expect(readStatusInstance.toMessageReadStatusDTO).toHaveBeenCalled();
    });

    it('should update existing read status', async () => {
      const messageInstance = { id: messageId };
      const existingReadStatus = {
        update: jest.fn().mockResolvedValue(undefined),
        toMessageReadStatusDTO: jest.fn().mockReturnValue(mockReadStatus),
      };

      mockMessageModel.findByPk.mockResolvedValue(messageInstance);
      mockMessageReadStatusModel.findOne.mockResolvedValue(existingReadStatus);

      const result = await repository.markAsRead(messageId, userId);

      expect(result).toEqual(mockReadStatus);
      expect(existingReadStatus.update).toHaveBeenCalledWith({
        readAt: expect.any(Date),
      });
      expect(existingReadStatus.toMessageReadStatusDTO).toHaveBeenCalled();
    });

    it('should throw NotFoundException if message not found', async () => {
      mockMessageModel.findByPk.mockResolvedValue(null);

      await expect(repository.markAsRead(messageId, userId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException on foreign key constraint error', async () => {
      const messageInstance = { id: messageId };
      const error = new ForeignKeyConstraintError({
        parent: { sql: 'INSERT INTO MessageReadStatus...' } as any,
        fields: { messageId: 'invalid-id' },
        table: 'MessageReadStatus',
        value: 'invalid-id',
        index: 'fk_message',
      });

      mockMessageModel.findByPk.mockResolvedValue(messageInstance);
      mockMessageReadStatusModel.findOne.mockResolvedValue(null);
      mockMessageReadStatusModel.create.mockRejectedValue(error);

      await expect(repository.markAsRead(messageId, userId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw InternalServerErrorException on general error', async () => {
      const messageInstance = { id: messageId };
      const error = new Error('Database error');

      mockMessageModel.findByPk.mockResolvedValue(messageInstance);
      mockMessageReadStatusModel.findOne.mockRejectedValue(error);

      await expect(repository.markAsRead(messageId, userId)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should re-throw NotFoundException when already thrown', async () => {
      const notFoundError = new NotFoundException('Message not found');
      mockMessageModel.findByPk.mockRejectedValue(notFoundError);

      await expect(repository.markAsRead(messageId, userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
