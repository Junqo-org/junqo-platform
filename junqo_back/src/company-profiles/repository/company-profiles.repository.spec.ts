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
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CompanyProfileQueryDTO } from '../dto/company-profile-query.dto';

const companyProfiles: CompanyProfileDTO[] = [
  new CompanyProfileDTO({
    userId: '8aec0948-58dd-40b2-b085-5a47244036c2',
    name: 'Test User',
    avatar: 'https://picsum.photos/200/300',
    description: 'Test User Company profile',
  websiteUrl: 'https://junqo.fr',
  }),
  new CompanyProfileDTO({
    userId: '8aec0948-58dd-40b2-b085-5a47244036c2',
    name: 'Test User',
    avatar: 'https://picsum.photos/200/300',
    description: 'Test User Company profile',
  websiteUrl: 'https://junqo.fr',
  }),
];

let companyProfileModels: CompanyProfileModel[] = [];

describe('CompanyProfilesRepository', () => {
  let repository: CompanyProfilesRepository;
  let mockCompanyProfileModel: any;

  beforeEach(async () => {
    mockCompanyProfileModel = {
      create: jest.fn(),
      findAndCountAll: jest.fn(),
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
      ],
    }).compile();

    repository = module.get<CompanyProfilesRepository>(
      CompanyProfilesRepository,
    );

    companyProfileModels = companyProfiles.map((profile) => ({
      ...profile,
      ...mockCompanyProfileModel,
      toCompanyProfileDTO: jest.fn().mockReturnValue(profile),
    }));
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findByQuery', () => {
    const query: CompanyProfileQueryDTO = plainToInstance(
      CompanyProfileQueryDTO,
      {
        page: 1,
        limit: 1,
      },
    );

    it('should return all school profiles if no query', async () => {
      mockCompanyProfileModel.findAndCountAll.mockResolvedValue({
        rows: companyProfileModels,
        count: companyProfileModels.length,
      });

      const result = await repository.findByQuery({});
      expect(result).toEqual({
        rows: companyProfiles,
        count: companyProfiles.length,
      });
      expect(mockCompanyProfileModel.findAndCountAll).toHaveBeenCalled();
    });

    it('should find every school profile corresponding to given query', async () => {
      mockCompanyProfileModel.findAndCountAll.mockResolvedValue({
        rows: companyProfileModels,
        count: companyProfileModels.length,
      });

      const result = await repository.findByQuery(query);
      expect(result).toEqual({
        rows: companyProfiles,
        count: companyProfiles.length,
      });
      expect(mockCompanyProfileModel.findAndCountAll).toHaveBeenCalled();
    });

    it('should throw NotFoundException if there is no school profile', async () => {
      mockCompanyProfileModel.findAndCountAll.mockResolvedValue({
        rows: [],
        count: 0,
      });

      await expect(repository.findByQuery(query)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw InternalServerErrorException if fetch fail', async () => {
      mockCompanyProfileModel.findAndCountAll.mockRejectedValue(new Error());

      await expect(repository.findByQuery(query)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findOneById', () => {
    it('should find one company profile by userId', async () => {
      const userId = companyProfiles[0].userId;

      mockCompanyProfileModel.findByPk.mockResolvedValue(
        companyProfileModels[0],
      );

      const result = await repository.findOneById(userId);
      expect(result).toEqual(companyProfiles[0]);
      expect(mockCompanyProfileModel.findByPk).toHaveBeenCalledWith(userId);
    });

    it("should throw NotFoundException if the company profile doesn't exists", async () => {
      mockCompanyProfileModel.findByPk.mockResolvedValue(null);

      await expect(repository.findOneById('id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw InternalServerErrorException if fetch fail', async () => {
      mockCompanyProfileModel.findByPk.mockRejectedValue(new Error());

      await expect(repository.findOneById('id')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('create', () => {
    const createCompanyProfile: CreateCompanyProfileDTO = companyProfiles[0];

    it('should create a new company profile', async () => {
      mockCompanyProfileModel.create.mockResolvedValue(companyProfileModels[0]);

      const result = await repository.create(createCompanyProfile);
      expect(result).toEqual(companyProfiles[0]);
      expect(mockCompanyProfileModel.create).toHaveBeenCalledWith(
        companyProfiles[0],
      );
    });

    it('should throw InternalServerErrorException if create fails', async () => {
      mockCompanyProfileModel.create.mockRejectedValue(new Error());

      await expect(repository.create(createCompanyProfile)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('update', () => {
    const updateData: UpdateCompanyProfileDTO = {
      avatar: 'https://picsum.photos/200/400',
    };

    it('should update a company profile', async () => {
      companyProfileModels[0].update = jest.fn().mockResolvedValue({
        ...companyProfileModels[0],
        ...updateData,
      });

      mockCompanyProfileModel.findByPk.mockResolvedValue(
        companyProfileModels[0],
      );

      const result = await repository.update(
        companyProfiles[0].userId,
        updateData,
      );
      expect(result).toEqual(companyProfiles[0]);
      expect(mockCompanyProfileModel.findByPk).toHaveBeenCalledWith(
        companyProfiles[0].userId,
        { transaction: undefined },
      );
      expect(companyProfileModels[0].update).toHaveBeenCalledWith(updateData, {
        transaction: undefined,
      });
    });

    it("should throw NotFoundException if user doesn't exists", async () => {
      mockCompanyProfileModel.findByPk.mockResolvedValue(null);

      await expect(
        repository.update(companyProfiles[0].userId, updateData),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw InternalServerErrorException if fetch fails', async () => {
      mockCompanyProfileModel.findByPk.mockRejectedValue(new Error());

      await expect(
        repository.update(companyProfiles[0].userId, updateData),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should throw InternalServerErrorException if update fails', async () => {
      mockCompanyProfileModel.findByPk.mockResolvedValue(
        companyProfileModels[0],
      );
      mockCompanyProfileModel.update.mockRejectedValue(new Error());

      await expect(
        repository.update(companyProfiles[0].userId, updateData),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('delete', () => {
    it('should delete a company profile', async () => {
      companyProfileModels[0].destroy = jest.fn().mockResolvedValue(true);
      mockCompanyProfileModel.findByPk.mockResolvedValue(
        companyProfileModels[0],
      );

      const result = await repository.delete(companyProfiles[0].userId);
      expect(result).toEqual(true);
      expect(companyProfileModels[0].destroy).toHaveBeenCalled();
    });

    it("should throw NotFoundException if user doesn't exists", async () => {
      mockCompanyProfileModel.findByPk.mockResolvedValue(null);

      await expect(
        repository.delete(companyProfiles[0].userId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw InternalServerErrorException if fetch fails', async () => {
      mockCompanyProfileModel.findByPk.mockRejectedValue(new Error());

      await expect(
        repository.delete(companyProfiles[0].userId),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should throw InternalServerErrorException if delete fails', async () => {
      mockCompanyProfileModel.findByPk.mockResolvedValue(
        companyProfileModels[0],
      );
      mockCompanyProfileModel.destroy.mockRejectedValue(new Error());

      await expect(
        repository.delete(companyProfiles[0].userId),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });
});
