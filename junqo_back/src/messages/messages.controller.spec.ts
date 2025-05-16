import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { AuthUserDTO } from '../shared/dto/auth-user.dto';
import { MessageDTO } from './dto/message.dto';
import { UserType } from '../users/dto/user-type.enum';
import { plainToInstance } from 'class-transformer';
import { ExperienceDTO } from '../experiences/dto/experience.dto';
import { Mocked, TestBed } from '@suites/unit';
import {
  MessageQueryDTO,
  MessageQueryOutputDTO,
} from './dto/message-query.dto';

const currentUser: AuthUserDTO = plainToInstance(AuthUserDTO, {
  id: 'e69cc25b-0cc4-4032-83c2-0d34c84318ba',
  type: UserType.SCHOOL,
  name: 'test user',
  email: 'test@mail.com',
});

const messages: MessageDTO[] = [
  plainToInstance(MessageDTO, {
    userId: 'e69cc25b-0cc4-4032-83c2-0d34c84318ba',
    name: 'test user',
    avatar: 'https://picsum.photos/200/300',
    skills: ['nestjs', 'flutter', 'work in team'],
    experiences: [
      plainToInstance(ExperienceDTO, {
        title: 'title',
        company: 'company',
        startDate: new Date('01/02/2020'),
        endDate: new Date('01/05/2020'),
        description: 'description',
        skills: ['nestjs', 'flutter', 'work in team'],
      }),
    ],
  }),
  plainToInstance(MessageDTO, {
    userId: 'e69cc25b-0cc4-4032-83c2-0d34c84318bb',
    name: 'test user 2',
    avatar: 'https://picsum.photos/200/300',
    skills: ['nestjs', 'flutter'],
    experiences: [
      plainToInstance(ExperienceDTO, {
        title: 'title 2',
        company: 'company 2',
        startDate: new Date('01/02/2022'),
        endDate: new Date('01/05/2022'),
        description: 'description 2',
        skills: ['nestjs', 'flutter'],
      }),
    ],
  }),
];

describe('MessagesController', () => {
  let controller: MessagesController;
  let messagesService: Mocked<MessagesService>;

  beforeEach(async () => {
    const { unit, unitRef } =
      await TestBed.solitary(MessagesController).compile();

    controller = unit;
    messagesService = unitRef.get(MessagesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('find by query', () => {
    const query: MessageQueryDTO = plainToInstance(MessageQueryDTO, {
      skills: 'skill,js',
      mode: 'any',
      offset: 0,
      limit: 10,
    });

    it('should return every message if no query', async () => {
      const expectedQueryResult: MessageQueryOutputDTO = {
        rows: messages,
        count: messages.length,
      };
      messagesService.findByQuery.mockResolvedValue(expectedQueryResult);

      expect(await controller.findByQuery(currentUser, {})).toEqual(
        expectedQueryResult,
      );
      expect(messagesService.findByQuery).toHaveBeenCalledWith(currentUser, {});
    });

    it('should return every message corresponding to given query', async () => {
      const expectedQueryResult: MessageQueryOutputDTO = {
        rows: messages,
        count: messages.length,
      };
      messagesService.findByQuery.mockResolvedValue(expectedQueryResult);

      expect(await controller.findByQuery(currentUser, query)).toEqual(
        expectedQueryResult,
      );
      expect(messagesService.findByQuery).toHaveBeenCalledWith(
        currentUser,
        query,
      );
    });

    it('should return empty if no message correspond to given query', async () => {
      messagesService.findByQuery.mockResolvedValue({
        rows: [],
        count: 0,
      });

      expect(await controller.findByQuery(currentUser, query)).toEqual({
        rows: [],
        count: 0,
      });
      expect(messagesService.findByQuery).toHaveBeenCalledWith(
        currentUser,
        query,
      );
    });

    it("should throw ForbiddenException if user don't have rights to read school profile", async () => {
      messagesService.findByQuery.mockImplementation(async () => {
        throw new ForbiddenException();
      });

      await expect(controller.findByQuery(currentUser, null)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('findMy', () => {
    it('should find logged in school profile', async () => {
      messagesService.findOneById.mockResolvedValue(messages[0]);

      expect(await controller.findMy(currentUser)).toEqual(messages[0]);
      expect(messagesService.findOneById).toHaveBeenCalledWith(
        currentUser,
        currentUser.id,
      );
    });

    it('should throw NotFoundException if school profile not found', async () => {
      messagesService.findOneById.mockImplementation(async () => {
        throw new NotFoundException();
      });

      await expect(controller.findMy(currentUser)).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should throw ForbiddenException if user don't have rights to read school profile", async () => {
      messagesService.findOneById.mockImplementation(async () => {
        throw new ForbiddenException();
      });

      await expect(controller.findMy(currentUser)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('findOne', () => {
    it('should find a school profile by ID', async () => {
      messagesService.findOneById.mockResolvedValue(messages[0]);

      expect(await controller.findOne(currentUser, messages[0].userId)).toEqual(
        messages[0],
      );
      expect(messagesService.findOneById).toHaveBeenCalledWith(
        currentUser,
        messages[0].userId,
      );
    });

    it('should throw NotFoundException if school profile not found', async () => {
      messagesService.findOneById.mockImplementation(async () => {
        throw new NotFoundException();
      });

      await expect(controller.findOne(currentUser, 'test-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should throw ForbiddenException if user don't have rights to read school profile", async () => {
      messagesService.findOneById.mockImplementation(async () => {
        throw new ForbiddenException();
      });

      await expect(controller.findOne(currentUser, 'test-id')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('updateMy', () => {
    const messageInput: MessageDTO = {
      avatar: 'https://picsum.photos/200/300',
      userId: '',
      name: '',
    };

    it('should update a school profile', async () => {
      const mockProfile: MessageDTO = plainToInstance(MessageDTO, {
        userId: 'test-id',
        name: 'John Doe',
      });
      messagesService.update.mockResolvedValue(mockProfile);

      expect(await controller.updateOne(currentUser, messageInput)).toEqual(
        mockProfile,
      );
      expect(messagesService.update).toHaveBeenCalledWith(
        currentUser,
        messageInput,
      );
    });

    it('should throw NotFoundException if school profile to update not found', async () => {
      messagesService.update.mockImplementation(async () => {
        throw new NotFoundException();
      });

      await expect(
        controller.updateOne(currentUser, messageInput),
      ).rejects.toThrow(NotFoundException);
    });

    it("should throw NotFoundException if user don't have rights to update school profile", async () => {
      messagesService.update.mockImplementation(async () => {
        throw new ForbiddenException();
      });

      await expect(
        controller.updateOne(currentUser, messageInput),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
