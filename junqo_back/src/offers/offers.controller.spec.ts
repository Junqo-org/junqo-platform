import { OffersController } from './offers.controller';
import { OffersService } from './offers.service';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateOfferDTO, OfferDTO, UpdateOfferDTO } from './dto/offer.dto';
import { Mocked, TestBed } from '@suites/unit';
import { AuthUserDTO } from '../shared/dto/auth-user.dto';
import { plainToInstance } from 'class-transformer';
import { UserType } from '../users/dto/user-type.enum';
import { OfferStatus } from './dto/offer-status.enum';
import { OfferType } from './dto/offer-type.enum';
import { WorkContext } from './dto/work-context.enum';

describe('OffersController', () => {
  let controller: OffersController;
  let service: Mocked<OffersService>;

  const mockCurrentUser: AuthUserDTO = plainToInstance(AuthUserDTO, {
    id: 'e69cc25b-0cc4-4032-83c2-0d34c84318ba',
    type: UserType.COMPANY,
    name: 'test user',
    email: 'test@mail.com',
  });

  const mockOffers: OfferDTO[] = [
    new OfferDTO({
      id: '1oec0948-58dd-40b2-b085-5a47244036c2',
      userId: '1uec0948-58dd-40b2-b085-5a47244036c2',
      createdAt: new Date('2024-01-01T00:00:00Z'),
      updatedAt: new Date('2024-01-02T00:00:00Z'),
      title: 'Sample Offer',
      description: 'This is a test offer.',
      status: OfferStatus.ACTIVE,
      viewCount: 10,
      skills: ['nestjs', 'graphql'],
      offerType: OfferType.INTERNSHIP,
      workLocationType: WorkContext.HYBRID,
    }),
    new OfferDTO({
      id: '2oec0948-58dd-40b2-b085-5a47244036c2',
      userId: '2uec0948-58dd-40b2-b085-5a47244036c2',
      createdAt: new Date('2024-01-01T00:00:00Z'),
      updatedAt: new Date('2024-01-02T00:00:00Z'),
      title: 'Sample Offer 2',
      description: 'This is a test offer.',
      status: OfferStatus.INACTIVE,
      viewCount: 0,
      skills: ['graphql'],
      offerType: OfferType.APPRENTICESHIP,
      workLocationType: WorkContext.ON_SITE,
    }),
    new OfferDTO({
      id: '3oec0948-58dd-40b2-b085-5a47244036c2',
      userId: '1uec0948-58dd-40b2-b085-5a47244036c2',
      createdAt: new Date('2024-01-01T00:00:00Z'),
      updatedAt: new Date('2024-01-02T00:00:00Z'),
      title: 'Sample Offer 3',
      description: 'This is a closed offer.',
      status: OfferStatus.CLOSED,
      viewCount: 5,
      skills: ['nestjs'],
      offerType: OfferType.FULL_TIME,
      workLocationType: WorkContext.TELEWORKING,
    }),
  ];

  const mockCreateOffer: CreateOfferDTO = {
    title: 'New Offer',
    description: 'This is a new offer.',
    userId: '1aec0948-58dd-40b2-b085-5a47244036c2',
    status: OfferStatus.INACTIVE,
    skills: ['nestjs', 'typescript'],
    offerType: OfferType.INTERNSHIP,
    workLocationType: WorkContext.HYBRID,
  };

  const mockUpdateOffer: UpdateOfferDTO = {
    title: 'Updated Offer',
    description: 'This is an updated offer.',
    status: OfferStatus.ACTIVE,
    skills: ['update', 'graphql'],
  };

  beforeEach(async () => {
    const { unit, unitRef } =
      await TestBed.solitary(OffersController).compile();

    controller = unit;
    service = unitRef.get(OffersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getByQuery', () => {
    it('should return an array of offers', async () => {
      const expectedOutput = {
        rows: mockOffers,
        count: mockOffers.length,
      };
      service.findByQuery.mockResolvedValue(expectedOutput);

      expect(await controller.findByQuery(mockCurrentUser, {})).toEqual(
        expectedOutput,
      );
    });
  });

  describe('getMy', () => {
    it('should return an array of offers', async () => {
      service.findByUserId.mockResolvedValue(mockOffers);
      expect(await controller.getMy(mockCurrentUser)).toEqual(mockOffers);
    });

    it('should throw NotFoundException when offer is not found', async () => {
      service.findByUserId.mockRejectedValue(new NotFoundException());
      await expect(controller.getMy(mockCurrentUser)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getOne', () => {
    it('should return a single offer', async () => {
      service.findOneById.mockResolvedValue(mockOffers[0]);
      expect(
        await controller.getOne(
          mockCurrentUser,
          '1aec0948-58dd-40b2-b085-5a47244036c2',
        ),
      ).toEqual(mockOffers[0]);
    });

    it('should throw NotFoundException when offer is not found', async () => {
      service.findOneById.mockResolvedValue(null);
      await expect(
        controller.getOne(
          mockCurrentUser,
          '1aec0948-58dd-40b2-b085-5a47244036c2',
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('createOffer', () => {
    it('should create and return an offer', async () => {
      service.createOffer.mockResolvedValue(mockOffers[0]);
      expect(
        await controller.createOffer(mockCurrentUser, mockCreateOffer),
      ).toEqual(mockOffers[0]);
    });
  });

  describe('updateOffer', () => {
    it('should update and return an offer', async () => {
      service.updateOffer.mockResolvedValue(mockOffers[0]);
      expect(
        await controller.updateOffer(
          mockCurrentUser,
          '1aec0948-58dd-40b2-b085-5a47244036c2',
          mockUpdateOffer,
        ),
      ).toEqual(mockOffers[0]);
    });
  });

  describe('deleteOffer', () => {
    it('should delete an offer and return true', async () => {
      service.deleteOffer.mockResolvedValue(true);
      const result = await controller.deleteOffer(
        mockCurrentUser,
        '1aec0948-58dd-40b2-b085-5a47244036c2',
      );
      expect(result.isSuccessful).toBe(true);
    });

    it('should throw InternalServerErrorException when deletion fails', async () => {
      service.deleteOffer.mockResolvedValue(false);
      await expect(
        controller.deleteOffer(
          mockCurrentUser,
          '1aec0948-58dd-40b2-b085-5a47244036c2',
        ),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('markOfferAsViewed', () => {
    it('should mark an offer as viewed', async () => {
      service.markOfferAsViewed.mockResolvedValue();
      await controller.markOfferAsViewed(
        mockCurrentUser,
        '1aec0948-58dd-40b2-b085-5a47244036c2',
      );
      expect(service.markOfferAsViewed).toHaveBeenCalledWith(
        mockCurrentUser,
        '1aec0948-58dd-40b2-b085-5a47244036c2',
      );
    });
  });
});
