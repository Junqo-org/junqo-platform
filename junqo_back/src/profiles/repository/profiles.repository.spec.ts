import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { CreateStudentProfileDTO } from '../dto/student-profile.dto';
import { ProfilesRepository } from './profiles.repository';
import { StudentProfileModel } from './models/student-profile.model';
import { ExperienceModel } from './models/experience.model';
import { CompanyProfileModel } from './models/company-profile.model';
import { ExperienceDTO } from '../dto/experience.dto';

const createStudentDtoExample = {
  userId: '8aec0948-58dd-40b2-b085-5a47244036c2',
  name: 'Test User',
  avatar: 'https://picsum.photos/200/300',
  skills: ['nestjs', 'flutter', 'work in team'],
  experiences: [
    new ExperienceDTO(
      'title',
      'company',
      new Date('01/02/2020'),
      new Date('01/05/2020'),
      'description',
      ['nestjs', 'flutter', 'work in team'],
    ),
  ],
};

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
      const createStudentProfileDto: CreateStudentProfileDTO = {
        ...createStudentDtoExample,
      };
      const expectedStudentProfile = {
        ...createStudentProfileDto,
        ...mockStudentProfileModel,
      };

      mockStudentProfileModel.create.mockResolvedValue(expectedStudentProfile);

      const result = await repository.createStudentProfile(
        createStudentProfileDto,
      );
      expect(result).toEqual(expectedStudentProfile);
      expect(mockStudentProfileModel.create).toHaveBeenCalledWith(
        createStudentProfileDto,
      );
    });
  });

  describe('findOneById', () => {
    it('should find one student profile by userId', async () => {
      const userId = '8aec0948-58dd-40b2-b085-5a47244036c2';
      const expectedStudentProfile = {
        ...createStudentDtoExample,
        ...mockStudentProfileModel,
      };

      mockStudentProfileModel.findByPk.mockResolvedValue(
        expectedStudentProfile,
      );

      const result = await repository.findOneById(userId);
      expect(result).toEqual(expectedStudentProfile);
      expect(mockStudentProfileModel.findByPk).toHaveBeenCalledWith(userId);
    });
  });

  describe('update', () => {
    it('should update a student profile', async () => {
      const updateData = { name: 'Updated Test User' };
      const expectedUpdatedProfile = {
        ...updateData,
        ...createStudentDtoExample,
        ...mockStudentProfileModel,
      };

      mockStudentProfileModel.findByPk.mockResolvedValue({
        ...createStudentDtoExample,
        ...mockStudentProfileModel,
      });
      mockStudentProfileModel.update.mockResolvedValue(expectedUpdatedProfile);

      const result = await repository.updateStudentProfile(
        createStudentDtoExample.userId,
        updateData,
      );
      expect(result).toEqual(expectedUpdatedProfile);
      expect(mockStudentProfileModel.findByPk).toHaveBeenCalledWith(
        createStudentDtoExample.userId,
        { transaction: undefined },
      );
    });
  });

  describe('delete', () => {
    it('should delete a student profile', async () => {
      const userId = '8aec0948-58dd-40b2-b085-5a47244036c2';
      const expectedStudentProfile = {
        ...createStudentDtoExample,
        ...mockStudentProfileModel,
      };

      mockStudentProfileModel.findByPk.mockResolvedValue(
        expectedStudentProfile,
      );
      mockStudentProfileModel.destroy.mockResolvedValue(true);

      const result = await repository.deleteStudentProfile(userId);
      expect(result).toEqual(true);
      expect(mockStudentProfileModel.destroy).toHaveBeenCalled();
    });
  });
});
