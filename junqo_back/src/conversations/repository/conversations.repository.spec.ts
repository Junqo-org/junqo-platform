import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { ConversationsRepository } from './conversations.repository';
import { ConversationModel } from './models/conversation.model';
import { UserConversationTitleModel } from './models/user-conversation-title.model';
import {
  ConversationDTO,
  CreateConversationDTO,
  UpdateConversationDTO,
} from '../dto/conversation.dto';
import { ConversationQueryDTO } from '../dto/conversation-query.dto';
import { SetConversationTitleDTO } from '../dto/user-conversation-title.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ForeignKeyConstraintError } from 'sequelize';
import { plainToInstance } from 'class-transformer';

const mockConversation: ConversationDTO = plainToInstance(ConversationDTO, {
  id: 'c69cc25b-0cc4-4032-83c2-0d34c84318ba',
  participantsIds: ['u1', 'u2'],
  createdAt: new Date('2023-01-01T00:00:00.000Z'),
  updatedAt: new Date('2023-01-01T00:00:00.000Z'),
  title: 'Test Conversation',
});

describe('ConversationsRepository', () => {
  let repository: ConversationsRepository;
  let mockConversationModel: any;
  let mockUserConversationTitleModel: any;
  let mockTransaction: any;

  beforeEach(async () => {
    mockTransaction = {
      commit: jest.fn(),
      rollback: jest.fn(),
    };

    mockConversationModel = {
      create: jest.fn(),
      findByPk: jest.fn(),
      findAndCountAll: jest.fn(),
      sequelize: {
        transaction: jest.fn().mockResolvedValue(mockTransaction),
      },
    };

    mockUserConversationTitleModel = {
      create: jest.fn(),
      findOne: jest.fn(),
      upsert: jest.fn(),
      destroy: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConversationsRepository,
        {
          provide: getModelToken(ConversationModel),
          useValue: mockConversationModel,
        },
        {
          provide: getModelToken(UserConversationTitleModel),
          useValue: mockUserConversationTitleModel,
        },
      ],
    }).compile();

    repository = module.get<ConversationsRepository>(ConversationsRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('should create a conversation with participants and title', async () => {
      const currentUserId = 'u1';
      const createDto: CreateConversationDTO = {
        participantsIds: ['u1', 'u2'],
        title: 'Test Conversation',
      };

      const mockConversationInstance = {
        id: 'c69cc25b-0cc4-4032-83c2-0d34c84318ba',
        toConversationDTO: jest.fn().mockReturnValue(mockConversation),
        $set: jest.fn().mockResolvedValue(true),
        save: jest.fn().mockResolvedValue(true),
      };

      mockConversationModel.create.mockResolvedValue(mockConversationInstance);
      mockConversationModel.findByPk.mockResolvedValue(
        mockConversationInstance,
      );

      const result = await repository.create(currentUserId, createDto);

      expect(result).toEqual(mockConversation);
      expect(mockConversationModel.create).toHaveBeenCalledWith(
        {},
        { transaction: mockTransaction },
      );
      expect(mockConversationInstance.$set).toHaveBeenCalledWith(
        'participants',
        createDto.participantsIds,
        { transaction: mockTransaction },
      );
      expect(mockConversationInstance.save).toHaveBeenCalledWith({
        transaction: mockTransaction,
      });
      expect(mockTransaction.commit).toHaveBeenCalled();
    });

    it('should handle foreign key constraint errors', async () => {
      const currentUserId = 'u1';
      const createDto: CreateConversationDTO = {
        participantsIds: ['invalid-user-id'],
      };

      const mockConversationInstance = {
        id: 'c69cc25b-0cc4-4032-83c2-0d34c84318ba',
        save: jest.fn(),
        $set: jest
          .fn()
          .mockRejectedValue(
            new ForeignKeyConstraintError({ message: 'Foreign key error' }),
          ),
      };

      mockConversationModel.create.mockResolvedValue(mockConversationInstance);

      await expect(repository.create(currentUserId, createDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });
  });

  describe('findOneById', () => {
    it('should find a conversation by ID', async () => {
      const conversationId = 'c69cc25b-0cc4-4032-83c2-0d34c84318ba';

      const mockConversationInstance = {
        toConversationDTO: jest.fn().mockReturnValue(mockConversation),
      };

      mockConversationModel.findByPk.mockResolvedValue(
        mockConversationInstance,
      );

      const result = await repository.findOneById(conversationId);

      expect(result).toEqual(mockConversation);
      expect(mockConversationModel.findByPk).toHaveBeenCalledWith(
        conversationId,
        expect.objectContaining({
          include: expect.any(Array),
        }),
      );
      expect(mockConversationInstance.toConversationDTO).toHaveBeenCalled();
    });

    it('should return null when conversation not found', async () => {
      const conversationId = 'nonexistent-id';

      mockConversationModel.findByPk.mockResolvedValue(null);

      const result = await repository.findOneById(conversationId);

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update conversation with lastMessageId', async () => {
      const conversationId = 'c69cc25b-0cc4-4032-83c2-0d34c84318ba';
      const updateData: UpdateConversationDTO = {
        lastMessageId: 'm69cc25b-0cc4-4032-83c2-0d34c84318ba',
      };

      const mockConversationInstance = {
        update: jest.fn().mockResolvedValue(true),
        save: jest.fn().mockResolvedValue(true),
        toConversationDTO: jest.fn().mockReturnValue({
          ...mockConversation,
          ...updateData,
        }),
      };

      mockConversationModel.findByPk
        .mockResolvedValueOnce(mockConversationInstance)
        .mockResolvedValueOnce(mockConversationInstance);

      const result = await repository.update(conversationId, updateData);

      expect(result).toEqual({
        ...mockConversation,
        ...updateData,
      });
      expect(mockConversationInstance.update).toHaveBeenCalledWith(
        updateData,
        expect.objectContaining({
          transaction: mockTransaction,
        }),
      );
    });

    it('should throw NotFoundException when conversation not found', async () => {
      const conversationId = 'nonexistent-id';
      const updateData: UpdateConversationDTO = {
        lastMessageId: 'm69cc25b-0cc4-4032-83c2-0d34c84318ba',
      };

      mockConversationModel.findByPk.mockResolvedValue(null);

      await expect(
        repository.update(conversationId, updateData),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByQuery', () => {
    it('should find conversations by query', async () => {
      const currentUserId = 'u1';
      const query: ConversationQueryDTO = {
        limit: 10,
        offset: 0,
      };

      const mockConversationInstances = [
        {
          toConversationDTO: jest.fn().mockReturnValue(mockConversation),
        },
      ];

      mockConversationModel.findAndCountAll.mockResolvedValue({
        count: 1,
        rows: mockConversationInstances,
      });

      const result = await repository.findByQuery(query, currentUserId);

      expect(result).toEqual({
        count: 1,
        rows: [mockConversation],
      });
      expect(mockConversationModel.findAndCountAll).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove a conversation', async () => {
      const conversationId = 'c69cc25b-0cc4-4032-83c2-0d34c84318ba';

      const mockConversationInstance = {
        destroy: jest.fn(),
      };

      mockConversationModel.findByPk.mockResolvedValue(
        mockConversationInstance,
      );

      await repository.remove(conversationId);

      expect(mockConversationModel.findByPk).toHaveBeenCalledWith(
        conversationId,
      );
      expect(mockConversationInstance.destroy).toHaveBeenCalled();
    });

    it('should throw NotFoundException when conversation not found', async () => {
      const conversationId = 'nonexistent-id';

      mockConversationModel.findByPk.mockResolvedValue(null);

      await expect(repository.remove(conversationId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('setConversationTitle', () => {
    it('should set conversation title for user', async () => {
      const userId = 'u1';
      const conversationId = 'c69cc25b-0cc4-4032-83c2-0d34c84318ba';
      const titleDto: SetConversationTitleDTO = {
        title: 'New Custom Title',
      };

      const mockConversationInstance = {
        $has: jest.fn().mockResolvedValue(true),
      };

      const mockUserTitleInstance = {
        userId: 'u1',
        conversationId: 'c69cc25b-0cc4-4032-83c2-0d34c84318ba',
        title: 'New Custom Title',
      };

      mockConversationModel.findByPk.mockResolvedValue(
        mockConversationInstance,
      );
      mockUserConversationTitleModel.upsert.mockResolvedValue([
        mockUserTitleInstance,
        true,
      ]);

      const result = await repository.setConversationTitle(
        userId,
        conversationId,
        titleDto,
      );

      expect(result).toEqual({
        userId: 'u1',
        conversationId: 'c69cc25b-0cc4-4032-83c2-0d34c84318ba',
        title: 'New Custom Title',
      });
      expect(mockConversationInstance.$has).toHaveBeenCalledWith(
        'participants',
        userId,
      );
    });

    it('should throw NotFoundException when conversation not found', async () => {
      const userId = 'u1';
      const conversationId = 'nonexistent-id';
      const titleDto: SetConversationTitleDTO = {
        title: 'New Custom Title',
      };

      mockConversationModel.findByPk.mockResolvedValue(null);

      await expect(
        repository.setConversationTitle(userId, conversationId, titleDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getConversationTitle', () => {
    it('should get conversation title for user', async () => {
      const userId = 'u1';
      const conversationId = 'c69cc25b-0cc4-4032-83c2-0d34c84318ba';

      const mockConversationInstance = {
        $has: jest.fn().mockResolvedValue(true),
      };

      const mockUserTitleInstance = {
        userId: 'u1',
        conversationId: 'c69cc25b-0cc4-4032-83c2-0d34c84318ba',
        title: 'Custom Title',
      };

      mockConversationModel.findByPk.mockResolvedValue(
        mockConversationInstance,
      );
      mockUserConversationTitleModel.findOne.mockResolvedValue(
        mockUserTitleInstance,
      );

      const result = await repository.getConversationTitle(
        userId,
        conversationId,
      );

      expect(result).toEqual({
        userId: 'u1',
        conversationId: 'c69cc25b-0cc4-4032-83c2-0d34c84318ba',
        title: 'Custom Title',
      });
      expect(mockUserConversationTitleModel.findOne).toHaveBeenCalledWith({
        where: { userId, conversationId },
      });
    });

    it('should return null when title not found', async () => {
      const userId = 'u1';
      const conversationId = 'c69cc25b-0cc4-4032-83c2-0d34c84318ba';

      const mockConversationInstance = {
        $has: jest.fn().mockResolvedValue(true),
      };

      mockConversationModel.findByPk.mockResolvedValue(
        mockConversationInstance,
      );
      mockUserConversationTitleModel.findOne.mockResolvedValue(null);

      const result = await repository.getConversationTitle(
        userId,
        conversationId,
      );

      expect(result).toBeNull();
    });
  });

  describe('removeConversationTitle', () => {
    it('should remove conversation title for user', async () => {
      const userId = 'u1';
      const conversationId = 'c69cc25b-0cc4-4032-83c2-0d34c84318ba';

      const mockConversationInstance = {
        $has: jest.fn().mockResolvedValue(true),
      };

      mockConversationModel.findByPk.mockResolvedValue(
        mockConversationInstance,
      );
      mockUserConversationTitleModel.destroy.mockResolvedValue(1);

      await repository.removeConversationTitle(userId, conversationId);

      expect(mockUserConversationTitleModel.destroy).toHaveBeenCalledWith({
        where: { userId, conversationId },
      });
    });
  });
});
