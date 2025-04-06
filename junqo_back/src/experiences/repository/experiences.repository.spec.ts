import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { ExperiencesRepository } from './experiences.repository';
import { ExperienceModel } from './models/experience.model';
import { NotFoundException } from '@nestjs/common';
import {
  CreateExperienceDTO,
  ExperienceDTO,
  UpdateExperienceDTO,
} from '../dto/experience.dto';

describe('ExperiencesRepository', () => {
  let experiencesRepository: ExperiencesRepository;
  let mockExperienceModel: any;

  const testExperiences = [
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

  beforeEach(async () => {
    mockExperienceModel = {
      create: jest.fn(),
      findAll: jest.fn(),
      findByPk: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExperiencesRepository,
        {
          provide: getModelToken(ExperienceModel),
          useValue: mockExperienceModel,
        },
      ],
    }).compile();

    experiencesRepository = module.get<ExperiencesRepository>(
      ExperiencesRepository,
    );
  });

  it('should be defined', () => {
    expect(experiencesRepository).toBeDefined();
  });

  describe('create', () => {
    it('should create an experience', async () => {
      const createExperienceDto: CreateExperienceDTO = {
        title: 'Software Developer',
        company: 'Tech Corp',
        startDate: '2022-01-01',
        endDate: '2023-01-01',
        description: 'Worked on various web projects',
        skills: ['JavaScript', 'TypeScript'],
      };

      const studentProfileId = 'f59cc25b-0cc4-4032-83c2-0d34c84318bb';

      const experienceModel = {
        ...testExperiences[0],
        toJSON: jest.fn().mockReturnValue(testExperiences[0]),
      };

      mockExperienceModel.create.mockResolvedValue(experienceModel);

      const result = await experiencesRepository.create(
        studentProfileId,
        createExperienceDto,
      );

      expect(result).toEqual(testExperiences[0]);
      expect(mockExperienceModel.create).toHaveBeenCalledWith({
        ...createExperienceDto,
        studentProfileId,
      });
    });
  });

  describe('findOneById', () => {
    it('should find experience by ID', async () => {
      const experienceId = testExperiences[0].id;

      const experienceModel = {
        ...testExperiences[0],
        toJSON: jest.fn().mockReturnValue(testExperiences[0]),
      };

      mockExperienceModel.findByPk.mockResolvedValue(experienceModel);

      const result = await experiencesRepository.findOneById(experienceId);

      expect(result).toEqual(testExperiences[0]);
      expect(mockExperienceModel.findByPk).toHaveBeenCalledWith(experienceId);
    });

    it('should return null when experience not found', async () => {
      const experienceId = 'non-existent-id';

      mockExperienceModel.findByPk.mockResolvedValue(null);

      const result = await experiencesRepository.findOneById(experienceId);

      expect(result).toBeNull();
      expect(mockExperienceModel.findByPk).toHaveBeenCalledWith(experienceId);
    });
  });

  describe('findByStudentProfileId', () => {
    it('should find all experiences for a student profile', async () => {
      const studentProfileId = testExperiences[0].studentProfileId;

      const experienceModels = testExperiences.map((exp) => ({
        ...exp,
        toJSON: jest.fn().mockReturnValue(exp),
      }));

      mockExperienceModel.findAll.mockResolvedValue(experienceModels);

      const result =
        await experiencesRepository.findByStudentProfileId(studentProfileId);

      expect(result).toEqual(testExperiences);
      expect(mockExperienceModel.findAll).toHaveBeenCalledWith({
        where: { studentProfileId },
        order: [['startDate', 'DESC']],
      });
    });

    it('should return empty array when no experiences found', async () => {
      const studentProfileId = 'profile-with-no-experiences';

      mockExperienceModel.findAll.mockResolvedValue([]);

      const result =
        await experiencesRepository.findByStudentProfileId(studentProfileId);

      expect(result).toEqual([]);
      expect(mockExperienceModel.findAll).toHaveBeenCalledWith({
        where: { studentProfileId },
        order: [['startDate', 'DESC']],
      });
    });
  });

  describe('update', () => {
    it('should update an experience', async () => {
      const experienceId = testExperiences[0].id;
      const updateData: UpdateExperienceDTO = {
        title: 'Senior Software Developer',
        description: 'Led development teams',
      };

      const experienceModel = {
        ...testExperiences[0],
        update: jest.fn(),
        toJSON: jest.fn().mockReturnValue({
          ...testExperiences[0],
          ...updateData,
        }),
      };

      mockExperienceModel.findByPk.mockResolvedValue(experienceModel);

      const result = await experiencesRepository.update(
        experienceId,
        updateData,
      );

      expect(result).toEqual({
        ...testExperiences[0],
        ...updateData,
      });
      expect(mockExperienceModel.findByPk).toHaveBeenCalledWith(experienceId);
      expect(experienceModel.update).toHaveBeenCalledWith(updateData);
    });

    it('should throw NotFoundException when experience not found', async () => {
      const experienceId = 'non-existent-id';
      const updateData: UpdateExperienceDTO = { title: 'New Title' };

      mockExperienceModel.findByPk.mockResolvedValue(null);

      await expect(
        experiencesRepository.update(experienceId, updateData),
      ).rejects.toThrow(NotFoundException);

      expect(mockExperienceModel.findByPk).toHaveBeenCalledWith(experienceId);
    });
  });

  describe('delete', () => {
    it('should delete an experience', async () => {
      const experienceId = testExperiences[0].id;

      const experienceModel = {
        ...testExperiences[0],
        destroy: jest.fn().mockResolvedValue(undefined),
      };

      mockExperienceModel.findByPk.mockResolvedValue(experienceModel);

      const result = await experiencesRepository.delete(experienceId);

      expect(result).toBe(true);
      expect(mockExperienceModel.findByPk).toHaveBeenCalledWith(experienceId);
      expect(experienceModel.destroy).toHaveBeenCalled();
    });

    it('should throw NotFoundException when experience not found', async () => {
      const experienceId = 'non-existent-id';

      mockExperienceModel.findByPk.mockResolvedValue(null);

      await expect(experiencesRepository.delete(experienceId)).rejects.toThrow(
        NotFoundException,
      );

      expect(mockExperienceModel.findByPk).toHaveBeenCalledWith(experienceId);
    });
  });
});
