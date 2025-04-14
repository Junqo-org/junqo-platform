import { CompanyProfilesRepository } from './repository/company-profiles.repository';
import { Actions, CaslAbilityFactory } from '../casl/casl-ability.factory';
import {
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { AuthUserDTO } from '../shared/dto/auth-user.dto';
import {
  CreateCompanyProfileDTO,
  CompanyProfileDTO,
  UpdateCompanyProfileDTO,
} from './dto/company-profile.dto';
import { UserType } from '../users/dto/user-type.enum';
import { plainToInstance } from 'class-transformer';
import { ExperienceDTO } from '../experiences/dto/experience.dto';
import { Mocked } from '@suites/doubles.jest';
import { TestBed } from '@suites/unit';
import { CompanyProfileResource } from '../casl/dto/company-profile-resource.dto';
import { CompanyProfilesService } from './company-profiles.service';
import {
  CompanyProfileQueryDTO,
  CompanyProfileQueryOutputDTO,
} from './dto/company-profile-query.dto';

const currentUser: AuthUserDTO = plainToInstance(AuthUserDTO, {
  id: 'e69cc25b-0cc4-4032-83c2-0d34c84318ba',
  type: UserType.COMPANY,
  name: 'test user',
  email: 'test@mail.com',
});

const companyProfiles: CompanyProfileDTO[] = [
  plainToInstance(CompanyProfileDTO, {
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
  plainToInstance(CompanyProfileDTO, {
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

describe('CompanyProfilesService', () => {
  let companyProfilesService: CompanyProfilesService;
  let companyProfilesRepository: Mocked<CompanyProfilesRepository>;
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

    const { unit, unitRef } = await TestBed.solitary(CompanyProfilesService)
      .mock(CaslAbilityFactory)
      .impl(mockCaslAbilityFactory)
      .compile();

    companyProfilesService = unit;
    companyProfilesRepository = unitRef.get(CompanyProfilesRepository);
    caslAbilityFactory = unitRef.get(CaslAbilityFactory);
  });

  it('should be defined', () => {
    expect(companyProfilesService).toBeDefined();
  });

  describe('findByQuery', () => {
    const query: CompanyProfileQueryDTO = plainToInstance(
      CompanyProfileQueryDTO,
      {
        offset: 0,
        limit: 10,
      },
    );

    it('should return all student profiles if no query', async () => {
      const expectedQueryResult: CompanyProfileQueryOutputDTO = {
        rows: companyProfiles,
        count: companyProfiles.length,
      };
      companyProfilesRepository.findByQuery.mockResolvedValue(
        expectedQueryResult,
      );

      const result = await companyProfilesService.findByQuery(currentUser, {});
      expect(result).toBe(expectedQueryResult);
      expect(companyProfilesRepository.findByQuery).toHaveBeenCalled();
      expect(caslAbilityFactory.createForUser).toHaveBeenCalledWith(
        currentUser,
      );
      expect(cannotMockFn).toHaveBeenLastCalledWith(
        Actions.READ,
        expect.any(CompanyProfileResource),
      );
    });

    it('should return every student profiles corresponding to given query', async () => {
      const expectedQueryResult: CompanyProfileQueryOutputDTO = {
        rows: companyProfiles,
        count: companyProfiles.length,
      };
      companyProfilesRepository.findByQuery.mockResolvedValue(
        expectedQueryResult,
      );

      const result = await companyProfilesService.findByQuery(
        currentUser,
        query,
      );
      expect(result).toBe(expectedQueryResult);
      expect(companyProfilesRepository.findByQuery).toHaveBeenCalled();
      expect(caslAbilityFactory.createForUser).toHaveBeenCalledWith(
        currentUser,
      );
      expect(cannotMockFn).toHaveBeenLastCalledWith(
        Actions.READ,
        expect.any(CompanyProfileResource),
      );
    });

    it('should throw NotFoundException if there is no student profile', async () => {
      companyProfilesRepository.findByQuery.mockResolvedValue({
        rows: [],
        count: 0,
      });

      await expect(
        companyProfilesService.findByQuery(currentUser, query),
      ).rejects.toThrow(NotFoundException);
      expect(companyProfilesRepository.findByQuery).toHaveBeenCalled();
      expect(caslAbilityFactory.createForUser).toHaveBeenCalledWith(
        currentUser,
      );
      expect(cannotMockFn).toHaveBeenLastCalledWith(
        Actions.READ,
        expect.any(CompanyProfileResource),
      );
    });

    it('should throw ForbiddenException if user cannot read student profile', async () => {
      const expectedQueryResult: CompanyProfileQueryOutputDTO = {
        rows: companyProfiles,
        count: companyProfiles.length,
      };
      companyProfilesRepository.findByQuery.mockResolvedValue(
        expectedQueryResult,
      );
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
        companyProfilesService.findByQuery(currentUser, query),
      ).rejects.toThrow(ForbiddenException);
      expect(caslAbilityFactory.createForUser).toHaveBeenCalledWith(
        currentUser,
      );
      expect(cannotMockFnRev).toHaveBeenLastCalledWith(
        Actions.READ,
        expect.any(CompanyProfileResource),
      );
    });
  });

  describe('findOneById', () => {
    it('should return a company profile by ID', async () => {
      companyProfilesRepository.findOneById.mockResolvedValue(
        companyProfiles[0],
      );

      const result = await companyProfilesService.findOneById(
        currentUser,
        companyProfiles[0].userId,
      );
      expect(result).toBe(companyProfiles[0]);
      expect(companyProfilesRepository.findOneById).toHaveBeenCalledWith(
        companyProfiles[0].userId,
      );
      expect(caslAbilityFactory.createForUser).toHaveBeenCalledWith(
        currentUser,
      );
      expect(cannotMockFn).toHaveBeenLastCalledWith(
        Actions.READ,
        plainToInstance(CompanyProfileResource, companyProfiles[0], {
          excludeExtraneousValues: true,
        }),
      );
    });

    it("should throw NotFoundException if the company profile doesn't exists", async () => {
      companyProfilesRepository.findOneById.mockRejectedValueOnce(
        new NotFoundException(),
      );

      await expect(
        companyProfilesService.findOneById(
          currentUser,
          companyProfiles[0].userId,
        ),
      ).rejects.toThrow(NotFoundException);
      expect(companyProfilesRepository.findOneById).toHaveBeenCalled();
    });

    it('should throw ForbiddenException if user cannot read company profile', async () => {
      companyProfilesRepository.findOneById.mockResolvedValue(
        companyProfiles[0],
      );
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
        companyProfilesService.findOneById(
          currentUser,
          companyProfiles[0].userId,
        ),
      ).rejects.toThrow(ForbiddenException);
      expect(caslAbilityFactory.createForUser).toHaveBeenCalledWith(
        currentUser,
      );
      expect(cannotMockFnRev).toHaveBeenLastCalledWith(
        Actions.READ,
        plainToInstance(CompanyProfileResource, companyProfiles[0], {
          excludeExtraneousValues: true,
        }),
      );
    });
  });

  describe('create', () => {
    it('should create an company profile', async () => {
      const createCompanyProfileInput: CreateCompanyProfileDTO =
        plainToInstance(CreateCompanyProfileDTO, companyProfiles[0], {
          excludeExtraneousValues: true,
        });

      companyProfilesRepository.create.mockResolvedValue(companyProfiles[0]);

      const result = await companyProfilesService.create(
        currentUser,
        createCompanyProfileInput,
      );
      expect(result).toBe(companyProfiles[0]);
      expect(companyProfilesRepository.create).toHaveBeenCalledWith(
        createCompanyProfileInput,
      );
      expect(caslAbilityFactory.createForUser).toHaveBeenCalledWith(
        currentUser,
      );
      expect(cannotMockFn).toHaveBeenLastCalledWith(
        Actions.CREATE,
        plainToInstance(CompanyProfileResource, createCompanyProfileInput, {
          excludeExtraneousValues: true,
        }),
      );
    });

    it('should throw ForbiddenException if user cannot create company profile', async () => {
      const createCompanyProfileInput: CreateCompanyProfileDTO =
        plainToInstance(CreateCompanyProfileDTO, companyProfiles[0], {
          excludeExtraneousValues: true,
        });

      companyProfilesRepository.create.mockResolvedValue(companyProfiles[0]);
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
        companyProfilesService.create(currentUser, createCompanyProfileInput),
      ).rejects.toThrow(ForbiddenException);
      expect(caslAbilityFactory.createForUser).toHaveBeenCalledWith(
        currentUser,
      );
      expect(cannotMockFnRev).toHaveBeenLastCalledWith(
        Actions.CREATE,
        plainToInstance(
          CompanyProfileResource,
          { userId: createCompanyProfileInput.userId },
          {
            excludeExtraneousValues: true,
          },
        ),
      );
    });
  });

  it('should throw InternalServerErrorException if create fails', async () => {
    const createCompanyProfileInput: CreateCompanyProfileDTO = plainToInstance(
      CreateCompanyProfileDTO,
      companyProfiles[0],
      { excludeExtraneousValues: true },
    );

    companyProfilesRepository.create.mockRejectedValue(new Error());

    await expect(
      companyProfilesService.create(currentUser, createCompanyProfileInput),
    ).rejects.toThrow(InternalServerErrorException);
  });

  describe('update', () => {
    it('should update an company profile', async () => {
      const newData = {
        title: 'new title',
      };
      const updateCompanyProfileInput: UpdateCompanyProfileDTO =
        plainToInstance(UpdateCompanyProfileDTO, newData, {
          excludeExtraneousValues: true,
        });
      const expectedCompanyProfile: CompanyProfileDTO = plainToInstance(
        CompanyProfileDTO,
        {
          ...companyProfiles[0],
          ...newData,
        },
      );

      companyProfilesRepository.findOneById.mockResolvedValue(
        companyProfiles[0],
      );
      companyProfilesRepository.update.mockResolvedValue(
        expectedCompanyProfile,
      );

      const result = await companyProfilesService.update(
        currentUser,
        updateCompanyProfileInput,
      );
      expect(result).toBe(expectedCompanyProfile);
      expect(companyProfilesRepository.update).toHaveBeenCalledWith(
        companyProfiles[0].userId,
        updateCompanyProfileInput,
      );
      expect(caslAbilityFactory.createForUser).toHaveBeenCalledWith(
        currentUser,
      );
      expect(cannotMockFn).toHaveBeenLastCalledWith(
        'update',
        plainToInstance(CompanyProfileResource, companyProfiles[0], {
          excludeExtraneousValues: true,
        }),
      );
    });

    it('should throw ForbiddenException if user cannot update company profile', async () => {
      const invalidCurrentUser = plainToInstance(AuthUserDTO, {
        ...currentUser,
        id: 'other user',
      });
      const newData = {
        title: 'new title',
      };
      const updateCompanyProfileInput: UpdateCompanyProfileDTO =
        plainToInstance(UpdateCompanyProfileDTO, newData);
      const expectedCompanyProfile: CompanyProfileDTO = plainToInstance(
        CompanyProfileDTO,
        {
          ...companyProfiles[0],
          ...newData,
        },
      );

      companyProfilesRepository.findOneById.mockResolvedValue(
        companyProfiles[0],
      );
      companyProfilesRepository.update.mockResolvedValue(
        expectedCompanyProfile,
      );
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
        companyProfilesService.update(
          invalidCurrentUser,
          updateCompanyProfileInput,
        ),
      ).rejects.toThrow(ForbiddenException);
      expect(caslAbilityFactory.createForUser).toHaveBeenCalledWith(
        invalidCurrentUser,
      );
      expect(cannotMockFnRev).toHaveBeenLastCalledWith(
        'update',
        plainToInstance(CompanyProfileResource, companyProfiles[0], {
          excludeExtraneousValues: true,
        }),
      );
    });

    it('should throw InternalServerErrorException if update fails', async () => {
      const newData = {
        title: 'new title',
      };
      const updateCompanyProfileInput: UpdateCompanyProfileDTO =
        plainToInstance(UpdateCompanyProfileDTO, newData);

      companyProfilesRepository.findOneById.mockResolvedValue(
        companyProfiles[0],
      );
      companyProfilesRepository.update.mockRejectedValue(new Error());

      await expect(
        companyProfilesService.update(currentUser, updateCompanyProfileInput),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('delete', () => {
    it('should delete an company profile', async () => {
      companyProfilesRepository.findOneById.mockResolvedValue(
        companyProfiles[0],
      );
      companyProfilesRepository.delete.mockResolvedValue(true);

      const result = await companyProfilesService.delete(currentUser);
      expect(result).toBe(true);
      expect(companyProfilesRepository.delete).toHaveBeenCalledWith(
        companyProfiles[0].userId,
      );
      expect(caslAbilityFactory.createForUser).toHaveBeenCalledWith(
        currentUser,
      );
      expect(cannotMockFn).toHaveBeenLastCalledWith(
        Actions.DELETE,
        plainToInstance(CompanyProfileResource, companyProfiles[0], {
          excludeExtraneousValues: true,
        }),
      );
    });

    it('should throw ForbiddenException if user cannot read company profile', async () => {
      companyProfilesRepository.findOneById.mockResolvedValue(
        companyProfiles[0],
      );
      companyProfilesRepository.delete.mockResolvedValue(true);
      caslAbilityFactory.createForUser.mockImplementationOnce(
        caslAbilityFactory.createForUser,
      );
      caslAbilityFactory.createForUser.mockImplementationOnce(
        jest.fn().mockReturnValue({
          can: canMockFnRev,
          cannot: cannotMockFnRev,
        }),
      );

      await expect(companyProfilesService.delete(currentUser)).rejects.toThrow(
        ForbiddenException,
      );
      expect(caslAbilityFactory.createForUser).toHaveBeenCalledWith(
        currentUser,
      );
      expect(cannotMockFnRev).toHaveBeenLastCalledWith(
        Actions.DELETE,
        plainToInstance(CompanyProfileResource, companyProfiles[0], {
          excludeExtraneousValues: true,
        }),
      );
    });

    it('should throw InternalServerErrorException if delete fails', async () => {
      companyProfilesRepository.findOneById.mockResolvedValue(
        companyProfiles[0],
      );
      companyProfilesRepository.delete.mockRejectedValue(new Error());

      await expect(companyProfilesService.delete(currentUser)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
