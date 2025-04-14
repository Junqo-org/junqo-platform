import { SchoolProfilesRepository } from './repository/school-profiles.repository';
import { Actions, CaslAbilityFactory } from '../casl/casl-ability.factory';
import {
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { AuthUserDTO } from '../shared/dto/auth-user.dto';
import {
  CreateSchoolProfileDTO,
  SchoolProfileDTO,
  UpdateSchoolProfileDTO,
} from './dto/school-profile.dto';
import { UserType } from '../users/dto/user-type.enum';
import { plainToInstance } from 'class-transformer';
import { ExperienceDTO } from '../experiences/dto/experience.dto';
import { Mocked } from '@suites/doubles.jest';
import { TestBed } from '@suites/unit';
import { SchoolProfileResource } from '../casl/dto/school-profile-resource.dto';
import { SchoolProfilesService } from './school-profiles.service';
import {
  SchoolProfileQueryDTO,
  SchoolProfileQueryOutputDTO,
} from './dto/school-profile-query.dto';

const currentUser: AuthUserDTO = plainToInstance(AuthUserDTO, {
  id: 'e69cc25b-0cc4-4032-83c2-0d34c84318ba',
  type: UserType.SCHOOL,
  name: 'test user',
  email: 'test@mail.com',
});

const schoolProfiles: SchoolProfileDTO[] = [
  plainToInstance(SchoolProfileDTO, {
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
  plainToInstance(SchoolProfileDTO, {
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

describe('SchoolProfilesService', () => {
  let schoolProfilesService: SchoolProfilesService;
  let schoolProfilesRepository: Mocked<SchoolProfilesRepository>;
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

    const { unit, unitRef } = await TestBed.solitary(SchoolProfilesService)
      .mock(CaslAbilityFactory)
      .impl(mockCaslAbilityFactory)
      .compile();

    schoolProfilesService = unit;
    schoolProfilesRepository = unitRef.get(SchoolProfilesRepository);
    caslAbilityFactory = unitRef.get(CaslAbilityFactory);
  });

  it('should be defined', () => {
    expect(schoolProfilesService).toBeDefined();
  });

  describe('findByQuery', () => {
    const query: SchoolProfileQueryDTO = plainToInstance(
      SchoolProfileQueryDTO,
      {
        offset: 0,
        limit: 10,
      },
    );

    it('should return all student profiles if no query', async () => {
      const expectedQueryResult: SchoolProfileQueryOutputDTO = {
        rows: schoolProfiles,
        count: schoolProfiles.length,
      };
      schoolProfilesRepository.findByQuery.mockResolvedValue(
        expectedQueryResult,
      );

      const result = await schoolProfilesService.findByQuery(currentUser, {});
      expect(result).toBe(expectedQueryResult);
      expect(schoolProfilesRepository.findByQuery).toHaveBeenCalled();
      expect(caslAbilityFactory.createForUser).toHaveBeenCalledWith(
        currentUser,
      );
      expect(cannotMockFn).toHaveBeenLastCalledWith(
        Actions.READ,
        expect.any(SchoolProfileResource),
      );
    });

    it('should return every student profiles corresponding to given query', async () => {
      const expectedQueryResult: SchoolProfileQueryOutputDTO = {
        rows: schoolProfiles,
        count: schoolProfiles.length,
      };
      schoolProfilesRepository.findByQuery.mockResolvedValue(
        expectedQueryResult,
      );

      const result = await schoolProfilesService.findByQuery(
        currentUser,
        query,
      );
      expect(result).toBe(expectedQueryResult);
      expect(schoolProfilesRepository.findByQuery).toHaveBeenCalled();
      expect(caslAbilityFactory.createForUser).toHaveBeenCalledWith(
        currentUser,
      );
      expect(cannotMockFn).toHaveBeenLastCalledWith(
        Actions.READ,
        expect.any(SchoolProfileResource),
      );
    });

    it('should throw NotFoundException if there is no student profile', async () => {
      schoolProfilesRepository.findByQuery.mockResolvedValue({
        rows: [],
        count: 0,
      });

      await expect(
        schoolProfilesService.findByQuery(currentUser, query),
      ).rejects.toThrow(NotFoundException);
      expect(schoolProfilesRepository.findByQuery).toHaveBeenCalled();
      expect(caslAbilityFactory.createForUser).toHaveBeenCalledWith(
        currentUser,
      );
      expect(cannotMockFn).toHaveBeenLastCalledWith(
        Actions.READ,
        expect.any(SchoolProfileResource),
      );
    });

    it('should throw ForbiddenException if user cannot read student profile', async () => {
      const expectedQueryResult: SchoolProfileQueryOutputDTO = {
        rows: schoolProfiles,
        count: schoolProfiles.length,
      };
      schoolProfilesRepository.findByQuery.mockResolvedValue(
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
        schoolProfilesService.findByQuery(currentUser, query),
      ).rejects.toThrow(ForbiddenException);
      expect(caslAbilityFactory.createForUser).toHaveBeenCalledWith(
        currentUser,
      );
      expect(cannotMockFnRev).toHaveBeenLastCalledWith(
        Actions.READ,
        expect.any(SchoolProfileResource),
      );
    });
  });

  describe('findOneById', () => {
    it('should return a school profile by ID', async () => {
      schoolProfilesRepository.findOneById.mockResolvedValue(schoolProfiles[0]);

      const result = await schoolProfilesService.findOneById(
        currentUser,
        schoolProfiles[0].userId,
      );
      expect(result).toBe(schoolProfiles[0]);
      expect(schoolProfilesRepository.findOneById).toHaveBeenCalledWith(
        schoolProfiles[0].userId,
      );
      expect(caslAbilityFactory.createForUser).toHaveBeenCalledWith(
        currentUser,
      );
      expect(cannotMockFn).toHaveBeenLastCalledWith(
        Actions.READ,
        plainToInstance(SchoolProfileResource, schoolProfiles[0], {
          excludeExtraneousValues: true,
        }),
      );
    });

    it("should throw NotFoundException if the school profile doesn't exists", async () => {
      schoolProfilesRepository.findOneById.mockRejectedValueOnce(
        new NotFoundException(),
      );

      await expect(
        schoolProfilesService.findOneById(
          currentUser,
          schoolProfiles[0].userId,
        ),
      ).rejects.toThrow(NotFoundException);
      expect(schoolProfilesRepository.findOneById).toHaveBeenCalled();
    });

    it('should throw ForbiddenException if user cannot read school profile', async () => {
      schoolProfilesRepository.findOneById.mockResolvedValue(schoolProfiles[0]);
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
        schoolProfilesService.findOneById(
          currentUser,
          schoolProfiles[0].userId,
        ),
      ).rejects.toThrow(ForbiddenException);
      expect(caslAbilityFactory.createForUser).toHaveBeenCalledWith(
        currentUser,
      );
      expect(cannotMockFnRev).toHaveBeenLastCalledWith(
        Actions.READ,
        plainToInstance(SchoolProfileResource, schoolProfiles[0], {
          excludeExtraneousValues: true,
        }),
      );
    });
  });

  describe('create', () => {
    it('should create an school profile', async () => {
      const createSchoolProfileInput: CreateSchoolProfileDTO = plainToInstance(
        CreateSchoolProfileDTO,
        schoolProfiles[0],
        {
          excludeExtraneousValues: true,
        },
      );

      schoolProfilesRepository.create.mockResolvedValue(schoolProfiles[0]);

      const result = await schoolProfilesService.create(
        currentUser,
        createSchoolProfileInput,
      );
      expect(result).toBe(schoolProfiles[0]);
      expect(schoolProfilesRepository.create).toHaveBeenCalledWith(
        createSchoolProfileInput,
      );
      expect(caslAbilityFactory.createForUser).toHaveBeenCalledWith(
        currentUser,
      );
      expect(cannotMockFn).toHaveBeenLastCalledWith(
        Actions.CREATE,
        plainToInstance(SchoolProfileResource, createSchoolProfileInput, {
          excludeExtraneousValues: true,
        }),
      );
    });

    it('should throw ForbiddenException if user cannot create school profile', async () => {
      const createSchoolProfileInput: CreateSchoolProfileDTO = plainToInstance(
        CreateSchoolProfileDTO,
        schoolProfiles[0],
        {
          excludeExtraneousValues: true,
        },
      );

      schoolProfilesRepository.create.mockResolvedValue(schoolProfiles[0]);
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
        schoolProfilesService.create(currentUser, createSchoolProfileInput),
      ).rejects.toThrow(ForbiddenException);
      expect(caslAbilityFactory.createForUser).toHaveBeenCalledWith(
        currentUser,
      );
      expect(cannotMockFnRev).toHaveBeenLastCalledWith(
        Actions.CREATE,
        plainToInstance(
          SchoolProfileResource,
          { userId: createSchoolProfileInput.userId },
          {
            excludeExtraneousValues: true,
          },
        ),
      );
    });
  });

  it('should throw InternalServerErrorException if create fails', async () => {
    const createSchoolProfileInput: CreateSchoolProfileDTO = plainToInstance(
      CreateSchoolProfileDTO,
      schoolProfiles[0],
      { excludeExtraneousValues: true },
    );

    schoolProfilesRepository.create.mockRejectedValue(new Error());

    await expect(
      schoolProfilesService.create(currentUser, createSchoolProfileInput),
    ).rejects.toThrow(InternalServerErrorException);
  });

  describe('update', () => {
    it('should update an school profile', async () => {
      const newData = {
        title: 'new title',
      };
      const updateSchoolProfileInput: UpdateSchoolProfileDTO = plainToInstance(
        UpdateSchoolProfileDTO,
        newData,
        {
          excludeExtraneousValues: true,
        },
      );
      const expectedSchoolProfile: SchoolProfileDTO = plainToInstance(
        SchoolProfileDTO,
        {
          ...schoolProfiles[0],
          ...newData,
        },
      );

      schoolProfilesRepository.findOneById.mockResolvedValue(schoolProfiles[0]);
      schoolProfilesRepository.update.mockResolvedValue(expectedSchoolProfile);

      const result = await schoolProfilesService.update(
        currentUser,
        updateSchoolProfileInput,
      );
      expect(result).toBe(expectedSchoolProfile);
      expect(schoolProfilesRepository.update).toHaveBeenCalledWith(
        schoolProfiles[0].userId,
        updateSchoolProfileInput,
      );
      expect(caslAbilityFactory.createForUser).toHaveBeenCalledWith(
        currentUser,
      );
      expect(cannotMockFn).toHaveBeenLastCalledWith(
        'update',
        plainToInstance(SchoolProfileResource, schoolProfiles[0], {
          excludeExtraneousValues: true,
        }),
      );
    });

    it('should throw ForbiddenException if user cannot update school profile', async () => {
      const invalidCurrentUser = plainToInstance(AuthUserDTO, {
        ...currentUser,
        id: 'other user',
      });
      const newData = {
        title: 'new title',
      };
      const updateSchoolProfileInput: UpdateSchoolProfileDTO = plainToInstance(
        UpdateSchoolProfileDTO,
        newData,
      );
      const expectedSchoolProfile: SchoolProfileDTO = plainToInstance(
        SchoolProfileDTO,
        {
          ...schoolProfiles[0],
          ...newData,
        },
      );

      schoolProfilesRepository.findOneById.mockResolvedValue(schoolProfiles[0]);
      schoolProfilesRepository.update.mockResolvedValue(expectedSchoolProfile);
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
        schoolProfilesService.update(
          invalidCurrentUser,
          updateSchoolProfileInput,
        ),
      ).rejects.toThrow(ForbiddenException);
      expect(caslAbilityFactory.createForUser).toHaveBeenCalledWith(
        invalidCurrentUser,
      );
      expect(cannotMockFnRev).toHaveBeenLastCalledWith(
        'update',
        plainToInstance(SchoolProfileResource, schoolProfiles[0], {
          excludeExtraneousValues: true,
        }),
      );
    });

    it('should throw InternalServerErrorException if update fails', async () => {
      const newData = {
        title: 'new title',
      };
      const updateSchoolProfileInput: UpdateSchoolProfileDTO = plainToInstance(
        UpdateSchoolProfileDTO,
        newData,
      );

      schoolProfilesRepository.findOneById.mockResolvedValue(schoolProfiles[0]);
      schoolProfilesRepository.update.mockRejectedValue(new Error());

      await expect(
        schoolProfilesService.update(currentUser, updateSchoolProfileInput),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('delete', () => {
    it('should delete an school profile', async () => {
      schoolProfilesRepository.findOneById.mockResolvedValue(schoolProfiles[0]);
      schoolProfilesRepository.delete.mockResolvedValue(true);

      const result = await schoolProfilesService.delete(currentUser);
      expect(result).toBe(true);
      expect(schoolProfilesRepository.delete).toHaveBeenCalledWith(
        schoolProfiles[0].userId,
      );
      expect(caslAbilityFactory.createForUser).toHaveBeenCalledWith(
        currentUser,
      );
      expect(cannotMockFn).toHaveBeenLastCalledWith(
        Actions.DELETE,
        plainToInstance(SchoolProfileResource, schoolProfiles[0], {
          excludeExtraneousValues: true,
        }),
      );
    });

    it('should throw ForbiddenException if user cannot read school profile', async () => {
      schoolProfilesRepository.findOneById.mockResolvedValue(schoolProfiles[0]);
      schoolProfilesRepository.delete.mockResolvedValue(true);
      caslAbilityFactory.createForUser.mockImplementationOnce(
        caslAbilityFactory.createForUser,
      );
      caslAbilityFactory.createForUser.mockImplementationOnce(
        jest.fn().mockReturnValue({
          can: canMockFnRev,
          cannot: cannotMockFnRev,
        }),
      );

      await expect(schoolProfilesService.delete(currentUser)).rejects.toThrow(
        ForbiddenException,
      );
      expect(caslAbilityFactory.createForUser).toHaveBeenCalledWith(
        currentUser,
      );
      expect(cannotMockFnRev).toHaveBeenLastCalledWith(
        Actions.DELETE,
        plainToInstance(SchoolProfileResource, schoolProfiles[0], {
          excludeExtraneousValues: true,
        }),
      );
    });

    it('should throw InternalServerErrorException if delete fails', async () => {
      schoolProfilesRepository.findOneById.mockResolvedValue(schoolProfiles[0]);
      schoolProfilesRepository.delete.mockRejectedValue(new Error());

      await expect(schoolProfilesService.delete(currentUser)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
