import { ProfilesService } from './profiles.service';
import { ProfilesRepository } from './repository/profiles.repository';
import { CaslAbilityFactory } from '../casl/casl-ability.factory';
import {
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { AuthUserDTO } from '../shared/dto/auth-user.dto';
import {
  CreateStudentProfileDTO,
  StudentProfileDTO,
  UpdateStudentProfileDTO,
} from './dto/student-profile.dto';
import { UserType } from '../users/dto/user-type.enum';
import { plainToInstance } from 'class-transformer';
import { ExperienceDTO } from './dto/experience.dto';
import { Mocked } from '@suites/doubles.jest';
import { TestBed } from '@suites/unit';

const currentUser: AuthUserDTO = plainToInstance(AuthUserDTO, {
  id: 'e69cc25b-0cc4-4032-83c2-0d34c84318ba',
  type: UserType.STUDENT,
  name: 'test user',
  email: 'test@mail.com',
});

const profiles: StudentProfileDTO[] = [
  plainToInstance(StudentProfileDTO, {
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
  plainToInstance(StudentProfileDTO, {
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

describe('ProfilesService', () => {
  let profilesService: ProfilesService;
  let profilesRepository: Mocked<ProfilesRepository>;
  let caslAbilityFactory: Mocked<CaslAbilityFactory>;

  beforeEach(async () => {
    const mockCaslAbilityFactory = (stubFn) => ({
      createForUser: () => {
        const ability = {
          can: stubFn().mockReturnValue(true),
          cannot: stubFn().mockReturnValue(false),
        };
        return ability;
      },
    });

    const { unit, unitRef } = await TestBed.solitary(ProfilesService)
      .mock(CaslAbilityFactory)
      .impl(mockCaslAbilityFactory)
      .compile();

    profilesService = unit;
    profilesRepository = unitRef.get(ProfilesRepository);
    caslAbilityFactory = unitRef.get(CaslAbilityFactory);
  });

  it('should be defined', () => {
    expect(profilesService).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all profiles', async () => {
      profilesRepository.findAll.mockResolvedValue(profiles);

      const result = await profilesService.findAllStudentProfiles(currentUser);
      expect(result).toBe(profiles);
      expect(profilesRepository.findAll).toHaveBeenCalled();
    });

    it('should throw NotFoundException if there is no profile', async () => {
      profilesRepository.findAll.mockResolvedValue([]);

      await expect(
        profilesService.findAllStudentProfiles(currentUser),
      ).rejects.toThrow(NotFoundException);
      expect(profilesRepository.findAll).toHaveBeenCalled();
    });

    it('should throw ForbiddenException if user cannot read profile', async () => {
      caslAbilityFactory.createForUser = jest.fn().mockReturnValue({
        can: jest.fn().mockReturnValue(false),
        cannot: jest.fn().mockReturnValue(true),
      });

      await expect(
        profilesService.findAllStudentProfiles(currentUser),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('findOneById', () => {
    it('should return an profile by ID', async () => {
      profilesRepository.findOneById.mockResolvedValue(profiles[0]);

      const result = await profilesService.findOneById(
        currentUser,
        profiles[0].userId,
      );
      expect(result).toBe(profiles[0]);
      expect(profilesRepository.findOneById).toHaveBeenCalledWith(
        profiles[0].userId,
      );
    });

    it("should throw NotFoundException if the profile don't exists", async () => {
      profilesRepository.findOneById.mockResolvedValue(null);

      await expect(
        profilesService.findOneById(currentUser, profiles[0].userId),
      ).rejects.toThrow(NotFoundException);
      expect(profilesRepository.findOneById).toHaveBeenCalled();
    });

    it('should throw ForbiddenException if user cannot read profile', async () => {
      caslAbilityFactory.createForUser = jest.fn().mockReturnValue({
        can: jest.fn().mockReturnValue(false),
        cannot: jest.fn().mockReturnValue(true),
      });

      await expect(
        profilesService.findOneById(currentUser, profiles[0].userId),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('createStudentProfile', () => {
    it('should create an profile', async () => {
      const createProfileInput: CreateStudentProfileDTO = plainToInstance(
        CreateStudentProfileDTO,
        profiles[0],
        { excludeExtraneousValues: true },
      );

      profilesRepository.createStudentProfile.mockResolvedValue(profiles[0]);

      const result = await profilesService.createStudentProfile(
        currentUser,
        createProfileInput,
      );
      expect(result).toBe(profiles[0]);
      expect(profilesRepository.createStudentProfile).toHaveBeenCalledWith(
        createProfileInput,
      );
    });

    it('should throw ForbiddenException if user cannot create profile', async () => {
      const createProfileInput: CreateStudentProfileDTO = plainToInstance(
        CreateStudentProfileDTO,
        profiles[0],
        { excludeExtraneousValues: true },
      );

      caslAbilityFactory.createForUser = jest.fn().mockReturnValue({
        can: jest.fn().mockReturnValue(false),
        cannot: jest.fn().mockReturnValue(true),
      });

      await expect(
        profilesService.createStudentProfile(currentUser, createProfileInput),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  it('should throw InternalServerErrorException if create fails', async () => {
    const createProfileInput: CreateStudentProfileDTO = plainToInstance(
      CreateStudentProfileDTO,
      profiles[0],
      { excludeExtraneousValues: true },
    );

    profilesRepository.createStudentProfile.mockRejectedValue(new Error());

    await expect(
      profilesService.createStudentProfile(currentUser, createProfileInput),
    ).rejects.toThrow(InternalServerErrorException);
  });

  describe('updateStudentProfile', () => {
    it('should update an profile', async () => {
      const newData = {
        userId: profiles[0].userId,
        title: 'new title',
      };
      const updateProfileInput: UpdateStudentProfileDTO = plainToInstance(
        UpdateStudentProfileDTO,
        newData,
      );
      const expectedProfile: StudentProfileDTO = plainToInstance(
        StudentProfileDTO,
        {
          ...profiles[0],
          ...newData,
        },
      );

      profilesRepository.findOneById.mockResolvedValue(profiles[0]);
      profilesRepository.updateStudentProfile.mockResolvedValue(
        expectedProfile,
      );

      const result = await profilesService.updateStudentProfile(
        currentUser,
        updateProfileInput,
      );
      expect(result).toBe(expectedProfile);
      expect(profilesRepository.updateStudentProfile).toHaveBeenCalledWith(
        profiles[0].userId,
        updateProfileInput,
      );
    });

    it('should throw ForbiddenException if user cannot update profile', async () => {
      const invalidCurrentUser = plainToInstance(AuthUserDTO, {
        ...currentUser,
        id: 'other user',
      });
      const updateProfileInput: UpdateStudentProfileDTO = plainToInstance(
        UpdateStudentProfileDTO,
        {
          userId: profiles[0].userId,
          title: 'New Title',
        },
      );

      profilesRepository.findOneById.mockResolvedValue(profiles[0]);
      caslAbilityFactory.createForUser = jest.fn().mockReturnValue({
        can: jest.fn().mockReturnValue(false),
        cannot: jest.fn().mockReturnValue(true),
      });

      await expect(
        profilesService.updateStudentProfile(
          invalidCurrentUser,
          updateProfileInput,
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw InternalServerErrorException if update fails', async () => {
      const newData = {
        userId: profiles[0].userId,
        title: 'new title',
      };
      const updateProfileInput: UpdateStudentProfileDTO = plainToInstance(
        UpdateStudentProfileDTO,
        newData,
      );

      profilesRepository.findOneById.mockResolvedValue(profiles[0]);
      profilesRepository.updateStudentProfile.mockRejectedValue(new Error());

      await expect(
        profilesService.updateStudentProfile(currentUser, updateProfileInput),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('deleteStudentProfile', () => {
    it('should delete an profile', async () => {
      profilesRepository.findOneById.mockResolvedValue(profiles[0]);
      profilesRepository.deleteStudentProfile.mockResolvedValue(true);

      const result = await profilesService.deleteStudentProfile(currentUser);
      expect(result).toBe(true);
      expect(profilesRepository.deleteStudentProfile).toHaveBeenCalledWith(
        profiles[0].userId,
      );
    });

    it('should throw ForbiddenException if user cannot read profile', async () => {
      profilesRepository.findOneById.mockResolvedValue(profiles[0]);
      profilesRepository.deleteStudentProfile.mockResolvedValue(true);

      caslAbilityFactory.createForUser = jest.fn().mockReturnValue({
        can: jest.fn().mockReturnValue(false),
        cannot: jest.fn().mockReturnValue(true),
      });

      await expect(
        profilesService.deleteStudentProfile(currentUser),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw InternalServerErrorException if delete fails', async () => {
      profilesRepository.findOneById.mockResolvedValue(profiles[0]);
      profilesRepository.deleteStudentProfile.mockRejectedValue(new Error());

      await expect(
        profilesService.deleteStudentProfile(currentUser),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });
});
