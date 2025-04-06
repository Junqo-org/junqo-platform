import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import {
  CreateSchoolProfileDTO,
  SchoolProfileDTO,
  UpdateSchoolProfileDTO,
} from '../dto/school-profile.dto';
import { SchoolProfilesRepository } from './school-profiles.repository';
import { SchoolProfileModel } from './models/school-profile.model';
import { CompanyProfileModel } from '../../company-profiles/repository/models/company-profile.model';
import { plainToInstance } from 'class-transformer';

const SchoolProfileDtoExample: SchoolProfileDTO = new SchoolProfileDTO({
  userId: '8aec0948-58dd-40b2-b085-5a47244036c2',
  name: 'Test User',
  avatar: 'https://picsum.photos/200/300',
});

describe('SchoolProfilesRepository', () => {
  let repository: SchoolProfilesRepository;
  let mockSchoolProfileModel: any;
  let mockExperienceModel: any;
  let mockCompanyProfileModel: any;

  beforeEach(async () => {
    mockSchoolProfileModel = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      findByPk: jest.fn(),
      update: jest.fn(),
      destroy: jest.fn(),
      toSchoolProfileDTO: jest.fn(),
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
      toSchoolProfileDTO: jest.fn(),
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
      toSchoolProfileDTO: jest.fn(),
      sequelize: {
        transaction: jest.fn((transaction) => transaction()),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SchoolProfilesRepository,
        {
          provide: getModelToken(SchoolProfileModel),
          useValue: mockSchoolProfileModel,
        },
        {
          provide: getModelToken(CompanyProfileModel),
          useValue: mockCompanyProfileModel,
        },
      ],
    }).compile();

    repository = module.get<SchoolProfilesRepository>(
      SchoolProfilesRepository,
    );
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('should create a new school profile', async () => {
      const createSchoolProfile: CreateSchoolProfileDTO =
        SchoolProfileDtoExample;
      const expectedSchoolProfile: SchoolProfileDTO = new SchoolProfileDTO(
        SchoolProfileDtoExample,
      );
      const schoolProfileModel: SchoolProfileModel = {
        ...SchoolProfileDtoExample,
        ...mockSchoolProfileModel,
        toSchoolProfileDTO: jest
          .fn()
          .mockResolvedValue(expectedSchoolProfile),
      };

      mockSchoolProfileModel.create.mockResolvedValue(schoolProfileModel);

      const result = await repository.create(createSchoolProfile);
      expect(result).toEqual(expectedSchoolProfile);
      expect(mockSchoolProfileModel.create).toHaveBeenCalledWith(
        SchoolProfileDtoExample,
      );
    });
  });

  describe('findOneById', () => {
    it('should find one school profile by userId', async () => {
      const userId = SchoolProfileDtoExample.userId;
      const expectedSchoolProfile: SchoolProfileDTO = new SchoolProfileDTO(
        SchoolProfileDtoExample,
      );
      const schoolProfileModel: SchoolProfileModel = {
        ...SchoolProfileDtoExample,
        ...mockSchoolProfileModel,
        toSchoolProfileDTO: jest
          .fn()
          .mockResolvedValue(expectedSchoolProfile),
      };

      mockSchoolProfileModel.findByPk.mockResolvedValue(schoolProfileModel);

      const result = await repository.findOneById(userId);
      expect(result).toEqual(expectedSchoolProfile);
      expect(mockSchoolProfileModel.findByPk).toHaveBeenCalledWith(userId);
    });
  });

  describe('update', () => {
    it('should update a school profile', async () => {
      const updateData: UpdateSchoolProfileDTO = {
        avatar: 'https://picsum.photos/200/400',
      };
      const expectedSchoolProfile: SchoolProfileDTO = new SchoolProfileDTO(
        SchoolProfileDtoExample,
      );
      const schoolProfileModel: SchoolProfileModel = {
        ...SchoolProfileDtoExample,
        ...mockSchoolProfileModel,
        toSchoolProfileDTO: jest
          .fn()
          .mockResolvedValue(expectedSchoolProfile),
      };
      schoolProfileModel.update = jest.fn().mockResolvedValue({
        ...schoolProfileModel,
        ...updateData,
      });

      mockSchoolProfileModel.findByPk.mockResolvedValue(schoolProfileModel);

      const result = await repository.update(
        SchoolProfileDtoExample.userId,
        updateData,
      );
      expect(result).toEqual(expectedSchoolProfile);
      expect(mockSchoolProfileModel.findByPk).toHaveBeenCalledWith(
        SchoolProfileDtoExample.userId,
        { transaction: undefined },
      );
      expect(schoolProfileModel.update).toHaveBeenCalledWith(
        {
          userId: SchoolProfileDtoExample.userId,
          ...updateData,
        },
        { transaction: undefined },
      );
    });
  });

  describe('delete', () => {
    it('should delete a school profile', async () => {
      const userId = '8aec0948-58dd-40b2-b085-5a47244036c2';
      const expectedSchoolProfile: SchoolProfileDTO = new SchoolProfileDTO(
        SchoolProfileDtoExample,
      );
      const schoolProfileModel: SchoolProfileModel = {
        ...SchoolProfileDtoExample,
        ...mockSchoolProfileModel,
        toSchoolProfileDTO: jest
          .fn()
          .mockResolvedValue(expectedSchoolProfile),
      };
      schoolProfileModel.destroy = jest.fn().mockResolvedValue(true);

      mockSchoolProfileModel.findByPk.mockResolvedValue(schoolProfileModel);

      const result = await repository.delete(userId);
      expect(result).toEqual(true);
      expect(schoolProfileModel.destroy).toHaveBeenCalled();
    });
  });
});
