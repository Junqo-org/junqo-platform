import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import {
  CreateStudentProfileDTO,
  StudentProfileDTO,
  UpdateStudentProfileDTO,
} from '../dto/student-profile.dto';
import { ProfilesRepository } from './profiles.repository';
import { StudentProfileModel } from './models/student-profile.model';
import { ExperienceModel } from './models/experience.model';
import { CompanyProfileModel } from './models/company-profile.model';
import { ExperienceDTO } from '../dto/experience.dto';

const StudentProfileDtoExample: StudentProfileDTO = new StudentProfileDTO({
  userId: '8aec0948-58dd-40b2-b085-5a47244036c2',
  name: 'Test User',
  avatar: 'https://picsum.photos/200/300',
  skills: ['nestjs', 'flutter', 'work in team'],
  experiences: [
    new ExperienceDTO({
      title: 'title',
      company: 'company',
      startDate: new Date('01/02/2020'),
      endDate: new Date('01/05/2020'),
      description: 'description',
      skills: ['nestjs', 'flutter', 'work in team'],
    }),
  ],
});

describe('ProfilesRepository', () => {
  let repository: ProfilesRepository;
  let mockStudentProfileModel: any;
  let mockExperienceModel: any;
  let mockCompanyProfileModel: any;

  beforeEach(async () => {
    mockStudentProfileModel = {
      create: jest.fn(),
      findAll: jest.fn(),
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
      findAll: jest.fn(),
      findOne: jest.fn(),
      findByPk: jest.fn(),
      update: jest.fn(),
      destroy: jest.fn(),
      toStudentProfileDTO: jest.fn(),
      sequelize: {
        transaction: jest.fn((transaction) => transaction()),
      },
    };
    mockCompanyProfileModel = {
      create: jest.fn(),
      findAll: jest.fn(),
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
        ProfilesRepository,
        {
          provide: getModelToken(StudentProfileModel),
          useValue: mockStudentProfileModel,
        },
        {
          provide: getModelToken(ExperienceModel),
          useValue: mockExperienceModel,
        },
        {
          provide: getModelToken(CompanyProfileModel),
          useValue: mockCompanyProfileModel,
        },
      ],
    }).compile();

    repository = module.get<ProfilesRepository>(ProfilesRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('should create a new student profile', async () => {
      const createStudentProfile: CreateStudentProfileDTO =
        StudentProfileDtoExample;
      const expectedStudentProfile: StudentProfileDTO = new StudentProfileDTO(
        StudentProfileDtoExample,
      );
      const studentProfileModel: StudentProfileModel = {
        ...StudentProfileDtoExample,
        ...mockStudentProfileModel,
        toStudentProfileDTO: jest
          .fn()
          .mockResolvedValue(expectedStudentProfile),
      };

      mockStudentProfileModel.create.mockResolvedValue(studentProfileModel);

      const result =
        await repository.createStudentProfile(createStudentProfile);
      expect(result).toEqual(expectedStudentProfile);
      expect(mockStudentProfileModel.create).toHaveBeenCalledWith(
        StudentProfileDtoExample,
      );
    });
  });

  describe('findOneById', () => {
    it('should find one student profile by userId', async () => {
      const userId = StudentProfileDtoExample.userId;
      const expectedStudentProfile: StudentProfileDTO = new StudentProfileDTO(
        StudentProfileDtoExample,
      );
      const studentProfileModel: StudentProfileModel = {
        ...StudentProfileDtoExample,
        ...mockStudentProfileModel,
        toStudentProfileDTO: jest
          .fn()
          .mockResolvedValue(expectedStudentProfile),
      };

      mockStudentProfileModel.findByPk.mockResolvedValue(studentProfileModel);

      const result = await repository.findOneById(userId);
      expect(result).toEqual(expectedStudentProfile);
      expect(mockStudentProfileModel.findByPk).toHaveBeenCalledWith(userId);
    });
  });

  describe('update', () => {
    it('should update a student profile', async () => {
      const updateData: UpdateStudentProfileDTO = { name: 'Updated Test User' };
      const expectedStudentProfile: StudentProfileDTO = new StudentProfileDTO(
        StudentProfileDtoExample,
      );
      const studentProfileModel: StudentProfileModel = {
        ...StudentProfileDtoExample,
        ...mockStudentProfileModel,
        toStudentProfileDTO: jest
          .fn()
          .mockResolvedValue(expectedStudentProfile),
      };
      studentProfileModel.update = jest.fn().mockResolvedValue({
        ...studentProfileModel,
        ...updateData,
      });

      mockStudentProfileModel.findByPk.mockResolvedValue(studentProfileModel);

      const result = await repository.updateStudentProfile(
        StudentProfileDtoExample.userId,
        updateData,
      );
      expect(result).toEqual(expectedStudentProfile);
      expect(mockStudentProfileModel.findByPk).toHaveBeenCalledWith(
        StudentProfileDtoExample.userId,
        { transaction: undefined },
      );
      expect(studentProfileModel.update).toHaveBeenCalledWith(
        {
          userId: StudentProfileDtoExample.userId,
          ...updateData,
        },
        { transaction: undefined },
      );
    });
  });

  describe('delete', () => {
    it('should delete a student profile', async () => {
      const userId = '8aec0948-58dd-40b2-b085-5a47244036c2';
      const expectedStudentProfile: StudentProfileDTO = new StudentProfileDTO(
        StudentProfileDtoExample,
      );
      const studentProfileModel: StudentProfileModel = {
        ...StudentProfileDtoExample,
        ...mockStudentProfileModel,
        toStudentProfileDTO: jest
          .fn()
          .mockResolvedValue(expectedStudentProfile),
      };
      studentProfileModel.destroy = jest.fn().mockResolvedValue(true);

      mockStudentProfileModel.findByPk.mockResolvedValue(studentProfileModel);

      const result = await repository.deleteStudentProfile(userId);
      expect(result).toEqual(true);
      expect(studentProfileModel.destroy).toHaveBeenCalled();
    });
  });
});
