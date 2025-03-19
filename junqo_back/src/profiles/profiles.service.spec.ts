import { ProfilesService } from './profiles.service';
import { ProfilesRepository } from './repository/profiles.repository';
import { Actions, CaslAbilityFactory } from '../casl/casl-ability.factory';
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
import { StudentProfileResource } from '../casl/dto/profile-resource.dto';

const currentUser: AuthUserDTO = plainToInstance(AuthUserDTO, {
  id: 'e69cc25b-0cc4-4032-83c2-0d34c84318ba',
  type: UserType.STUDENT,
  name: 'test user',
  email: 'test@mail.com',
});

const studentProfiles: StudentProfileDTO[] = [
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

  describe('findAllStudentProfiles', () => {
    it('should return all student profiles', async () => {
      profilesRepository.findAllStudentProfiles.mockResolvedValue(
        studentProfiles,
      );

      const result = await profilesService.findAllStudentProfiles(currentUser);
      expect(result).toBe(studentProfiles);
      expect(profilesRepository.findAllStudentProfiles).toHaveBeenCalled();
      expect(caslAbilityFactory.createForUser).toHaveBeenCalledWith(
        currentUser,
      );
      expect(cannotMockFn).toHaveBeenLastCalledWith(
        Actions.READ,
        StudentProfileResource,
      );
    });

    it('should throw NotFoundException if there is no student profile', async () => {
      profilesRepository.findAllStudentProfiles.mockResolvedValue([]);

      await expect(
        profilesService.findAllStudentProfiles(currentUser),
      ).rejects.toThrow(NotFoundException);
      expect(profilesRepository.findAllStudentProfiles).toHaveBeenCalled();
      expect(caslAbilityFactory.createForUser).toHaveBeenCalledWith(
        currentUser,
      );
      expect(cannotMockFn).toHaveBeenLastCalledWith(
        Actions.READ,
        StudentProfileResource,
      );
    });

    it('should throw ForbiddenException if user cannot read student profile', async () => {
      profilesRepository.findAllStudentProfiles.mockResolvedValue(
        studentProfiles,
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
        profilesService.findAllStudentProfiles(currentUser),
      ).rejects.toThrow(ForbiddenException);
      expect(caslAbilityFactory.createForUser).toHaveBeenCalledWith(
        currentUser,
      );
      expect(cannotMockFnRev).toHaveBeenLastCalledWith(
        Actions.READ,
        StudentProfileResource,
      );
    });
  });

  describe('findOneById', () => {
    it('should return an student profile by ID', async () => {
      profilesRepository.findOneById.mockResolvedValue(studentProfiles[0]);

      const result = await profilesService.findOneById(
        currentUser,
        studentProfiles[0].userId,
      );
      expect(result).toBe(studentProfiles[0]);
      expect(profilesRepository.findOneById).toHaveBeenCalledWith(
        studentProfiles[0].userId,
      );
      expect(caslAbilityFactory.createForUser).toHaveBeenCalledWith(
        currentUser,
      );
      expect(cannotMockFn).toHaveBeenLastCalledWith(
        Actions.READ,
        plainToInstance(StudentProfileResource, studentProfiles[0], {
          excludeExtraneousValues: true,
        }),
      );
    });

    it("should throw NotFoundException if the student profile don't exists", async () => {
      profilesRepository.findOneById.mockRejectedValueOnce(
        new NotFoundException(),
      );

      await expect(
        profilesService.findOneById(currentUser, studentProfiles[0].userId),
      ).rejects.toThrow(NotFoundException);
      expect(profilesRepository.findOneById).toHaveBeenCalled();
    });

    it('should throw ForbiddenException if user cannot read student profile', async () => {
      profilesRepository.findOneById.mockResolvedValue(studentProfiles[0]);
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
        profilesService.findOneById(currentUser, studentProfiles[0].userId),
      ).rejects.toThrow(ForbiddenException);
      expect(caslAbilityFactory.createForUser).toHaveBeenCalledWith(
        currentUser,
      );
      expect(cannotMockFnRev).toHaveBeenLastCalledWith(
        Actions.READ,
        plainToInstance(StudentProfileResource, studentProfiles[0], {
          excludeExtraneousValues: true,
        }),
      );
    });
  });

  describe('createStudentProfile', () => {
    it('should create an student profile', async () => {
      const createStudentProfileInput: CreateStudentProfileDTO =
        plainToInstance(CreateStudentProfileDTO, studentProfiles[0], {
          excludeExtraneousValues: true,
        });

      profilesRepository.createStudentProfile.mockResolvedValue(
        studentProfiles[0],
      );

      const result = await profilesService.createStudentProfile(
        currentUser,
        createStudentProfileInput,
      );
      expect(result).toBe(studentProfiles[0]);
      expect(profilesRepository.createStudentProfile).toHaveBeenCalledWith(
        createStudentProfileInput,
      );
      expect(caslAbilityFactory.createForUser).toHaveBeenCalledWith(
        currentUser,
      );
      expect(cannotMockFn).toHaveBeenLastCalledWith(
        Actions.CREATE,
        plainToInstance(StudentProfileResource, createStudentProfileInput, {
          excludeExtraneousValues: true,
        }),
      );
    });

    it('should throw ForbiddenException if user cannot create student profile', async () => {
      const createStudentProfileInput: CreateStudentProfileDTO =
        plainToInstance(CreateStudentProfileDTO, studentProfiles[0], {
          excludeExtraneousValues: true,
        });

      profilesRepository.createStudentProfile.mockResolvedValue(
        studentProfiles[0],
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
        profilesService.createStudentProfile(
          currentUser,
          createStudentProfileInput,
        ),
      ).rejects.toThrow(ForbiddenException);
      expect(caslAbilityFactory.createForUser).toHaveBeenCalledWith(
        currentUser,
      );
      expect(cannotMockFnRev).toHaveBeenLastCalledWith(
        Actions.CREATE,
        plainToInstance(
          StudentProfileResource,
          { userId: createStudentProfileInput.userId },
          {
            excludeExtraneousValues: true,
          },
        ),
      );
    });
  });

  it('should throw InternalServerErrorException if create fails', async () => {
    const createStudentProfileInput: CreateStudentProfileDTO = plainToInstance(
      CreateStudentProfileDTO,
      studentProfiles[0],
      { excludeExtraneousValues: true },
    );

    profilesRepository.createStudentProfile.mockRejectedValue(new Error());

    await expect(
      profilesService.createStudentProfile(
        currentUser,
        createStudentProfileInput,
      ),
    ).rejects.toThrow(InternalServerErrorException);
  });

  describe('updateStudentProfile', () => {
    it('should update an student profile', async () => {
      const newData = {
        title: 'new title',
      };
      const updateStudentProfileInput: UpdateStudentProfileDTO =
        plainToInstance(UpdateStudentProfileDTO, newData, {
          excludeExtraneousValues: true,
        });
      const expectedStudentProfile: StudentProfileDTO = plainToInstance(
        StudentProfileDTO,
        {
          ...studentProfiles[0],
          ...newData,
        },
      );

      profilesRepository.findOneById.mockResolvedValue(studentProfiles[0]);
      profilesRepository.updateStudentProfile.mockResolvedValue(
        expectedStudentProfile,
      );

      const result = await profilesService.updateStudentProfile(
        currentUser,
        updateStudentProfileInput,
      );
      expect(result).toBe(expectedStudentProfile);
      expect(profilesRepository.updateStudentProfile).toHaveBeenCalledWith(
        studentProfiles[0].userId,
        updateStudentProfileInput,
      );
      expect(caslAbilityFactory.createForUser).toHaveBeenCalledWith(
        currentUser,
      );
      expect(cannotMockFn).toHaveBeenLastCalledWith(
        'update',
        plainToInstance(StudentProfileResource, studentProfiles[0], {
          excludeExtraneousValues: true,
        }),
      );
    });

    it('should throw ForbiddenException if user cannot update student profile', async () => {
      const invalidCurrentUser = plainToInstance(AuthUserDTO, {
        ...currentUser,
        id: 'other user',
      });
      const newData = {
        title: 'new title',
      };
      const updateStudentProfileInput: UpdateStudentProfileDTO =
        plainToInstance(UpdateStudentProfileDTO, newData);
      const expectedStudentProfile: StudentProfileDTO = plainToInstance(
        StudentProfileDTO,
        {
          ...studentProfiles[0],
          ...newData,
        },
      );

      profilesRepository.findOneById.mockResolvedValue(studentProfiles[0]);
      profilesRepository.updateStudentProfile.mockResolvedValue(
        expectedStudentProfile,
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
        profilesService.updateStudentProfile(
          invalidCurrentUser,
          updateStudentProfileInput,
        ),
      ).rejects.toThrow(ForbiddenException);
      expect(caslAbilityFactory.createForUser).toHaveBeenCalledWith(
        invalidCurrentUser,
      );
      expect(cannotMockFnRev).toHaveBeenLastCalledWith(
        'update',
        plainToInstance(StudentProfileResource, studentProfiles[0], {
          excludeExtraneousValues: true,
        }),
      );
    });

    it('should throw InternalServerErrorException if update fails', async () => {
      const newData = {
        title: 'new title',
      };
      const updateStudentProfileInput: UpdateStudentProfileDTO =
        plainToInstance(UpdateStudentProfileDTO, newData);

      profilesRepository.findOneById.mockResolvedValue(studentProfiles[0]);
      profilesRepository.updateStudentProfile.mockRejectedValue(new Error());

      await expect(
        profilesService.updateStudentProfile(
          currentUser,
          updateStudentProfileInput,
        ),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('deleteStudentProfile', () => {
    it('should delete an student profile', async () => {
      profilesRepository.findOneById.mockResolvedValue(studentProfiles[0]);
      profilesRepository.deleteStudentProfile.mockResolvedValue(true);

      const result = await profilesService.deleteStudentProfile(currentUser);
      expect(result).toBe(true);
      expect(profilesRepository.deleteStudentProfile).toHaveBeenCalledWith(
        studentProfiles[0].userId,
      );
      expect(caslAbilityFactory.createForUser).toHaveBeenCalledWith(
        currentUser,
      );
      expect(cannotMockFn).toHaveBeenLastCalledWith(
        Actions.DELETE,
        plainToInstance(StudentProfileResource, studentProfiles[0], {
          excludeExtraneousValues: true,
        }),
      );
    });

    it('should throw ForbiddenException if user cannot read student profile', async () => {
      profilesRepository.findOneById.mockResolvedValue(studentProfiles[0]);
      profilesRepository.deleteStudentProfile.mockResolvedValue(true);
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
        profilesService.deleteStudentProfile(currentUser),
      ).rejects.toThrow(ForbiddenException);
      expect(caslAbilityFactory.createForUser).toHaveBeenCalledWith(
        currentUser,
      );
      expect(cannotMockFnRev).toHaveBeenLastCalledWith(
        Actions.DELETE,
        plainToInstance(StudentProfileResource, studentProfiles[0], {
          excludeExtraneousValues: true,
        }),
      );
    });

    it('should throw InternalServerErrorException if delete fails', async () => {
      profilesRepository.findOneById.mockResolvedValue(studentProfiles[0]);
      profilesRepository.deleteStudentProfile.mockRejectedValue(new Error());

      await expect(
        profilesService.deleteStudentProfile(currentUser),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });
});
