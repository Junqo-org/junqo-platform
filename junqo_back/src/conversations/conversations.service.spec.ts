import { TestBed, Mocked } from '@suites/unit';
import { ConversationsService } from './conversations.service';
import { ConversationsRepository } from './repository/conversations.repository';
import { CaslAbilityFactory } from '../casl/casl-ability.factory';
import { AuthUserDTO } from '../shared/dto/auth-user.dto';
import { UserType } from '../users/dto/user-type.enum';
import { plainToInstance } from 'class-transformer';
import {
  ConversationDTO,
  CreateConversationDTO,
  AddParticipantsDTO,
  RemoveParticipantsDTO,
  UpdateConversationDTO,
} from './dto/conversation.dto';
import {
  ConversationQueryDTO,
  ConversationQueryOutputDTO,
} from './dto/conversation-query.dto';
import {
  SetConversationTitleDTO,
  UserConversationTitleDTO,
} from './dto/user-conversation-title.dto';

import {
  ForbiddenException,
  NotFoundException,
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
  {
    id: 'c69cc25b-0cc4-4032-83c2-0d34c84318bb',
    participantsIds: ['u1', 'u3'],
    createdAt: new Date('2023-01-01T00:00:00.000Z'),
    updatedAt: new Date('2023-01-01T00:00:00.000Z'),
    title: undefined,
    lastMessage: undefined,
  } as ConversationDTO,
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

const currentUser: AuthUserDTO = plainToInstance(AuthUserDTO, {
  id: 'u1',
  type: UserType.STUDENT,
  email: 'student@test.com',
  name: 'Student User',
});

describe('ConversationsService', () => {
  let service: ConversationsService;
  let conversationsRepository: Mocked<ConversationsRepository>;
  let caslAbilityFactory: Mocked<CaslAbilityFactory>;
  let mockAbility: any;

  beforeEach(async () => {
    mockAbility = {
      can: jest.fn(),
      cannot: jest.fn(),
    };

    const mockCaslAbilityFactory = () => ({
      createForUser: jest.fn().mockReturnValue(mockAbility),
    });

    const { unit, unitRef } = await TestBed.solitary(ConversationsService)
      .mock(CaslAbilityFactory)
      .impl(mockCaslAbilityFactory)
      .compile();

    service = unit;
    conversationsRepository = unitRef.get(ConversationsRepository);
    caslAbilityFactory = unitRef.get(CaslAbilityFactory);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findByQuery', () => {
    it('should return filtered conversations when user has permission', async () => {
      const query: ConversationQueryDTO = {
        limit: 10,
        offset: 0,
      };

      conversationsRepository.findByQuery.mockResolvedValue(
        mockConversationQueryOutput,
      );
      mockAbility.cannot.mockReturnValue(false); // User can read

      const result = await service.findByQuery(currentUser, query);

      expect(result).toEqual(mockConversationQueryOutput);
      expect(conversationsRepository.findByQuery).toHaveBeenCalledWith(
        query,
        currentUser.id,
      );
      expect(caslAbilityFactory.createForUser).toHaveBeenCalledWith(
        currentUser,
      );
    });

    it('should filter out conversations user cannot read', async () => {
      const query: ConversationQueryDTO = {
        limit: 10,
        offset: 0,
      };

      conversationsRepository.findByQuery.mockResolvedValue(
        mockConversationQueryOutput,
      );

      // Mock that user cannot read the first conversation
      mockAbility.cannot
        .mockReturnValueOnce(true) // Cannot read first conversation
        .mockReturnValueOnce(false); // Can read second conversation

      const result = await service.findByQuery(currentUser, query);

      expect(result.rows).toHaveLength(1);
      expect(result.count).toBe(1);
      expect(result.rows[0]).toEqual(mockConversationsList[1]);
    });

    it('should handle query with participant filter', async () => {
      const query: ConversationQueryDTO = {
        limit: 10,
        offset: 0,
        participantId: 'u2',
      };

      conversationsRepository.findByQuery.mockResolvedValue(
        mockConversationQueryOutput,
      );
      mockAbility.cannot.mockReturnValue(false);

      const result = await service.findByQuery(currentUser, query);

      expect(result).toEqual(mockConversationQueryOutput);
      expect(conversationsRepository.findByQuery).toHaveBeenCalledWith(
        query,
        currentUser.id,
      );
    });
  });

  describe('findOneById', () => {
    it('should return conversation when user has permission', async () => {
      const conversationId = 'c69cc25b-0cc4-4032-83c2-0d34c84318ba';

      conversationsRepository.findOneById.mockResolvedValue(mockConversation);
      mockAbility.cannot.mockReturnValue(false); // User can read

      const result = await service.findOneById(currentUser, conversationId);

      expect(result).toEqual(mockConversation);
      expect(conversationsRepository.findOneById).toHaveBeenCalledWith(
        conversationId,
      );
    });

    it('should throw NotFoundException when conversation not found', async () => {
      const conversationId = 'nonexistent-id';

      conversationsRepository.findOneById.mockResolvedValue(null);

      await expect(
        service.findOneById(currentUser, conversationId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when user cannot read conversation', async () => {
      const conversationId = 'c69cc25b-0cc4-4032-83c2-0d34c84318ba';

      conversationsRepository.findOneById.mockResolvedValue(mockConversation);
      mockAbility.cannot.mockReturnValue(true); // User cannot read

      await expect(
        service.findOneById(currentUser, conversationId),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('create', () => {
    it('should create conversation when user has permission', async () => {
      const createDto: CreateConversationDTO = {
        participantsIds: ['u2'],
        title: 'Test Conversation',
      };

      mockAbility.cannot.mockReturnValue(false); // User can create
      conversationsRepository.create.mockResolvedValue(mockConversation);

      const result = await service.create(currentUser, createDto);

      expect(result).toEqual(mockConversation);
      expect(conversationsRepository.create).toHaveBeenCalledWith(
        currentUser.id,
        {
          participantsIds: ['u2', 'u1'], // Current user added
          title: 'Test Conversation',
        },
      );
    });

    it('should add current user to participants if not included', async () => {
      const createDto: CreateConversationDTO = {
        participantsIds: ['u2', 'u3'],
        title: 'Test Conversation',
      };

      mockAbility.cannot.mockReturnValue(false);
      conversationsRepository.create.mockResolvedValue(mockConversation);

      await service.create(currentUser, createDto);

      expect(conversationsRepository.create).toHaveBeenCalledWith(
        currentUser.id,
        {
          participantsIds: ['u2', 'u3', 'u1'], // Current user added
          title: 'Test Conversation',
        },
      );
    });

    it('should not duplicate current user in participants', async () => {
      const createDto: CreateConversationDTO = {
        participantsIds: ['u1', 'u2'], // Current user already included
        title: 'Test Conversation',
      };

      mockAbility.cannot.mockReturnValue(false);
      conversationsRepository.create.mockResolvedValue(mockConversation);

      await service.create(currentUser, createDto);

      expect(conversationsRepository.create).toHaveBeenCalledWith(
        currentUser.id,
        {
          participantsIds: ['u1', 'u2'], // No duplication
          title: 'Test Conversation',
        },
      );
    });

    it('should throw ForbiddenException when user cannot create conversation', async () => {
      const createDto: CreateConversationDTO = {
        participantsIds: ['u2'],
        title: 'Test Conversation',
      };

      mockAbility.cannot.mockReturnValue(true); // User cannot create

      await expect(service.create(currentUser, createDto)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('update', () => {
    it('should update conversation when user has permission', async () => {
      const conversationId = 'c69cc25b-0cc4-4032-83c2-0d34c84318ba';
      const updateData: UpdateConversationDTO = {
        lastMessageId: 'm69cc25b-0cc4-4032-83c2-0d34c84318ba',
      };

      conversationsRepository.findOneById.mockResolvedValue(mockConversation);
      mockAbility.cannot.mockReturnValue(false); // User can update
      conversationsRepository.update.mockResolvedValue({
        ...mockConversation,
        ...updateData,
      });

      const result = await service.update(
        currentUser,
        conversationId,
        updateData,
      );

      expect(result).toEqual({
        ...mockConversation,
        ...updateData,
      });
      expect(conversationsRepository.update).toHaveBeenCalledWith(
        conversationId,
        updateData,
      );
    });

    it('should throw NotFoundException when conversation not found', async () => {
      const conversationId = 'nonexistent-id';
      const updateData: UpdateConversationDTO = {
        lastMessageId: 'm69cc25b-0cc4-4032-83c2-0d34c84318ba',
      };

      conversationsRepository.findOneById.mockResolvedValue(null);

      await expect(
        service.update(currentUser, conversationId, updateData),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when user cannot update conversation', async () => {
      const conversationId = 'c69cc25b-0cc4-4032-83c2-0d34c84318ba';
      const updateData: UpdateConversationDTO = {
        lastMessageId: 'm69cc25b-0cc4-4032-83c2-0d34c84318ba',
      };

      conversationsRepository.findOneById.mockResolvedValue(mockConversation);
      mockAbility.cannot.mockReturnValue(true); // User cannot update

      await expect(
        service.update(currentUser, conversationId, updateData),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('addParticipants', () => {
    it('should add participants when user has permission', async () => {
      const conversationId = 'c69cc25b-0cc4-4032-83c2-0d34c84318ba';
      const addParticipantsDto: AddParticipantsDTO = {
        participantsIds: ['u3', 'u4'],
      };

      const updatedConversation = {
        ...mockConversation,
        participantsIds: ['u1', 'u2', 'u3', 'u4'],
      };

      conversationsRepository.findOneById.mockResolvedValue(mockConversation);
      mockAbility.cannot.mockReturnValue(false); // User can update
      conversationsRepository.update.mockResolvedValue(updatedConversation);

      const result = await service.addParticipants(
        currentUser,
        conversationId,
        addParticipantsDto,
      );

      expect(result).toEqual(updatedConversation);
      expect(conversationsRepository.update).toHaveBeenCalledWith(
        conversationId,
        {
          participantsIds: ['u1', 'u2', 'u3', 'u4'],
        },
      );
    });

    it('should not duplicate existing participants', async () => {
      const conversationId = 'c69cc25b-0cc4-4032-83c2-0d34c84318ba';
      const addParticipantsDto: AddParticipantsDTO = {
        participantsIds: ['u1', 'u3'], // u1 already exists
      };

      const updatedConversation = {
        ...mockConversation,
        participantsIds: ['u1', 'u2', 'u3'],
      };

      conversationsRepository.findOneById.mockResolvedValue(mockConversation);
      mockAbility.cannot.mockReturnValue(false);
      conversationsRepository.update.mockResolvedValue(updatedConversation);

      const result = await service.addParticipants(
        currentUser,
        conversationId,
        addParticipantsDto,
      );

      expect(result).toEqual(updatedConversation);
      expect(conversationsRepository.update).toHaveBeenCalledWith(
        conversationId,
        {
          participantsIds: ['u1', 'u2', 'u3'], // No duplicates
        },
      );
    });

    it('should throw ForbiddenException when user cannot update conversation', async () => {
      const conversationId = 'c69cc25b-0cc4-4032-83c2-0d34c84318ba';
      const addParticipantsDto: AddParticipantsDTO = {
        participantsIds: ['u3'],
      };

      conversationsRepository.findOneById.mockResolvedValue(mockConversation);
      mockAbility.cannot.mockReturnValue(true); // User cannot update

      await expect(
        service.addParticipants(
          currentUser,
          conversationId,
          addParticipantsDto,
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should handle repository errors', async () => {
      const conversationId = 'c69cc25b-0cc4-4032-83c2-0d34c84318ba';
      const addParticipantsDto: AddParticipantsDTO = {
        participantsIds: ['u3'],
      };

      conversationsRepository.findOneById.mockResolvedValue(mockConversation);
      mockAbility.cannot.mockReturnValue(false);
      conversationsRepository.update.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(
        service.addParticipants(
          currentUser,
          conversationId,
          addParticipantsDto,
        ),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('removeParticipants', () => {
    it('should remove participants when user has permission', async () => {
      const conversationId = 'c69cc25b-0cc4-4032-83c2-0d34c84318ba';
      const removeParticipantsDto: RemoveParticipantsDTO = {
        participantsIds: ['u2'],
      };

      const updatedConversation = {
        ...mockConversation,
        participantsIds: ['u1'],
      };

      conversationsRepository.findOneById.mockResolvedValue(mockConversation);
      mockAbility.cannot.mockReturnValue(false); // User can update
      conversationsRepository.update.mockResolvedValue(updatedConversation);

      const result = await service.removeParticipants(
        currentUser,
        conversationId,
        removeParticipantsDto,
      );

      expect(result).toEqual(updatedConversation);
      expect(conversationsRepository.update).toHaveBeenCalledWith(
        conversationId,
        {
          participantsIds: ['u1'],
        },
      );
    });

    it('should throw ForbiddenException when trying to remove all participants', async () => {
      const conversationId = 'c69cc25b-0cc4-4032-83c2-0d34c84318ba';
      const removeParticipantsDto: RemoveParticipantsDTO = {
        participantsIds: ['u1', 'u2'], // Remove all participants
      };

      conversationsRepository.findOneById.mockResolvedValue(mockConversation);
      mockAbility.cannot.mockReturnValue(false);

      await expect(
        service.removeParticipants(
          currentUser,
          conversationId,
          removeParticipantsDto,
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException when user cannot update conversation', async () => {
      const conversationId = 'c69cc25b-0cc4-4032-83c2-0d34c84318ba';
      const removeParticipantsDto: RemoveParticipantsDTO = {
        participantsIds: ['u2'],
      };

      conversationsRepository.findOneById.mockResolvedValue(mockConversation);
      mockAbility.cannot.mockReturnValue(true); // User cannot update

      await expect(
        service.removeParticipants(
          currentUser,
          conversationId,
          removeParticipantsDto,
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should handle repository errors', async () => {
      const conversationId = 'c69cc25b-0cc4-4032-83c2-0d34c84318ba';
      const removeParticipantsDto: RemoveParticipantsDTO = {
        participantsIds: ['u2'],
      };

      conversationsRepository.findOneById.mockResolvedValue(mockConversation);
      mockAbility.cannot.mockReturnValue(false);
      conversationsRepository.update.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(
        service.removeParticipants(
          currentUser,
          conversationId,
          removeParticipantsDto,
        ),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('delete', () => {
    it('should delete conversation when user has permission', async () => {
      const conversationId = 'c69cc25b-0cc4-4032-83c2-0d34c84318ba';

      conversationsRepository.findOneById.mockResolvedValue(mockConversation);
      mockAbility.cannot.mockReturnValue(false); // User can delete
      conversationsRepository.remove.mockResolvedValue();

      await service.delete(currentUser, conversationId);

      expect(conversationsRepository.remove).toHaveBeenCalledWith(
        conversationId,
      );
    });

    it('should throw NotFoundException when conversation not found', async () => {
      const conversationId = 'nonexistent-id';

      conversationsRepository.findOneById.mockResolvedValue(null);

      await expect(service.delete(currentUser, conversationId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException when user cannot delete conversation', async () => {
      const conversationId = 'c69cc25b-0cc4-4032-83c2-0d34c84318ba';

      conversationsRepository.findOneById.mockResolvedValue(mockConversation);
      mockAbility.cannot.mockReturnValue(true); // User cannot delete

      await expect(service.delete(currentUser, conversationId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('setConversationTitle', () => {
    it('should set conversation title when user has permission', async () => {
      const conversationId = 'c69cc25b-0cc4-4032-83c2-0d34c84318ba';
      const titleDto: SetConversationTitleDTO = {
        title: 'New Custom Title',
      };

      const updatedTitle = {
        ...mockUserConversationTitle,
        title: 'New Custom Title',
      };

      conversationsRepository.findOneById.mockResolvedValue(mockConversation);
      mockAbility.cannot.mockReturnValue(false); // User can update
      conversationsRepository.setConversationTitle.mockResolvedValue(
        updatedTitle,
      );

      const result = await service.setConversationTitle(
        currentUser,
        conversationId,
        titleDto,
      );

      expect(result).toEqual(updatedTitle);
      expect(conversationsRepository.setConversationTitle).toHaveBeenCalledWith(
        currentUser.id,
        conversationId,
        titleDto,
      );
    });

    it('should throw ForbiddenException when user cannot update conversation', async () => {
      const conversationId = 'c69cc25b-0cc4-4032-83c2-0d34c84318ba';
      const titleDto: SetConversationTitleDTO = {
        title: 'New Custom Title',
      };

      conversationsRepository.findOneById.mockResolvedValue(mockConversation);
      mockAbility.cannot.mockReturnValue(true); // User cannot update

      await expect(
        service.setConversationTitle(currentUser, conversationId, titleDto),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getConversationTitle', () => {
    it('should get conversation title when user is participant', async () => {
      const conversationId = 'c69cc25b-0cc4-4032-83c2-0d34c84318ba';

      conversationsRepository.findOneById.mockResolvedValue(mockConversation);
      mockAbility.cannot.mockReturnValue(false); // User can read
      conversationsRepository.getConversationTitle.mockResolvedValue(
        mockUserConversationTitle,
      );

      const result = await service.getConversationTitle(
        currentUser,
        conversationId,
      );

      expect(result).toEqual(mockUserConversationTitle);
      expect(conversationsRepository.getConversationTitle).toHaveBeenCalledWith(
        currentUser.id,
        conversationId,
      );
    });

    it('should return null when title not found', async () => {
      const conversationId = 'c69cc25b-0cc4-4032-83c2-0d34c84318ba';

      conversationsRepository.findOneById.mockResolvedValue(mockConversation);
      mockAbility.cannot.mockReturnValue(false);
      conversationsRepository.getConversationTitle.mockResolvedValue(null);

      const result = await service.getConversationTitle(
        currentUser,
        conversationId,
      );

      expect(result).toBeNull();
    });
  });

  describe('removeConversationTitle', () => {
    it('should remove conversation title when user has permission', async () => {
      const conversationId = 'c69cc25b-0cc4-4032-83c2-0d34c84318ba';

      conversationsRepository.findOneById.mockResolvedValue(mockConversation);
      mockAbility.cannot.mockReturnValue(false); // User can update
      conversationsRepository.removeConversationTitle.mockResolvedValue();

      await service.removeConversationTitle(currentUser, conversationId);

      expect(
        conversationsRepository.removeConversationTitle,
      ).toHaveBeenCalledWith(currentUser.id, conversationId);
    });

    it('should throw ForbiddenException when user cannot update conversation', async () => {
      const conversationId = 'c69cc25b-0cc4-4032-83c2-0d34c84318ba';

      conversationsRepository.findOneById.mockResolvedValue(mockConversation);
      mockAbility.cannot.mockReturnValue(true); // User cannot update

      await expect(
        service.removeConversationTitle(currentUser, conversationId),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('updateParticipantsList', () => {
    it('should correctly add and remove participants', () => {
      const currentParticipants = ['u1', 'u2', 'u3'];
      const addParticipants = ['u4', 'u5'];
      const removeParticipants = ['u2'];

      // Access private method via reflection
      const result = (service as any).updateParticipantsList(
        currentParticipants,
        addParticipants,
        removeParticipants,
      );

      expect(result).toEqual(['u1', 'u3', 'u4', 'u5']);
    });

    it('should handle duplicates correctly', () => {
      const currentParticipants = ['u1', 'u2'];
      const addParticipants = ['u1', 'u3']; // u1 is duplicate
      const removeParticipants = [];

      const result = (service as any).updateParticipantsList(
        currentParticipants,
        addParticipants,
        removeParticipants,
      );

      expect(result).toEqual(['u1', 'u2', 'u3']); // No duplicates
    });

    it('should handle empty arrays', () => {
      const currentParticipants = ['u1', 'u2'];
      const addParticipants = [];
      const removeParticipants = [];

      const result = (service as any).updateParticipantsList(
        currentParticipants,
        addParticipants,
        removeParticipants,
      );

      expect(result).toEqual(['u1', 'u2']);
    });
  });
});
