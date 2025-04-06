import { Test, TestingModule } from '@nestjs/testing';
import { ExperiencesController } from './experiences.controller';
import { ExperiencesService } from './experiences.service';
import { CreateExperienceDTO, UpdateExperienceDTO } from './dto/experience.dto';
import { AuthUserDTO } from '../shared/dto/auth-user.dto';
import { UserType } from '../users/dto/user-type.enum';

describe('ExperiencesController', () => {
  let experiencesController: ExperiencesController;
  let experiencesService: any;

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

  const currentUser: AuthUserDTO = {
    id: 'f59cc25b-0cc4-4032-83c2-0d34c84318bb',
    email: 'student@test.com',
    name: 'Student User',
    type: UserType.STUDENT,
  };

  beforeEach(async () => {
    experiencesService = {
      create: jest.fn(),
      findOneById: jest.fn(),
      findByStudentProfileId: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExperiencesController],
      providers: [
        {
          provide: ExperiencesService,
          useValue: experiencesService,
        },
      ],
    }).compile();

    experiencesController = module.get<ExperiencesController>(
      ExperiencesController,
    );
  });

  it('should be defined', () => {
    expect(experiencesController).toBeDefined();
  });

  describe('createMy', () => {
    it('should create an experience for current user', async () => {
      const createExperienceDto: CreateExperienceDTO = {
        title: 'New Experience',
        company: 'Company Name',
        startDate: '2023-01-01',
        skills: ['JavaScript'],
      };

      experiencesService.create.mockResolvedValue(mockExperiences[0]);

      const result = await experiencesController.createMy(
        currentUser,
        createExperienceDto,
      );

      expect(result).toEqual(mockExperiences[0]);
      expect(experiencesService.create).toHaveBeenCalledWith(
        currentUser,
        createExperienceDto,
      );
    });
  });

  describe('findMy', () => {
    it('should find all experiences for current user', async () => {
      experiencesService.findByStudentProfileId.mockResolvedValue(
        mockExperiences,
      );

      const result = await experiencesController.findMy(currentUser);

      expect(result).toEqual(mockExperiences);
      expect(experiencesService.findByStudentProfileId).toHaveBeenCalledWith(
        currentUser,
        currentUser.id,
      );
    });
  });

  describe('findByProfile', () => {
    it('should find all experiences for a specific profile', async () => {
      const profileId = 'some-profile-id';

      experiencesService.findByStudentProfileId.mockResolvedValue(
        mockExperiences,
      );

      const result = await experiencesController.findByProfile(
        currentUser,
        profileId,
      );

      expect(result).toEqual(mockExperiences);
      expect(experiencesService.findByStudentProfileId).toHaveBeenCalledWith(
        currentUser,
        profileId,
      );
    });
  });

  describe('findOne', () => {
    it('should find one experience by ID', async () => {
      const experienceId = mockExperiences[0].id;

      experiencesService.findOneById.mockResolvedValue(mockExperiences[0]);

      const result = await experiencesController.findOne(
        currentUser,
        experienceId,
      );

      expect(result).toEqual(mockExperiences[0]);
      expect(experiencesService.findOneById).toHaveBeenCalledWith(
        currentUser,
        experienceId,
      );
    });
  });

  describe('update', () => {
    it('should update an experience', async () => {
      const experienceId = mockExperiences[0].id;
      const updateExperienceDto: UpdateExperienceDTO = {
        title: 'Updated Title',
        description: 'Updated description',
      };

      const updatedExperience = {
        ...mockExperiences[0],
        ...updateExperienceDto,
      };
      experiencesService.update.mockResolvedValue(updatedExperience);

      const result = await experiencesController.update(
        currentUser,
        experienceId,
        updateExperienceDto,
      );

      expect(result).toEqual(updatedExperience);
      expect(experiencesService.update).toHaveBeenCalledWith(
        currentUser,
        experienceId,
        updateExperienceDto,
      );
    });
  });

  describe('delete', () => {
    it('should delete an experience', async () => {
      const experienceId = mockExperiences[0].id;

      experiencesService.delete.mockResolvedValue(true);

      const result = await experiencesController.delete(
        currentUser,
        experienceId,
      );

      expect(result.isSuccessful).toBe(true);
      expect(experiencesService.delete).toHaveBeenCalledWith(
        currentUser,
        experienceId,
      );
    });
  });
});
