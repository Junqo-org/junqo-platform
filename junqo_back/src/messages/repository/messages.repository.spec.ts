import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { MessagesRepository } from './messages.repository';
import { MessageModel } from './models/message.model';
import { CreateMessageDTO, MessageDTO } from '../dto/message.dto';

describe('MessagesRepository', () => {
  let repository: MessagesRepository;
  let mockMessageModel: any;

  beforeEach(async () => {
    mockMessageModel = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      findByPk: jest.fn(),
      update: jest.fn(),
      destroy: jest.fn(),
      toMessageDTO: jest.fn(),
      sequelize: {
        transaction: jest.fn((transaction) => transaction()),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessagesRepository,
        {
          provide: getModelToken(MessageModel),
          useValue: mockMessageModel,
        },
      ],
    }).compile();

    repository = module.get<MessagesRepository>(MessagesRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('should create a new message', async () => {
      const senderId = 's69cc25b-0cc4-4032-83c2-0d34c84318ba';
      const createMessageDto: CreateMessageDTO = {
        receiverId: 'r69cc25b-0cc4-4032-83c2-0d34c84318ba',
        content: 'content',
      };
      const expectedMessage: MessageDTO = {
        id: 'm69cc25b-0cc4-4032-83c2-0d34c84318ba',
        senderId: senderId,
        receiverId: 'r69cc25b-0cc4-4032-83c2-0d34c84318ba',
        content: 'content',
      };
      const createdMessage: MessageModel = {
        ...expectedMessage,
        ...mockMessageModel,
      };

      createdMessage.toMessageDTO = jest
        .fn()
        .mockResolvedValue(expectedMessage);
      mockMessageModel.create.mockResolvedValue(createdMessage);

      const result = await repository.create(senderId, createMessageDto);
      expect(result).toEqual(expectedMessage);
      expect(createdMessage.toMessageDTO).toHaveBeenCalled();
      expect(mockMessageModel.create).toHaveBeenCalledWith({
        ...createMessageDto,
      });
    });
  });
});
