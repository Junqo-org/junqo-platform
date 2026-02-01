import { TestBed } from '@suites/unit';
import { OffersService } from './offers.service';
import { OffersRepository } from './repository/offers.repository';
import { Actions, CaslAbilityFactory } from '../casl/casl-ability.factory';
import {
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { AuthUserDTO } from '../shared/dto/auth-user.dto';
import { CreateOfferDTO, OfferDTO, UpdateOfferDTO } from './dto/offer.dto';
import { UserType } from '../users/dto/user-type.enum';
import { plainToInstance } from 'class-transformer';
import { Mocked } from '@suites/doubles.jest';
import { OfferResource } from '../casl/dto/offer-resource.dto';
import { OfferStatus } from './dto/offer-status.enum';

const currentUser: AuthUserDTO = plainToInstance(AuthUserDTO, {
  id: 'e69cc25b-0cc4-4032-83c2-0d34c84318ba',
  type: UserType.COMPANY,
  name: 'test user',
  email: 'test@mail.com',
});

const studentUser: AuthUserDTO = plainToInstance(AuthUserDTO, {
  id: 'e69cc25b-0cc4-4032-83c2-0d34c84318bb',
  type: UserType.STUDENT,
  name: 'student user',
  email: 'student@mail.com',
});

const offers: OfferDTO[] = [
  plainToInstance(OfferDTO, {
    id: 'e69cc25b-0cc4-4032-83c2-0d34c84318ba',
    userId: 'e42cc25b-0cc4-4032-83c2-0d34c84318ba',
    title: 'Offer 1',
    description: 'Desc',
    createdAt: new Date(),
    updatedAt: new Date(),
    status: OfferStatus.ACTIVE,
    viewCount: 0,
  }),
  plainToInstance(OfferDTO, {
    id: 'e69cc25b-0cc4-4032-83c2-0d34c84318bb',
    userId: 'e42cc25b-0cc4-4032-83c2-0d34c84318bb',
    title: 'Offer 2',
    description: 'Desc 2',
    createdAt: new Date(),
    updatedAt: new Date(),
    status: OfferStatus.INACTIVE,
    viewCount: 10,
  }),
  plainToInstance(OfferDTO, {
    id: 'e69cc25b-0cc4-4032-83c2-0d34c84318bc',
    userId: 'e42cc25b-0cc4-4032-83c2-0d34c84318ba',
    title: 'Offer 3',
    description: 'Desc 3',
    createdAt: new Date(),
    updatedAt: new Date(),
    status: OfferStatus.CLOSED,
    viewCount: 0,
  }),
];

describe('OffersService', () => {
  let offersService: OffersService;
  let offersRepository: Mocked<OffersRepository>;
  let caslAbilityFactory: Mocked<CaslAbilityFactory>;
  let canMockFn: jest.Mock;
  let cannotMockFn: jest.Mock;
  let canMockFnRev: jest.Mock;
  let cannotMockFnRev: jest.Mock;

  beforeEach(async () => {
    canMockFn = jest.fn().mockReturnValue(true);
    cannotMockFn = jest.fn().mockReturnValue(false);
    canMockFnRev = jest.fn().mockReturnValue(false);
    cannotMockFnRev = jest.fn().mockReturnValue(true);

    const mockCaslAbilityFactory = () => ({
      createForUser: jest.fn(() => {
        const ability = {
          can: canMockFn,
          cannot: cannotMockFn,
        };
        return ability;
      }),
    });

    const { unit, unitRef } = await TestBed.solitary(OffersService)
      .mock(CaslAbilityFactory)
      .impl(mockCaslAbilityFactory)
      .compile();

    offersService = unit;
    offersRepository = unitRef.get(OffersRepository);
    caslAbilityFactory = unitRef.get(CaslAbilityFactory);
  });

  it('should be defined', () => {
    expect(offersService).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all offers', async () => {
      offersRepository.findAll.mockResolvedValue(offers);

      const result = await offersService.findAll(currentUser);
      expect(result).toBe(offers);
      expect(offersRepository.findAll).toHaveBeenCalled();
      expect(caslAbilityFactory.createForUser).toHaveBeenCalledWith(
        currentUser,
      );
      expect(cannotMockFn).toHaveBeenLastCalledWith(
        Actions.READ,
        new OfferResource(),
      );
    });

    it('should throw NotFoundException if there is no offer', async () => {
      offersRepository.findAll.mockResolvedValue([]);

      await expect(offersService.findAll(currentUser)).rejects.toThrow(
        NotFoundException,
      );
      expect(offersRepository.findAll).toHaveBeenCalled();
      expect(caslAbilityFactory.createForUser).toHaveBeenCalledWith(
        currentUser,
      );
      expect(cannotMockFn).toHaveBeenLastCalledWith(
        Actions.READ,
        new OfferResource(),
      );
    });

    it('should throw ForbiddenException if user cannot read offer', async () => {
      offersRepository.findAll.mockResolvedValue(offers);
      caslAbilityFactory.createForUser.mockImplementationOnce(
        caslAbilityFactory.createForUser,
      );
      caslAbilityFactory.createForUser.mockImplementationOnce(
        jest.fn().mockReturnValue({
          can: canMockFnRev,
          cannot: cannotMockFnRev,
        }),
      );

      await expect(offersService.findAll(currentUser)).rejects.toThrow(
        ForbiddenException,
      );
      expect(caslAbilityFactory.createForUser).toHaveBeenCalledWith(
        currentUser,
      );
      expect(cannotMockFnRev).toHaveBeenLastCalledWith(
        Actions.READ,
        new OfferResource(),
      );
    });
  });

  describe('findOneById', () => {
    it('should return an offer by ID', async () => {
      offersRepository.findOneById.mockResolvedValue(offers[0]);

      const result = await offersService.findOneById(currentUser, offers[0].id);
      expect(result).toBe(offers[0]);
      expect(offersRepository.findOneById).toHaveBeenCalledWith(offers[0].id);
      expect(caslAbilityFactory.createForUser).toHaveBeenCalledWith(
        currentUser,
      );
      expect(cannotMockFn).toHaveBeenLastCalledWith(
        Actions.READ,
        plainToInstance(OfferResource, offers[0], {
          excludeExtraneousValues: true,
        }),
      );
    });

    it("should throw NotFoundException if the offer don't exists", async () => {
      offersRepository.findOneById.mockRejectedValueOnce(
        new NotFoundException(),
      );

      await expect(
        offersService.findOneById(currentUser, offers[0].id),
      ).rejects.toThrow(NotFoundException);
      expect(offersRepository.findOneById).toHaveBeenCalled();
    });

    it('should throw ForbiddenException if user cannot read offer', async () => {
      offersRepository.findOneById.mockResolvedValue(offers[0]);
      caslAbilityFactory.createForUser.mockImplementationOnce(
        caslAbilityFactory.createForUser,
      );
      caslAbilityFactory.createForUser.mockImplementationOnce(
        jest.fn().mockReturnValue({
          can: canMockFnRev,
          cannot: cannotMockFnRev,
        }),
      );

      await expect(
        offersService.findOneById(currentUser, offers[0].id),
      ).rejects.toThrow(ForbiddenException);
      expect(caslAbilityFactory.createForUser).toHaveBeenCalledWith(
        currentUser,
      );
      expect(cannotMockFnRev).toHaveBeenLastCalledWith(
        Actions.READ,
        plainToInstance(OfferResource, offers[0], {
          excludeExtraneousValues: true,
        }),
      );
    });
  });

  describe('createOffer', () => {
    it('should create an offer', async () => {
      const createOfferInput: CreateOfferDTO = plainToInstance(
        CreateOfferDTO,
        offers[0],
        { excludeExtraneousValues: true },
      );

      offersRepository.createOffer.mockResolvedValue(offers[0]);

      const result = await offersService.createOffer(
        currentUser,
        createOfferInput,
      );
      expect(result).toBe(offers[0]);
      expect(offersRepository.createOffer).toHaveBeenCalledWith(
        createOfferInput,
      );
      expect(caslAbilityFactory.createForUser).toHaveBeenCalledWith(
        currentUser,
      );
      expect(cannotMockFn).toHaveBeenLastCalledWith(
        Actions.CREATE,
        plainToInstance(OfferResource, createOfferInput, {
          excludeExtraneousValues: true,
        }),
      );
    });

    it('should throw ForbiddenException if user cannot create offer', async () => {
      const createOfferInput: CreateOfferDTO = plainToInstance(
        CreateOfferDTO,
        offers[0],
        { excludeExtraneousValues: true },
      );

      offersRepository.createOffer.mockResolvedValue(offers[0]);
      caslAbilityFactory.createForUser.mockImplementationOnce(
        caslAbilityFactory.createForUser,
      );
      caslAbilityFactory.createForUser.mockImplementationOnce(
        jest.fn().mockReturnValue({
          can: canMockFnRev,
          cannot: cannotMockFnRev,
        }),
      );

      await expect(
        offersService.createOffer(currentUser, createOfferInput),
      ).rejects.toThrow(ForbiddenException);
      expect(caslAbilityFactory.createForUser).toHaveBeenCalledWith(
        currentUser,
      );
      expect(cannotMockFnRev).toHaveBeenLastCalledWith(
        Actions.CREATE,
        plainToInstance(
          OfferResource,
          { userId: createOfferInput.userId },
          {
            excludeExtraneousValues: true,
          },
        ),
      );
    });

    it('should throw InternalServerErrorException if create fails', async () => {
      const createOfferInput: CreateOfferDTO = plainToInstance(
        CreateOfferDTO,
        offers[0],
        { excludeExtraneousValues: true },
      );

      offersRepository.createOffer.mockRejectedValue(new Error());

      await expect(
        offersService.createOffer(currentUser, createOfferInput),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('updateOffer', () => {
    it('should update an offer', async () => {
      const newData = {
        title: 'new title',
      };
      const updateOfferInput: UpdateOfferDTO = plainToInstance(
        UpdateOfferDTO,
        newData,
        {
          excludeExtraneousValues: true,
        },
      );
      const expectedOffer: OfferDTO = plainToInstance(OfferDTO, {
        ...offers[0],
        ...newData,
      });

      offersRepository.findOneById.mockResolvedValue(offers[0]);
      offersRepository.updateOffer.mockResolvedValue(expectedOffer);

      const result = await offersService.updateOffer(
        currentUser,
        offers[0].id,
        updateOfferInput,
      );
      expect(result).toBe(expectedOffer);
      expect(offersRepository.updateOffer).toHaveBeenCalledWith(
        offers[0].id,
        updateOfferInput,
      );
      expect(caslAbilityFactory.createForUser).toHaveBeenCalledWith(
        currentUser,
      );
      expect(cannotMockFn).toHaveBeenLastCalledWith(
        'update',
        plainToInstance(OfferResource, offers[0], {
          excludeExtraneousValues: true,
        }),
      );
    });

    it('should throw ForbiddenException if user cannot update offer', async () => {
      const invalidCurrentUser = plainToInstance(AuthUserDTO, {
        ...currentUser,
        id: 'other user',
      });
      const newData = {
        title: 'new title',
      };
      const updateOfferInput: UpdateOfferDTO = plainToInstance(
        UpdateOfferDTO,
        newData,
      );
      const expectedOffer: OfferDTO = plainToInstance(OfferDTO, {
        ...offers[0],
        ...newData,
      });

      offersRepository.findOneById.mockResolvedValue(offers[0]);
      offersRepository.updateOffer.mockResolvedValue(expectedOffer);
      caslAbilityFactory.createForUser.mockImplementationOnce(
        caslAbilityFactory.createForUser,
      );
      caslAbilityFactory.createForUser.mockImplementationOnce(
        jest.fn().mockReturnValue({
          can: canMockFnRev,
          cannot: cannotMockFnRev,
        }),
      );

      await expect(
        offersService.updateOffer(
          invalidCurrentUser,
          offers[0].id,
          updateOfferInput,
        ),
      ).rejects.toThrow(ForbiddenException);
      expect(caslAbilityFactory.createForUser).toHaveBeenCalledWith(
        invalidCurrentUser,
      );
      expect(cannotMockFnRev).toHaveBeenLastCalledWith(
        'update',
        plainToInstance(OfferResource, offers[0], {
          excludeExtraneousValues: true,
        }),
      );
    });

    it('should throw InternalServerErrorException if update fails', async () => {
      const newData = {
        title: 'new title',
      };
      const updateOfferInput: UpdateOfferDTO = plainToInstance(
        UpdateOfferDTO,
        newData,
      );

      offersRepository.findOneById.mockResolvedValue(offers[0]);
      offersRepository.updateOffer.mockRejectedValue(new Error());

      await expect(
        offersService.updateOffer(currentUser, offers[0].id, updateOfferInput),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('deleteOffer', () => {
    it('should delete an offer', async () => {
      // Create a temporary offer for this test
      const tempOffer = plainToInstance(OfferDTO, {
        id: 'temp-offer-id-1',
        userId: 'e42cc25b-0cc4-4032-83c2-0d34c84318ba',
        title: 'Temp Offer 1',
        description: 'Temp Description',
        createdAt: new Date(),
        updatedAt: new Date(),
        status: OfferStatus.ACTIVE,
        viewCount: 0,
      });

      offersRepository.findOneById.mockResolvedValue(tempOffer);
      offersRepository.deleteOffer.mockResolvedValue(true);

      const result = await offersService.deleteOffer(currentUser, tempOffer.id);
      expect(result).toBe(true);
      expect(offersRepository.deleteOffer).toHaveBeenCalledWith(tempOffer.id);
      expect(caslAbilityFactory.createForUser).toHaveBeenCalledWith(
        currentUser,
      );
      expect(cannotMockFn).toHaveBeenLastCalledWith(
        Actions.DELETE,
        plainToInstance(OfferResource, tempOffer, {
          excludeExtraneousValues: true,
        }),
      );
    });

    it('should throw ForbiddenException if user cannot read offer', async () => {
      // Create a temporary offer for this test
      const tempOffer = plainToInstance(OfferDTO, {
        id: 'temp-offer-id-2',
        userId: 'e42cc25b-0cc4-4032-83c2-0d34c84318ba',
        title: 'Temp Offer 2',
        description: 'Temp Description',
        createdAt: new Date(),
        updatedAt: new Date(),
        status: OfferStatus.ACTIVE,
        viewCount: 0,
      });

      offersRepository.findOneById.mockResolvedValue(tempOffer);
      offersRepository.deleteOffer.mockResolvedValue(true);
      caslAbilityFactory.createForUser.mockImplementationOnce(
        caslAbilityFactory.createForUser,
      );
      caslAbilityFactory.createForUser.mockImplementationOnce(
        jest.fn().mockReturnValue({
          can: canMockFnRev,
          cannot: cannotMockFnRev,
        }),
      );

      await expect(
        offersService.deleteOffer(currentUser, tempOffer.id),
      ).rejects.toThrow(ForbiddenException);
      expect(caslAbilityFactory.createForUser).toHaveBeenCalledWith(
        currentUser,
      );
      expect(cannotMockFnRev).toHaveBeenLastCalledWith(
        Actions.DELETE,
        plainToInstance(OfferResource, tempOffer, {
          excludeExtraneousValues: true,
        }),
      );
    });

    it('should throw InternalServerErrorException if delete fails', async () => {
      // Create a temporary offer for this test
      const tempOffer = plainToInstance(OfferDTO, {
        id: 'temp-offer-id-3',
        userId: 'e42cc25b-0cc4-4032-83c2-0d34c84318ba',
        title: 'Temp Offer 3',
        description: 'Temp Description',
        createdAt: new Date(),
        updatedAt: new Date(),
        status: OfferStatus.ACTIVE,
        viewCount: 0,
      });

      offersRepository.findOneById.mockResolvedValue(tempOffer);
      offersRepository.deleteOffer.mockRejectedValue(new Error());

      await expect(
        offersService.deleteOffer(currentUser, tempOffer.id),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('markOfferAsViewed', () => {
    it('should mark an offer as viewed', async () => {
      const offerId = offers[0].id;
      offersRepository.findOneById.mockResolvedValue(offers[0]);
      offersRepository.markOfferAsViewed.mockResolvedValue();

      await offersService.markOfferAsViewed(studentUser, offerId);
      expect(offersRepository.markOfferAsViewed).toHaveBeenCalledWith(
        studentUser.id,
        offerId,
      );
      expect(caslAbilityFactory.createForUser).toHaveBeenCalledWith(
        studentUser,
      );
      expect(cannotMockFn).toHaveBeenLastCalledWith(
        Actions.READ,
        plainToInstance(OfferResource, {
          userId: offers[0].userId,
        }),
      );
    });

    it('should throw ForbiddenException if user cannot read offer', async () => {
      const invalidCurrentUser = plainToInstance(AuthUserDTO, {
        ...studentUser,
        id: 'other user',
      });
      const offerId = offers[0].id;

      offersRepository.findOneById.mockResolvedValue(offers[0]);
      offersRepository.markOfferAsViewed.mockResolvedValue();
      caslAbilityFactory.createForUser.mockImplementationOnce(
        caslAbilityFactory.createForUser,
      );
      caslAbilityFactory.createForUser.mockImplementationOnce(
        jest.fn().mockReturnValue({
          can: canMockFnRev,
          cannot: cannotMockFnRev,
        }),
      );

      await expect(
        offersService.markOfferAsViewed(invalidCurrentUser, offerId),
      ).rejects.toThrow(ForbiddenException);
      expect(caslAbilityFactory.createForUser).toHaveBeenCalledWith(
        invalidCurrentUser,
      );
      expect(cannotMockFnRev).toHaveBeenLastCalledWith(
        Actions.READ,
        plainToInstance(OfferResource, {
          userId: offers[0].userId,
        }),
      );
    });

    it('should throw InternalServerErrorException if marking as viewed fails', async () => {
      const offerId = offers[0].id;

      offersRepository.findOneById.mockResolvedValue(offers[0]);
      offersRepository.markOfferAsViewed.mockRejectedValue(new Error());

      await expect(
        offersService.markOfferAsViewed(studentUser, offerId),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });
});
