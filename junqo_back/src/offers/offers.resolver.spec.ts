import { OffersResolver } from './offers.resolver';
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

describe('OffersResolver', () => {
  let resolver: OffersResolver;
  let service: Mocked<OffersService>;

  const mockCurrentUser: AuthUserDTO = plainToInstance(AuthUserDTO, {
    id: 'e69cc25b-0cc4-4032-83c2-0d34c84318ba',
    type: UserType.COMPANY,
    name: 'test user',
    email: 'test@mail.com',
  });

  const mockOffer: OfferDTO = new OfferDTO({
    id: '8aec0948-58dd-40b2-b085-5a47244036c2',
    userId: '8aec0948-58dd-40b2-b085-5a47244036c2',
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-02T00:00:00Z'),
    title: 'Sample Offer',
    description: 'This is a test offer.',
    status: OfferStatus.ACTIVE,
    viewCount: 10,
    expiresAt: new Date('2024-12-31T23:59:59Z'),
    skills: ['nestjs', 'graphql'],
    offerType: OfferType.INTERNSHIP,
    workLocationType: WorkContext.HYBRID,
  });

  const mockCreateOffer: CreateOfferDTO = {
    title: 'New Offer',
    description: 'This is a new offer.',
    userId: '8aec0948-58dd-40b2-b085-5a47244036c2',
    status: OfferStatus.INACTIVE,
    expiresAt: new Date('2024-12-31T23:59:59Z'),
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
    const { unit, unitRef } = await TestBed.solitary(OffersResolver).compile();

    resolver = unit;
    service = unitRef.get(OffersService);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('offers', () => {
    it('should return an array of offers', async () => {
      service.findAll.mockResolvedValue([mockOffer]);
      expect(await resolver.offers(mockCurrentUser)).toEqual([mockOffer]);
    });
  });

  describe('offer', () => {
    it('should return a single offer', async () => {
      service.findOneById.mockResolvedValue(mockOffer);
      expect(
        await resolver.offer(
          mockCurrentUser,
          '8aec0948-58dd-40b2-b085-5a47244036c2',
        ),
      ).toEqual(mockOffer);
    });

    it('should throw NotFoundException when offer is not found', async () => {
      service.findOneById.mockResolvedValue(null);
      await expect(
        resolver.offer(mockCurrentUser, '8aec0948-58dd-40b2-b085-5a47244036c2'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('createOffer', () => {
    it('should create and return an offer', async () => {
      service.createOffer.mockResolvedValue(mockOffer);
      expect(
        await resolver.createOffer(mockCurrentUser, mockCreateOffer),
      ).toEqual(mockOffer);
    });

    it('should fail validation with invalid data', async () => {
      const invalidOffer: CreateOfferDTO = plainToInstance(CreateOfferDTO, {
        title: '',
        description: 123,
        userId: 'not-a-uuid',
      });

      service.createOffer.mockResolvedValue(mockOffer);
      await expect(
        resolver.createOffer(mockCurrentUser, invalidOffer),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateOffer', () => {
    it('should update and return an offer', async () => {
      service.updateOffer.mockResolvedValue(mockOffer);
      expect(
        await resolver.updateOffer(
          mockCurrentUser,
          '8aec0948-58dd-40b2-b085-5a47244036c2',
          mockUpdateOffer,
        ),
      ).toEqual(mockOffer);
    });

    it('should fail validation with invalid update data', async () => {
      const invalidUpdate: UpdateOfferDTO = plainToInstance(UpdateOfferDTO, {
        title: null,
        description: 123,
        skills: 123,
      });

      service.updateOffer.mockResolvedValue(mockOffer);
      await expect(
        resolver.updateOffer(
          mockCurrentUser,
          '8aec0948-58dd-40b2-b085-5a47244036c2',
          invalidUpdate,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('deleteOffer', () => {
    it('should delete an offer and return true', async () => {
      service.deleteOffer.mockResolvedValue(true);
      expect(
        await resolver.deleteOffer(
          mockCurrentUser,
          '8aec0948-58dd-40b2-b085-5a47244036c2',
        ),
      ).toBe(true);
    });

    it('should throw InternalServerErrorException when deletion fails', async () => {
      service.deleteOffer.mockResolvedValue(false);
      await expect(
        resolver.deleteOffer(
          mockCurrentUser,
          '8aec0948-58dd-40b2-b085-5a47244036c2',
        ),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });
});
