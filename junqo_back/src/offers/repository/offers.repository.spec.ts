import { plainToInstance } from 'class-transformer';
import { CreateOfferDTO, OfferDTO, UpdateOfferDTO } from '../dto/offer.dto';
import { OffersRepository } from './offers.repository';
import { OfferStatus } from '../dto/offer-status.enum';
import { OfferModel } from './models/offer.model';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

const offers: OfferDTO[] = [
  plainToInstance(OfferDTO, {
    id: 'e42cc25b-0cc4-4032-83c2-0d34c84318ba',
    userId: 'e69cc25b-0cc4-4032-83c2-0d34c84318ba',
    title: 'Offer 1',
    description: 'Desc',
    createdAt: new Date(),
    updatedAt: new Date(),
    status: OfferStatus.ACTIVE,
    viewCount: 0,
  }),
  plainToInstance(OfferDTO, {
    id: 'e42cc25b-0cc4-4032-83c2-0d34c84318bb',
    userId: 'e69cc25b-0cc4-4032-83c2-0d34c84318bb',
    title: 'Offer 2',
    description: 'Desc 2',
    createdAt: new Date(),
    updatedAt: new Date(),
    status: OfferStatus.INACTIVE,
    viewCount: 10,
  }),
];

describe('OffersRepository', () => {
  let offersRepository: OffersRepository;
  let mockOfferModel: any;

  beforeEach(async () => {
    mockOfferModel = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      findByPk: jest.fn(),
      update: jest.fn(),
      destroy: jest.fn(),
      toOfferDTO: jest.fn(),
      sequelize: {
        transaction: jest.fn((transaction) => transaction()),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OffersRepository,
        {
          provide: getModelToken(OfferModel),
          useValue: mockOfferModel,
        },
      ],
    }).compile();

    offersRepository = module.get<OffersRepository>(OffersRepository);
  });

  it('should be defined', () => {
    expect(offersRepository).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all offers', async () => {
      const offerModels: OfferModel[] = offers.map((offer) => ({
        ...offer,
        ...mockOfferModel,
        toOfferDTO: jest.fn().mockReturnValue(plainToInstance(OfferDTO, offer)),
      }));
      mockOfferModel.findAll.mockResolvedValue(offerModels);

      const result = await offersRepository.findAll();
      expect(result).toEqual(offers);
    });

    it('should return an empty list if there is no offer', async () => {});
  });

  describe('findOneById', () => {
    it('should return an offer by ID', async () => {
      const userId = offers[0].userId;
      const expectedOffer: OfferDTO = offers[0];
      const offerModel: OfferModel = {
        ...offers[0],
        ...mockOfferModel,
        toOfferDTO: jest.fn().mockResolvedValue(expectedOffer),
      };

      mockOfferModel.findByPk.mockResolvedValue(offerModel);

      const result = await offersRepository.findOneById(userId);
      expect(result).toEqual(expectedOffer);
      expect(mockOfferModel.findByPk).toHaveBeenCalledWith(userId);
    });

    it("should throw NotFoundException if the offer don't exists", async () => {
      const userId = 'bad id';

      mockOfferModel.findByPk.mockResolvedValue(null);

      await expect(offersRepository.findOneById(userId)).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(mockOfferModel.findByPk).toHaveBeenCalledWith(userId);
    });
  });

  describe('createOffer', () => {
    it('should create an offer', async () => {
      const createOffer: CreateOfferDTO = plainToInstance(
        CreateOfferDTO,
        offers[0],
        {
          excludeExtraneousValues: true,
        },
      );
      const expectedOffer: OfferDTO = offers[0];
      const offerModel: OfferModel = {
        ...offers[0],
        ...mockOfferModel,
        toOfferDTO: jest.fn().mockResolvedValue(expectedOffer),
      };

      mockOfferModel.create.mockResolvedValue(offerModel);

      const result = await offersRepository.createOffer(createOffer);
      expect(result).toEqual(expectedOffer);
      expect(mockOfferModel.create).toHaveBeenCalledWith(createOffer);
    });

    it('should throw InternalServerErrorException if create fails', async () => {
      const createOffer: CreateOfferDTO = plainToInstance(
        CreateOfferDTO,
        offers[0],
        {
          excludeExtraneousValues: true,
        },
      );

      mockOfferModel.create.mockResolvedValue(null);

      await expect(offersRepository.createOffer(createOffer)).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(mockOfferModel.create).toHaveBeenCalledWith(createOffer);
    });
  });

  describe('updateOffer', () => {
    it('should update an offer', async () => {
      const updateData: UpdateOfferDTO = { title: 'Updated title' };
      const expectedOffer: OfferDTO = offers[0];
      const offerModel: OfferModel = {
        ...offers[0],
        ...mockOfferModel,
        toOfferDTO: jest.fn().mockResolvedValue(expectedOffer),
      };
      offerModel.update = jest.fn().mockResolvedValue({
        ...offerModel,
        ...updateData,
      });

      mockOfferModel.findByPk.mockResolvedValue(offerModel);

      const result = await offersRepository.updateOffer(
        offers[0].id,
        updateData,
      );
      expect(result).toEqual(expectedOffer);
      expect(mockOfferModel.findByPk).toHaveBeenCalledWith(offers[0].id, {
        transaction: undefined,
      });
      expect(offerModel.update).toHaveBeenCalledWith(
        {
          ...updateData,
        },
        { transaction: undefined },
      );
    });

    it('should throw InternalServerErrorException if update fails', async () => {});
  });

  describe('deleteOffer', () => {
    it('should delete an offer', async () => {
      const userId = '8aec0948-58dd-40b2-b085-5a47244036c2';
      const expectedOffer: OfferDTO = new OfferDTO(offers[0]);
      const offerModel: OfferModel = {
        ...offers[0],
        ...mockOfferModel,
        toOfferDTO: jest.fn().mockResolvedValue(expectedOffer),
      };
      offerModel.destroy = jest.fn().mockResolvedValue(true);

      mockOfferModel.findByPk.mockResolvedValue(offerModel);

      const result = await offersRepository.deleteOffer(userId);
      expect(result).toEqual(true);
      expect(offerModel.destroy).toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException if delete fails', async () => {});
  });
});
