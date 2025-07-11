import { StudentProfilesRepository } from './repository/student-profiles.repository';
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
import {
  StudentProfileQueryDTO,
  StudentProfileQueryOutputDTO,
} from './dto/student-profile-query.dto';
import { UserType } from '../users/dto/user-type.enum';
import { plainToInstance } from 'class-transformer';
import { ExperienceDTO } from '../experiences/dto/experience.dto';
import { Mocked } from '@suites/doubles.jest';
import { TestBed } from '@suites/unit';
import { StudentProfileResource } from '../casl/dto/student-profile-resource.dto';
import { StudentProfilesService } from './student-profiles.service';

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

describe('StudentProfilesService', () => {
  let studentProfilesService: StudentProfilesService;
  let studentProfilesRepository: Mocked<StudentProfilesRepository>;
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

    const { unit, unitRef } = await TestBed.solitary(StudentProfilesService)
      .mock(CaslAbilityFactory)
      .impl(mockCaslAbilityFactory)
      .compile();

    studentProfilesService = unit;
    studentProfilesRepository = unitRef.get(StudentProfilesRepository);
    caslAbilityFactory = unitRef.get(CaslAbilityFactory);
  });

  it('should be defined', () => {
    expect(studentProfilesService).toBeDefined();
  });

  describe('findByQuery', () => {
    const query: StudentProfileQueryDTO = plainToInstance(
      StudentProfileQueryDTO,
      {
        skills: ['skill'],
        mode: ['any'],
        offset: 0,
        limit: 10,
      },
    );

    it('should return all student profiles if no query', async () => {
      const expectedQueryResult: StudentProfileQueryOutputDTO = {
        rows: studentProfiles,
        count: studentProfiles.length,
      };
      studentProfilesRepository.findByQuery.mockResolvedValue(
        expectedQueryResult,
      );

      const result = await studentProfilesService.findByQuery(currentUser, {});
      expect(result).toBe(expectedQueryResult);
      expect(studentProfilesRepository.findByQuery).toHaveBeenCalled();
      expect(caslAbilityFactory.createForUser).toHaveBeenCalledWith(
        currentUser,
      );
      expect(cannotMockFn).toHaveBeenLastCalledWith(
        Actions.READ,
        expect.any(StudentProfileResource),
      );
    });

    it('should return every student profiles corresponding to given query', async () => {
      const expectedQueryResult: StudentProfileQueryOutputDTO = {
        rows: studentProfiles,
        count: studentProfiles.length,
      };
      studentProfilesRepository.findByQuery.mockResolvedValue(
        expectedQueryResult,
      );

      const result = await studentProfilesService.findByQuery(
        currentUser,
        query,
      );
      expect(result).toBe(expectedQueryResult);
      expect(studentProfilesRepository.findByQuery).toHaveBeenCalled();
      expect(caslAbilityFactory.createForUser).toHaveBeenCalledWith(
        currentUser,
      );
      expect(cannotMockFn).toHaveBeenLastCalledWith(
        Actions.READ,
        expect.any(StudentProfileResource),
      );
    });

    it('should throw NotFoundException if there is no student profile', async () => {
      studentProfilesRepository.findByQuery.mockResolvedValue({
        rows: [],
        count: 0,
      });

      await expect(
        studentProfilesService.findByQuery(currentUser, query),
      ).rejects.toThrow(NotFoundException);
      expect(studentProfilesRepository.findByQuery).toHaveBeenCalled();
      expect(caslAbilityFactory.createForUser).toHaveBeenCalledWith(
        currentUser,
      );
      expect(cannotMockFn).toHaveBeenLastCalledWith(
        Actions.READ,
        expect.any(StudentProfileResource),
      );
    });

    it('should throw ForbiddenException if user cannot read student profile', async () => {
      const expectedQueryResult: StudentProfileQueryOutputDTO = {
        rows: studentProfiles,
        count: studentProfiles.length,
      };
      studentProfilesRepository.findByQuery.mockResolvedValue(
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
        studentProfilesService.findByQuery(currentUser, query),
      ).rejects.toThrow(ForbiddenException);
      expect(caslAbilityFactory.createForUser).toHaveBeenCalledWith(
        currentUser,
      );
      expect(cannotMockFnRev).toHaveBeenLastCalledWith(
        Actions.READ,
        expect.any(StudentProfileResource),
      );
    });
  });

  describe('findOneById', () => {
    it('should return a student profile by ID', async () => {
      studentProfilesRepository.findOneById.mockResolvedValue(
        studentProfiles[0],
      );

      const result = await studentProfilesService.findOneById(
        currentUser,
        studentProfiles[0].userId,
      );
      expect(result).toBe(studentProfiles[0]);
      expect(studentProfilesRepository.findOneById).toHaveBeenCalledWith(
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

    it("should throw NotFoundException if the student profile doesn't exists", async () => {
      studentProfilesRepository.findOneById.mockRejectedValueOnce(
        new NotFoundException(),
      );

      await expect(
        studentProfilesService.findOneById(
          currentUser,
          studentProfiles[0].userId,
        ),
      ).rejects.toThrow(NotFoundException);
      expect(studentProfilesRepository.findOneById).toHaveBeenCalled();
    });

    it('should throw ForbiddenException if user cannot read student profile', async () => {
      studentProfilesRepository.findOneById.mockResolvedValue(
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
        studentProfilesService.findOneById(
          currentUser,
          studentProfiles[0].userId,
        ),
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

  describe('create', () => {
    it('should create an student profile', async () => {
      const createStudentProfileInput: CreateStudentProfileDTO =
        plainToInstance(CreateStudentProfileDTO, studentProfiles[0], {
          excludeExtraneousValues: true,
        });

      studentProfilesRepository.create.mockResolvedValue(studentProfiles[0]);

      const result = await studentProfilesService.create(
        currentUser,
        createStudentProfileInput,
      );
      expect(result).toBe(studentProfiles[0]);
      expect(studentProfilesRepository.create).toHaveBeenCalledWith(
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

      studentProfilesRepository.create.mockResolvedValue(studentProfiles[0]);
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
        studentProfilesService.create(currentUser, createStudentProfileInput),
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

    studentProfilesRepository.create.mockRejectedValue(new Error());

    await expect(
      studentProfilesService.create(currentUser, createStudentProfileInput),
    ).rejects.toThrow(InternalServerErrorException);
  });

  describe('update', () => {
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

      studentProfilesRepository.findOneById.mockResolvedValue(
        studentProfiles[0],
      );
      studentProfilesRepository.update.mockResolvedValue(
        expectedStudentProfile,
      );

      const result = await studentProfilesService.update(
        currentUser,
        updateStudentProfileInput,
      );
      expect(result).toBe(expectedStudentProfile);
      expect(studentProfilesRepository.update).toHaveBeenCalledWith(
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

      studentProfilesRepository.findOneById.mockResolvedValue(
        studentProfiles[0],
      );
      studentProfilesRepository.update.mockResolvedValue(
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
        studentProfilesService.update(
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

      studentProfilesRepository.findOneById.mockResolvedValue(
        studentProfiles[0],
      );
      studentProfilesRepository.update.mockRejectedValue(new Error());

      await expect(
        studentProfilesService.update(currentUser, updateStudentProfileInput),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('delete', () => {
    it('should delete an student profile', async () => {
      studentProfilesRepository.findOneById.mockResolvedValue(
        studentProfiles[0],
      );
      studentProfilesRepository.delete.mockResolvedValue(true);

      const result = await studentProfilesService.delete(currentUser);
      expect(result).toBe(true);
      expect(studentProfilesRepository.delete).toHaveBeenCalledWith(
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
      studentProfilesRepository.findOneById.mockResolvedValue(
        studentProfiles[0],
      );
      studentProfilesRepository.delete.mockResolvedValue(true);
      caslAbilityFactory.createForUser.mockImplementationOnce(
        caslAbilityFactory.createForUser,
      );
      caslAbilityFactory.createForUser.mockImplementationOnce(
        jest.fn().mockReturnValue({
          can: canMockFnRev,
          cannot: cannotMockFnRev,
        }),
      );

      await expect(studentProfilesService.delete(currentUser)).rejects.toThrow(
        ForbiddenException,
      );
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
      studentProfilesRepository.findOneById.mockResolvedValue(
        studentProfiles[0],
      );
      studentProfilesRepository.delete.mockRejectedValue(new Error());

      await expect(studentProfilesService.delete(currentUser)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
