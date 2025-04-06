import { OffersController } from './offers.controller';
import { OffersService } from './offers.service';
import {
  BadRequestException,
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

  describe('getAll', () => {
    it('should return an array of offers', async () => {
      service.findAll.mockResolvedValue(mockOffers);

      expect(await controller.getAll(mockCurrentUser)).toEqual(mockOffers);
    });
  });

  // // TODO
  // describe('getMy', () => {
  //   it('should return an array of offers', async () => {
  //     service.findOneById.mockResolvedValue(mockOffers[0]);
  //     expect(await controller.getMy(mockCurrentUser)).toEqual(mockOffers[0]);
  //   });

  //   it('should throw NotFoundException when offer is not found', async () => {
  //     service.findOneById.mockResolvedValue(null);
  //     await expect(controller.getMy(mockCurrentUser)).rejects.toThrow(
  //       NotFoundException,
  //     );
  //   });
  // });

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

    it('should fail validation with invalid data', async () => {
      const invalidOffer: CreateOfferDTO = plainToInstance(CreateOfferDTO, {
        title: '',
        description: 123,
        userId: 'not-a-uuid',
      });

      service.createOffer.mockResolvedValue(mockOffers[0]);
      await expect(
        controller.createOffer(mockCurrentUser, invalidOffer),
      ).rejects.toThrow(BadRequestException);
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

    it('should fail validation with invalid update data', async () => {
      const invalidUpdate: UpdateOfferDTO = plainToInstance(UpdateOfferDTO, {
        title: null,
        description: 123,
        skills: 123,
      });

      service.updateOffer.mockResolvedValue(mockOffers[0]);
      await expect(
        controller.updateOffer(
          mockCurrentUser,
          '1aec0948-58dd-40b2-b085-5a47244036c2',
          invalidUpdate,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('deleteOffer', () => {
    it('should delete an offer and return true', async () => {
      service.deleteOffer.mockResolvedValue(true);
      expect(
        await controller.deleteOffer(
          mockCurrentUser,
          '1aec0948-58dd-40b2-b085-5a47244036c2',
        ),
      ).toBe(true);
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
});
