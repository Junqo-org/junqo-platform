import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import {
  CreateCompanyProfileDTO,
  CompanyProfileDTO,
  UpdateCompanyProfileDTO,
} from '../dto/company-profile.dto';
import { CompanyProfilesRepository } from './company-profiles.repository';
import { CompanyProfileModel } from './models/company-profile.model';
import { plainToInstance } from 'class-transformer';

const CompanyProfileDtoExample: CompanyProfileDTO = new CompanyProfileDTO({
  userId: '8aec0948-58dd-40b2-b085-5a47244036c2',
  name: 'Test User',
  avatar: 'https://picsum.photos/200/300',
});

describe('CompanyProfilesRepository', () => {
  let repository: CompanyProfilesRepository;
  let mockCompanyProfileModel: any;
  let mockExperienceModel: any;

  beforeEach(async () => {
    mockCompanyProfileModel = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      findByPk: jest.fn(),
      update: jest.fn(),
      destroy: jest.fn(),
      toCompanyProfileDTO: jest.fn(),
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
      toCompanyProfileDTO: jest.fn(),
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
      toCompanyProfileDTO: jest.fn(),
      sequelize: {
        transaction: jest.fn((transaction) => transaction()),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompanyProfilesRepository,
        {
          provide: getModelToken(CompanyProfileModel),
          useValue: mockCompanyProfileModel,
        },
        {
          provide: getModelToken(CompanyProfileModel),
          useValue: mockCompanyProfileModel,
        },
      ],
    }).compile();

    repository = module.get<CompanyProfilesRepository>(
      CompanyProfilesRepository,
    );
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('should create a new company profile', async () => {
      const createCompanyProfile: CreateCompanyProfileDTO =
        CompanyProfileDtoExample;
      const expectedCompanyProfile: CompanyProfileDTO = new CompanyProfileDTO(
        CompanyProfileDtoExample,
      );
      const companyProfileModel: CompanyProfileModel = {
        ...CompanyProfileDtoExample,
        ...mockCompanyProfileModel,
        toCompanyProfileDTO: jest
          .fn()
          .mockResolvedValue(expectedCompanyProfile),
      };

      mockCompanyProfileModel.create.mockResolvedValue(companyProfileModel);

      const result = await repository.create(createCompanyProfile);
      expect(result).toEqual(expectedCompanyProfile);
      expect(mockCompanyProfileModel.create).toHaveBeenCalledWith(
        CompanyProfileDtoExample,
      );
    });
  });

  describe('findOneById', () => {
    it('should find one company profile by userId', async () => {
      const userId = CompanyProfileDtoExample.userId;
      const expectedCompanyProfile: CompanyProfileDTO = new CompanyProfileDTO(
        CompanyProfileDtoExample,
      );
      const companyProfileModel: CompanyProfileModel = {
        ...CompanyProfileDtoExample,
        ...mockCompanyProfileModel,
        toCompanyProfileDTO: jest
          .fn()
          .mockResolvedValue(expectedCompanyProfile),
      };

      mockCompanyProfileModel.findByPk.mockResolvedValue(companyProfileModel);

      const result = await repository.findOneById(userId);
      expect(result).toEqual(expectedCompanyProfile);
      expect(mockCompanyProfileModel.findByPk).toHaveBeenCalledWith(userId);
    });
  });

  describe('update', () => {
    it('should update a company profile', async () => {
      const updateData: UpdateCompanyProfileDTO = {
        avatar: 'https://picsum.photos/200/400',
      };
      const expectedCompanyProfile: CompanyProfileDTO = new CompanyProfileDTO(
        CompanyProfileDtoExample,
      );
      const companyProfileModel: CompanyProfileModel = {
        ...CompanyProfileDtoExample,
        ...mockCompanyProfileModel,
        toCompanyProfileDTO: jest
          .fn()
          .mockResolvedValue(expectedCompanyProfile),
      };
      companyProfileModel.update = jest.fn().mockResolvedValue({
        ...companyProfileModel,
        ...updateData,
      });

      mockCompanyProfileModel.findByPk.mockResolvedValue(companyProfileModel);

      const result = await repository.update(
        CompanyProfileDtoExample.userId,
        updateData,
      );
      expect(result).toEqual(expectedCompanyProfile);
      expect(mockCompanyProfileModel.findByPk).toHaveBeenCalledWith(
        CompanyProfileDtoExample.userId,
        { transaction: undefined },
      );
      expect(companyProfileModel.update).toHaveBeenCalledWith(
        {
          userId: CompanyProfileDtoExample.userId,
          ...updateData,
        },
        { transaction: undefined },
      );
    });
  });

  describe('delete', () => {
    it('should delete a company profile', async () => {
      const userId = '8aec0948-58dd-40b2-b085-5a47244036c2';
      const expectedCompanyProfile: CompanyProfileDTO = new CompanyProfileDTO(
        CompanyProfileDtoExample,
      );
      const companyProfileModel: CompanyProfileModel = {
        ...CompanyProfileDtoExample,
        ...mockCompanyProfileModel,
        toCompanyProfileDTO: jest
          .fn()
          .mockResolvedValue(expectedCompanyProfile),
      };
      companyProfileModel.destroy = jest.fn().mockResolvedValue(true);

      mockCompanyProfileModel.findByPk.mockResolvedValue(companyProfileModel);

      const result = await repository.delete(userId);
      expect(result).toEqual(true);
      expect(companyProfileModel.destroy).toHaveBeenCalled();
    });
  });
});
