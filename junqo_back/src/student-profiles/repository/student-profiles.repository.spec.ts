import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import {
  CreateStudentProfileDTO,
  StudentProfileDTO,
  UpdateStudentProfileDTO,
} from '../dto/student-profile.dto';
import { StudentProfileQueryDTO } from '../dto/student-profile-query.dto';
import { StudentProfilesRepository } from './student-profiles.repository';
import { StudentProfileModel } from './models/student-profile.model';
import { ExperienceModel } from '../../experiences/repository/models/experience.model';
import { ExperienceDTO } from '../../experiences/dto/experience.dto';
import { plainToInstance } from 'class-transformer';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

const studentProfiles: StudentProfileDTO[] = [
  new StudentProfileDTO({
    userId: '8aec0948-58dd-40b2-b085-5a47244036c2',
    name: 'Test User',
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
  new StudentProfileDTO({
    userId: '8aec0948-58dd-40b2-b085-5a47244036c2',
    name: 'Test User',
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
];

let studentProfileModels: StudentProfileModel[] = [];

describe('StudentProfilesRepository', () => {
  let repository: StudentProfilesRepository;
  let mockStudentProfileModel: any;
  let mockExperienceModel: any;

  beforeEach(async () => {
    mockStudentProfileModel = {
      create: jest.fn(),
      findAndCountAll: jest.fn(),
      findOne: jest.fn(),
      findByPk: jest.fn(),
      update: jest.fn(),
      destroy: jest.fn(),
      toStudentProfileDTO: jest.fn(),
      sequelize: {
        transaction: jest.fn((transaction) => transaction()),
      },
    };
    mockExperienceModel = {
      create: jest.fn(),
      findAndCountAll: jest.fn(),
      findOne: jest.fn(),
      findByPk: jest.fn(),
      update: jest.fn(),
      destroy: jest.fn(),
      toStudentProfileDTO: jest.fn(),
      sequelize: {
        transaction: jest.fn((transaction) => transaction()),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StudentProfilesRepository,
        {
          provide: getModelToken(StudentProfileModel),
          useValue: mockStudentProfileModel,
        },
        {
          provide: getModelToken(ExperienceModel),
          useValue: mockExperienceModel,
        },
      ],
    }).compile();

    repository = module.get<StudentProfilesRepository>(
      StudentProfilesRepository,
    );

    studentProfileModels = studentProfiles.map((profile) => ({
      ...profile,
      ...mockStudentProfileModel,
      toStudentProfileDTO: jest.fn().mockReturnValue(profile),
    }));
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findByQuery', () => {
    const query: StudentProfileQueryDTO = plainToInstance(
      StudentProfileQueryDTO,
      {
        skills: ['skill'],
        page: 1,
        limit: 1,
      },
    );

    it('should return all school profiles if no query', async () => {
      mockStudentProfileModel.findAndCountAll.mockResolvedValue({
        rows: studentProfileModels,
        count: studentProfileModels.length,
      });

      const result = await repository.findByQuery({});
      expect(result).toEqual({
        rows: studentProfiles,
        count: studentProfiles.length,
      });
      expect(mockStudentProfileModel.findAndCountAll).toHaveBeenCalled();
    });

    it('should find every school profile corresponding to given query', async () => {
      mockStudentProfileModel.findAndCountAll.mockResolvedValue({
        rows: studentProfileModels,
        count: studentProfileModels.length,
      });

      const result = await repository.findByQuery(query);
      expect(result).toEqual({
        rows: studentProfiles,
        count: studentProfiles.length,
      });
      expect(mockStudentProfileModel.findAndCountAll).toHaveBeenCalled();
    });

    it('should throw NotFoundException if there is no school profile', async () => {
      mockStudentProfileModel.findAndCountAll.mockResolvedValue({
        rows: [],
        count: 0,
      });

      await expect(repository.findByQuery(query)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw InternalServerErrorException if fetch fail', async () => {
      mockStudentProfileModel.findAndCountAll.mockRejectedValue(new Error());

      await expect(repository.findByQuery(query)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findOneById', () => {
    it('should find one student profile by userId', async () => {
      const userId = studentProfiles[0].userId;

      mockStudentProfileModel.findByPk.mockResolvedValue(
        studentProfileModels[0],
      );

      const result = await repository.findOneById(userId);
      expect(result).toEqual(studentProfiles[0]);
      expect(mockStudentProfileModel.findByPk).toHaveBeenCalledWith(userId, {
        include: expect.any(Array),
      });
    });

    it("should throw NotFoundException if the student profile doesn't exists", async () => {
      mockStudentProfileModel.findByPk.mockResolvedValue(null);

      await expect(repository.findOneById('id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw InternalServerErrorException if fetch fail', async () => {
      mockStudentProfileModel.findByPk.mockRejectedValue(new Error());

      await expect(repository.findOneById('id')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('create', () => {
    const createStudentProfile: CreateStudentProfileDTO = plainToInstance(
      CreateStudentProfileDTO,
      studentProfiles[0],
      { excludeExtraneousValues: true },
    );

    it('should create a new student profile', async () => {
      const expectedOutput: StudentProfileDTO = plainToInstance(
        StudentProfileDTO,
        studentProfileModels[0],
        { excludeExtraneousValues: true },
      );
      const studentProfileModel = {
        ...studentProfileModels[0],
        experiences: [],
      };
      mockStudentProfileModel.create.mockResolvedValue(studentProfileModel);

      const result = await repository.create(createStudentProfile);
      expect(result).toEqual(expectedOutput);
      expect(mockStudentProfileModel.create).toHaveBeenCalledWith(
        createStudentProfile,
        {
          include: expect.any(Array),
        },
      );
    });

    it('should throw InternalServerErrorException if create fails', async () => {
      mockStudentProfileModel.create.mockRejectedValue(new Error());

      await expect(repository.create(createStudentProfile)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('update', () => {
    const updateData: UpdateStudentProfileDTO = {
      avatar: 'https://picsum.photos/200/400',
    };

    it('should update a student profile', async () => {
      studentProfileModels[0].update = jest.fn().mockResolvedValue({
        ...studentProfileModels[0],
        ...updateData,
      });

      mockStudentProfileModel.findByPk.mockResolvedValue(
        studentProfileModels[0],
      );

      const result = await repository.update(
        studentProfiles[0].userId,
        updateData,
      );
      expect(result).toEqual(studentProfiles[0]);
      expect(mockStudentProfileModel.findByPk).toHaveBeenCalledWith(
        studentProfiles[0].userId,
        {
          include: expect.any(Array),
          transaction: undefined,
        },
      );
      expect(studentProfileModels[0].update).toHaveBeenCalledWith(updateData, {
        transaction: undefined,
      });
    });

    it("should throw NotFoundException if user doesn't exists", async () => {
      mockStudentProfileModel.findByPk.mockResolvedValue(null);

      await expect(
        repository.update(studentProfiles[0].userId, updateData),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw InternalServerErrorException if fetch fails', async () => {
      mockStudentProfileModel.findByPk.mockRejectedValue(new Error());

      await expect(
        repository.update(studentProfiles[0].userId, updateData),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should throw InternalServerErrorException if update fails', async () => {
      mockStudentProfileModel.findByPk.mockResolvedValue(
        studentProfileModels[0],
      );
      mockStudentProfileModel.update.mockRejectedValue(new Error());

      await expect(
        repository.update(studentProfiles[0].userId, updateData),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('delete', () => {
    it('should delete a student profile', async () => {
      studentProfileModels[0].destroy = jest.fn().mockResolvedValue(true);
      mockStudentProfileModel.findByPk.mockResolvedValue(
        studentProfileModels[0],
      );

      const result = await repository.delete(studentProfiles[0].userId);
      expect(result).toEqual(true);
      expect(studentProfileModels[0].destroy).toHaveBeenCalled();
    });

    it("should throw NotFoundException if user doesn't exists", async () => {
      mockStudentProfileModel.findByPk.mockResolvedValue(null);

      await expect(
        repository.delete(studentProfiles[0].userId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw InternalServerErrorException if fetch fails', async () => {
      mockStudentProfileModel.findByPk.mockRejectedValue(new Error());

      await expect(
        repository.delete(studentProfiles[0].userId),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should throw InternalServerErrorException if delete fails', async () => {
      mockStudentProfileModel.findByPk.mockResolvedValue(
        studentProfileModels[0],
      );
      mockStudentProfileModel.destroy.mockRejectedValue(new Error());

      await expect(
        repository.delete(studentProfiles[0].userId),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });
});
