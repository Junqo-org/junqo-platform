import { Test, TestingModule } from '@nestjs/testing';
import { ExperiencesService } from './experiences.service';
import { ExperiencesRepository } from './repository/experiences.repository';
import { StudentProfilesService } from '../student-profiles/student-profiles.service';
import { CaslAbilityFactory } from '../casl/casl-ability.factory';
import {
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateExperienceDTO, UpdateExperienceDTO } from './dto/experience.dto';
import { UserType } from '../users/dto/user-type.enum';

describe('ExperiencesService', () => {
  let experiencesService: ExperiencesService;
  let experiencesRepository: any;
  let studentProfilesService: any;
  let caslAbilityFactory: any;

  const mockStudentProfile = {
    userId: 'f59cc25b-0cc4-4032-83c2-0d34c84318bb',
    name: 'Student Name',
    skills: ['JavaScript'],
  };

  const mockExperiences = [
    {
      id: 'e69cc25b-0cc4-4032-83c2-0d34c84318ba',
      title: 'Software Developer',
      company: 'Tech Corp',
      startDate: '2022-01-01',
      endDate: '2023-01-01',
      description: 'Worked on various web projects',
      skills: ['JavaScript', 'TypeScript'],
      studentProfileId: 'f59cc25b-0cc4-4032-83c2-0d34c84318bb',
    },
    {
      id: 'f79cc25b-0cc4-4032-83c2-0d34c84318bc',
      title: 'Frontend Developer',
      company: 'Web Solutions',
      startDate: '2021-06-01',
      endDate: '2022-06-01',
      description: 'Built UI components',
      skills: ['React', 'CSS'],
      studentProfileId: 'f59cc25b-0cc4-4032-83c2-0d34c84318bb',
    },
  ];

  const currentStudentUser = {
    id: 'f59cc25b-0cc4-4032-83c2-0d34c84318bb',
    email: 'student@test.com',
    name: 'Student User',
    type: UserType.STUDENT,
  };

  const currentCompanyUser = {
    id: 'a59cc25b-0cc4-4032-83c2-0d34c84318cc',
    email: 'company@test.com',
    name: 'Company User',
    type: UserType.COMPANY,
  };

  beforeEach(async () => {
    const canMockFn = jest.fn().mockReturnValue(true);
    const cannotMockFn = jest.fn().mockReturnValue(false);

    experiencesRepository = {
      create: jest.fn(),
      findOneById: jest.fn(),
      findByStudentProfileId: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    studentProfilesService = {
      findOneById: jest.fn(),
    };

    caslAbilityFactory = {
      createForUser: jest.fn().mockReturnValue({
        can: canMockFn,
        cannot: cannotMockFn,
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExperiencesService,
        {
          provide: ExperiencesRepository,
          useValue: experiencesRepository,
        },
        {
          provide: StudentProfilesService,
          useValue: studentProfilesService,
        },
        {
          provide: CaslAbilityFactory,
          useValue: caslAbilityFactory,
        },
      ],
    }).compile();

    experiencesService = module.get<ExperiencesService>(ExperiencesService);
  });

  describe('create', () => {
    it('should create an experience', async () => {
      const createExperienceDto: CreateExperienceDTO = {
        title: 'New Experience',
        company: 'Company Name',
        startDate: '2023-01-01',
        skills: ['JavaScript'],
      };

      studentProfilesService.findOneById.mockResolvedValue(mockStudentProfile);
      experiencesRepository.create.mockResolvedValue(mockExperiences[0]);

      const result = await experiencesService.create(
        currentStudentUser,
        createExperienceDto,
      );

      expect(result).toEqual(mockExperiences[0]);
      expect(studentProfilesService.findOneById).toHaveBeenCalledWith(
        currentStudentUser,
        currentStudentUser.id,
      );
      expect(experiencesRepository.create).toHaveBeenCalledWith(
        currentStudentUser.id,
        createExperienceDto,
      );
    });

    it('should throw ForbiddenException when user lacks permissions', async () => {
      const createExperienceDto: CreateExperienceDTO = {
        title: 'New Experience',
        company: 'Company Name',
        startDate: '2023-01-01',
      };

      studentProfilesService.findOneById.mockResolvedValue(mockStudentProfile);

      // Override the mock to simulate permission denied
      caslAbilityFactory.createForUser.mockImplementationOnce(() => ({
        can: jest.fn().mockReturnValue(false),
        cannot: jest.fn().mockReturnValue(true),
      }));

      await expect(
        experiencesService.create(currentStudentUser, createExperienceDto),
      ).rejects.toThrow(ForbiddenException);

      expect(studentProfilesService.findOneById).toHaveBeenCalledWith(
        currentStudentUser,
        currentStudentUser.id,
      );
      expect(experiencesRepository.create).not.toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException when creation fails', async () => {
      const createExperienceDto: CreateExperienceDTO = {
        title: 'New Experience',
        company: 'Company Name',
        startDate: '2023-01-01',
      };

      studentProfilesService.findOneById.mockResolvedValue(mockStudentProfile);
      experiencesRepository.create.mockResolvedValue(null);

      await expect(
        experiencesService.create(currentStudentUser, createExperienceDto),
      ).rejects.toThrow(InternalServerErrorException);

      expect(studentProfilesService.findOneById).toHaveBeenCalledWith(
        currentStudentUser,
        currentStudentUser.id,
      );
      expect(experiencesRepository.create).toHaveBeenCalledWith(
        currentStudentUser.id,
        createExperienceDto,
      );
    });

    it('should throw InternalServerErrorException on unexpected error', async () => {
      const createExperienceDto: CreateExperienceDTO = {
        title: 'New Experience',
        company: 'Company Name',
        startDate: '2023-01-01',
      };

      studentProfilesService.findOneById.mockResolvedValue(mockStudentProfile);
      experiencesRepository.create.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(
        experiencesService.create(currentStudentUser, createExperienceDto),
      ).rejects.toThrow(InternalServerErrorException);

      expect(studentProfilesService.findOneById).toHaveBeenCalledWith(
        currentStudentUser,
        currentStudentUser.id,
      );
      expect(experiencesRepository.create).toHaveBeenCalledWith(
        currentStudentUser.id,
        createExperienceDto,
      );
    });
  });

  describe('findOneById', () => {
    it('should find experience by ID', async () => {
      experiencesRepository.findOneById.mockResolvedValue(mockExperiences[0]);

      const result = await experiencesService.findOneById(
        currentStudentUser,
        mockExperiences[0].id,
      );

      expect(result).toEqual(mockExperiences[0]);
      expect(experiencesRepository.findOneById).toHaveBeenCalledWith(
        mockExperiences[0].id,
      );
    });

    it('should throw NotFoundException when experience not found', async () => {
      experiencesRepository.findOneById.mockResolvedValue(null);

      await expect(
        experiencesService.findOneById(currentStudentUser, 'non-existent-id'),
      ).rejects.toThrow(NotFoundException);

      expect(experiencesRepository.findOneById).toHaveBeenCalledWith(
        'non-existent-id',
      );
    });

    it('should allow student to view their own experience', async () => {
      const experience = {
        ...mockExperiences[0],
        studentProfileId: currentStudentUser.id,
      };
      experiencesRepository.findOneById.mockResolvedValue(experience);

      const result = await experiencesService.findOneById(
        currentStudentUser,
        experience.id,
      );

      expect(result).toEqual(experience);
      expect(experiencesRepository.findOneById).toHaveBeenCalledWith(
        experience.id,
      );
    });

    it('should allow company users to view student experiences', async () => {
      experiencesRepository.findOneById.mockResolvedValue(mockExperiences[0]);
      studentProfilesService.findOneById.mockResolvedValue(mockStudentProfile);

      const result = await experiencesService.findOneById(
        currentCompanyUser,
        mockExperiences[0].id,
      );

      expect(result).toEqual(mockExperiences[0]);
      expect(experiencesRepository.findOneById).toHaveBeenCalledWith(
        mockExperiences[0].id,
      );
      expect(studentProfilesService.findOneById).toHaveBeenCalledWith(
        currentCompanyUser,
        mockExperiences[0].studentProfileId,
      );
    });
  });

  describe('findByStudentProfileId', () => {
    it('should find all experiences for a student profile', async () => {
      const studentProfileId = mockExperiences[0].studentProfileId;

      experiencesRepository.findByStudentProfileId.mockResolvedValue(
        mockExperiences,
      );
      studentProfilesService.findOneById.mockResolvedValue(mockStudentProfile);

      const result = await experiencesService.findByStudentProfileId(
        currentCompanyUser,
        studentProfileId,
      );

      expect(result).toEqual(mockExperiences);
      expect(experiencesRepository.findByStudentProfileId).toHaveBeenCalledWith(
        studentProfileId,
      );
      expect(studentProfilesService.findOneById).toHaveBeenCalledWith(
        currentCompanyUser,
        studentProfileId,
      );
    });

    it('should allow student to view their own experiences without validation', async () => {
      const studentProfileId = currentStudentUser.id;

      experiencesRepository.findByStudentProfileId.mockResolvedValue(
        mockExperiences,
      );

      const result = await experiencesService.findByStudentProfileId(
        currentStudentUser,
        studentProfileId,
      );

      expect(result).toEqual(mockExperiences);
      expect(experiencesRepository.findByStudentProfileId).toHaveBeenCalledWith(
        studentProfileId,
      );
      // Should not need to validate profile access for own profile
      expect(studentProfilesService.findOneById).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update an experience', async () => {
      const experienceId = mockExperiences[0].id;
      const updateDto: UpdateExperienceDTO = {
        title: 'Updated Title',
        description: 'Updated description',
      };

      const updatedExperience = { ...mockExperiences[0], ...updateDto };

      experiencesRepository.findOneById.mockResolvedValue({
        ...mockExperiences[0],
        studentProfileId: currentStudentUser.id, // Set to match current user ID
      });
      experiencesRepository.update.mockResolvedValue(updatedExperience);

      const result = await experiencesService.update(
        currentStudentUser,
        experienceId,
        updateDto,
      );

      expect(result).toEqual(updatedExperience);
      expect(experiencesRepository.findOneById).toHaveBeenCalledWith(
        experienceId,
      );
      expect(experiencesRepository.update).toHaveBeenCalledWith(
        experienceId,
        updateDto,
      );
    });

    it('should throw NotFoundException when experience not found', async () => {
      const experienceId = 'non-existent-id';
      const updateDto: UpdateExperienceDTO = { title: 'Updated Title' };

      experiencesRepository.findOneById.mockResolvedValue(null);

      await expect(
        experiencesService.update(currentStudentUser, experienceId, updateDto),
      ).rejects.toThrow(NotFoundException);

      expect(experiencesRepository.findOneById).toHaveBeenCalledWith(
        experienceId,
      );
      expect(experiencesRepository.update).not.toHaveBeenCalled();
    });

    it("should throw ForbiddenException when updating someone else's experience", async () => {
      const experienceId = mockExperiences[0].id;
      const updateDto: UpdateExperienceDTO = { title: 'Updated Title' };

      // Set studentProfileId to something different from current user
      const differentUserExperience = {
        ...mockExperiences[0],
        studentProfileId: 'different-user-id',
      };

      experiencesRepository.findOneById.mockResolvedValue(
        differentUserExperience,
      );

      await expect(
        experiencesService.update(currentStudentUser, experienceId, updateDto),
      ).rejects.toThrow(ForbiddenException);

      expect(experiencesRepository.findOneById).toHaveBeenCalledWith(
        experienceId,
      );
      expect(experiencesRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete an experience', async () => {
      const experienceId = mockExperiences[0].id;

      experiencesRepository.findOneById.mockResolvedValue({
        ...mockExperiences[0],
        studentProfileId: currentStudentUser.id, // Set to match current user ID
      });
      experiencesRepository.delete.mockResolvedValue(true);

      const result = await experiencesService.delete(
        currentStudentUser,
        experienceId,
      );

      expect(result).toBe(true);
      expect(experiencesRepository.findOneById).toHaveBeenCalledWith(
        experienceId,
      );
      expect(experiencesRepository.delete).toHaveBeenCalledWith(experienceId);
    });

    it('should throw NotFoundException when experience not found', async () => {
      const experienceId = 'non-existent-id';

      experiencesRepository.findOneById.mockResolvedValue(null);

      await expect(
        experiencesService.delete(currentStudentUser, experienceId),
      ).rejects.toThrow(NotFoundException);

      expect(experiencesRepository.findOneById).toHaveBeenCalledWith(
        experienceId,
      );
      expect(experiencesRepository.delete).not.toHaveBeenCalled();
    });

    it("should throw ForbiddenException when deleting someone else's experience", async () => {
      const experienceId = mockExperiences[0].id;

      // Set studentProfileId to something different from current user
      const differentUserExperience = {
        ...mockExperiences[0],
        studentProfileId: 'different-user-id',
      };

      experiencesRepository.findOneById.mockResolvedValue(
        differentUserExperience,
      );

      await expect(
        experiencesService.delete(currentStudentUser, experienceId),
      ).rejects.toThrow(ForbiddenException);

      expect(experiencesRepository.findOneById).toHaveBeenCalledWith(
        experienceId,
      );
      expect(experiencesRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe('validateStudentProfileAccess', () => {
    it('should pass silently for own profile', async () => {
      const studentProfileId = currentStudentUser.id;

      // Call the private method through a test helper that exposes it
      await (experiencesService as any).validateStudentProfileAccess(
        currentStudentUser,
        studentProfileId,
      );

      // Should not need to check with student profile service
      expect(studentProfilesService.findOneById).not.toHaveBeenCalled();
    });

    it('should verify access through student profile service for other profiles', async () => {
      const studentProfileId = 'other-user-id';

      studentProfilesService.findOneById.mockResolvedValue(mockStudentProfile);

      // Call the private method through a test helper that exposes it
      await (experiencesService as any).validateStudentProfileAccess(
        currentCompanyUser,
        studentProfileId,
      );

      // Should check with student profile service
      expect(studentProfilesService.findOneById).toHaveBeenCalledWith(
        currentCompanyUser,
        studentProfileId,
      );
    });

    it('should throw when student profile service throws', async () => {
      const studentProfileId = 'other-user-id';

      studentProfilesService.findOneById.mockRejectedValue(
        new ForbiddenException('Access denied'),
      );

      // Call the private method through a test helper that exposes it
      await expect(
        (experiencesService as any).validateStudentProfileAccess(
          currentCompanyUser,
          studentProfileId,
        ),
      ).rejects.toThrow(ForbiddenException);

      // Should check with student profile service
      expect(studentProfilesService.findOneById).toHaveBeenCalledWith(
        currentCompanyUser,
        studentProfileId,
      );
    });
  });
});
