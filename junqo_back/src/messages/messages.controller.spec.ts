import { TestBed, Mocked } from '@suites/unit';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import { AuthUserDTO } from '../shared/dto/auth-user.dto';
import { UserType } from '../users/dto/user-type.enum';
import { plainToInstance } from 'class-transformer';
import { MessageDTO, UpdateMessageDTO } from './dto/message.dto';
import {
  ForbiddenException,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';

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

const currentUser: AuthUserDTO = plainToInstance(AuthUserDTO, {
  id: 's69cc25b-0cc4-4032-83c2-0d34c84318ba',
  type: UserType.STUDENT,
  email: 'student@test.com',
  name: 'Student User',
});

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

  describe('findOne', () => {
    it('should return a message by ID', async () => {
      messagesService.findOneById.mockResolvedValue(messagesList[0]);

      const result = await controller.findOne(currentUser, messagesList[0].id);

      expect(result).toBe(messagesList[0]);
      expect(messagesService.findOneById).toHaveBeenCalledWith(
        currentUser,
        messagesList[0].id,
      );
    });

    it('should throw NotFoundException if message does not exist', async () => {
      messagesService.findOneById.mockImplementation(async () => {
        throw new NotFoundException();
      });

      await expect(
        controller.findOne(currentUser, messagesList[0].id),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user cannot access message', async () => {
      messagesService.findOneById.mockImplementation(async () => {
        throw new ForbiddenException();
      });

      await expect(
        controller.findOne(currentUser, messagesList[0].id),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('updateOne', () => {
    const updateMessageDto: UpdateMessageDTO = plainToInstance(
      UpdateMessageDTO,
      {
        content: 'Updated message content',
      },
    );

    it('should update a message', async () => {
      const updatedMessage: MessageDTO = plainToInstance(MessageDTO, {
        ...messagesList[0],
        content: updateMessageDto.content,
      });

      messagesService.update.mockResolvedValue(updatedMessage);

      const result = await controller.updateOne(
        currentUser,
        messagesList[0].id,
        updateMessageDto,
      );

      expect(result).toBe(updatedMessage);
      expect(messagesService.update).toHaveBeenCalledWith(
        currentUser,
        messagesList[0].id,
        updateMessageDto,
      );
    });

    it('should throw NotFoundException if message does not exist', async () => {
      messagesService.update.mockImplementation(async () => {
        throw new NotFoundException();
      });

      await expect(
        controller.updateOne(currentUser, messagesList[0].id, updateMessageDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user cannot update message', async () => {
      messagesService.update.mockImplementation(async () => {
        throw new ForbiddenException();
      });

      await expect(
        controller.updateOne(currentUser, messagesList[0].id, updateMessageDto),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException for invalid data', async () => {
      messagesService.update.mockImplementation(async () => {
        throw new BadRequestException();
      });

      await expect(
        controller.updateOne(currentUser, messagesList[0].id, updateMessageDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw InternalServerErrorException on unexpected error', async () => {
      messagesService.update.mockImplementation(async () => {
        throw new InternalServerErrorException();
      });

      await expect(
        controller.updateOne(currentUser, messagesList[0].id, updateMessageDto),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('deleteOne', () => {
    it('should delete a message', async () => {
      messagesService.delete.mockResolvedValue(undefined);

      const result = await controller.deleteOne(
        currentUser,
        messagesList[0].id,
      );

      expect(result).toBeUndefined();
      expect(messagesService.delete).toHaveBeenCalledWith(
        currentUser,
        messagesList[0].id,
      );
    });

    it('should throw NotFoundException if message does not exist', async () => {
      messagesService.delete.mockImplementation(async () => {
        throw new NotFoundException();
      });

      await expect(
        controller.deleteOne(currentUser, messagesList[0].id),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user cannot delete message', async () => {
      messagesService.delete.mockImplementation(async () => {
        throw new ForbiddenException();
      });

      await expect(
        controller.deleteOne(currentUser, messagesList[0].id),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw InternalServerErrorException on unexpected error', async () => {
      messagesService.delete.mockImplementation(async () => {
        throw new InternalServerErrorException();
      });

      await expect(
        controller.deleteOne(currentUser, messagesList[0].id),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });
});
