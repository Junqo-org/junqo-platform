import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import {
  CreateSchoolProfileDTO,
  SchoolProfileDTO,
  UpdateSchoolProfileDTO,
} from '../dto/school-profile.dto';
import { SchoolProfilesRepository } from './school-profiles.repository';
import { SchoolProfileModel } from './models/school-profile.model';
import { plainToInstance } from 'class-transformer';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { SchoolProfileQueryDTO } from '../dto/school-profile-query.dto';

const schoolProfiles: SchoolProfileDTO[] = [
  new SchoolProfileDTO({
    userId: '8aec0948-58dd-40b2-b085-5a47244036c2',
    name: 'Test User',
    avatar: 'https://picsum.photos/200/300',
    description: 'Test User school profile',
  websiteUrl: 'https://junqo.fr',
  }),
  new SchoolProfileDTO({
    userId: '8aec0948-58dd-40b2-b085-5a47244036c2',
    name: 'Test User',
    avatar: 'https://picsum.photos/200/300',
    description: 'Test User school profile',
  websiteUrl: 'https://junqo.fr',
  }),
];

let schoolProfileModels: SchoolProfileModel[] = [];

describe('SchoolProfilesRepository', () => {
  let repository: SchoolProfilesRepository;
  let mockSchoolProfileModel: any;

  beforeEach(async () => {
    mockSchoolProfileModel = {
      create: jest.fn(),
      findAndCountAll: jest.fn(),
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
      ],
    }).compile();

    repository = module.get<SchoolProfilesRepository>(SchoolProfilesRepository);

    schoolProfileModels = schoolProfiles.map((profile) => ({
      ...profile,
      ...mockSchoolProfileModel,
      toSchoolProfileDTO: jest.fn().mockReturnValue(profile),
    }));
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findByQuery', () => {
    const query: SchoolProfileQueryDTO = plainToInstance(
      SchoolProfileQueryDTO,
      {
        page: 1,
        limit: 1,
      },
    );

    it('should return all school profiles if no query', async () => {
      mockSchoolProfileModel.findAndCountAll.mockResolvedValue({
        rows: schoolProfileModels,
        count: schoolProfileModels.length,
      });

      const result = await repository.findByQuery({});
      expect(result).toEqual({
        rows: schoolProfiles,
        count: schoolProfiles.length,
      });
      expect(mockSchoolProfileModel.findAndCountAll).toHaveBeenCalled();
    });

    it('should find every school profile corresponding to given query', async () => {
      mockSchoolProfileModel.findAndCountAll.mockResolvedValue({
        rows: schoolProfileModels,
        count: schoolProfileModels.length,
      });

      const result = await repository.findByQuery(query);
      expect(result).toEqual({
        rows: schoolProfiles,
        count: schoolProfiles.length,
      });
      expect(mockSchoolProfileModel.findAndCountAll).toHaveBeenCalled();
    });

    it('should throw NotFoundException if there is no school profile', async () => {
      mockSchoolProfileModel.findAndCountAll.mockResolvedValue({
        rows: [],
        count: 0,
      });

      await expect(repository.findByQuery(query)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw InternalServerErrorException if fetch fail', async () => {
      mockSchoolProfileModel.findAndCountAll.mockRejectedValue(new Error());

      await expect(repository.findByQuery(query)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findOneById', () => {
    it('should find one school profile by userId', async () => {
      const userId = schoolProfiles[0].userId;

      mockSchoolProfileModel.findByPk.mockResolvedValue(schoolProfileModels[0]);

      const result = await repository.findOneById(userId);
      expect(result).toEqual(schoolProfiles[0]);
      expect(mockSchoolProfileModel.findByPk).toHaveBeenCalledWith(userId);
    });

    it("should throw NotFoundException if the school profile doesn't exists", async () => {
      mockSchoolProfileModel.findByPk.mockResolvedValue(null);

      await expect(repository.findOneById('id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw InternalServerErrorException if fetch fail', async () => {
      mockSchoolProfileModel.findByPk.mockRejectedValue(new Error());

      await expect(repository.findOneById('id')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('create', () => {
    const createSchoolProfile: CreateSchoolProfileDTO = schoolProfiles[0];

    it('should create a new school profile', async () => {
      mockSchoolProfileModel.create.mockResolvedValue(schoolProfileModels[0]);

      const result = await repository.create(createSchoolProfile);
      expect(result).toEqual(schoolProfiles[0]);
      expect(mockSchoolProfileModel.create).toHaveBeenCalledWith(
        schoolProfiles[0],
      );
    });

    it('should throw InternalServerErrorException if create fails', async () => {
      mockSchoolProfileModel.create.mockRejectedValue(new Error());

      await expect(repository.create(createSchoolProfile)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('update', () => {
    const updateData: UpdateSchoolProfileDTO = {
      avatar: 'https://picsum.photos/200/400',
    };

    it('should update a school profile', async () => {
      schoolProfileModels[0].update = jest.fn().mockResolvedValue({
        ...schoolProfileModels[0],
        ...updateData,
      });

      mockSchoolProfileModel.findByPk.mockResolvedValue(schoolProfileModels[0]);

      const result = await repository.update(
        schoolProfiles[0].userId,
        updateData,
      );
      expect(result).toEqual(schoolProfiles[0]);
      expect(mockSchoolProfileModel.findByPk).toHaveBeenCalledWith(
        schoolProfiles[0].userId,
        { transaction: undefined },
      );
      expect(schoolProfileModels[0].update).toHaveBeenCalledWith(updateData, {
        transaction: undefined,
      });
    });

    it("should throw NotFoundException if user doesn't exists", async () => {
      mockSchoolProfileModel.findByPk.mockResolvedValue(null);

      await expect(
        repository.update(schoolProfiles[0].userId, updateData),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw InternalServerErrorException if fetch fails', async () => {
      mockSchoolProfileModel.findByPk.mockRejectedValue(new Error());

      await expect(
        repository.update(schoolProfiles[0].userId, updateData),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should throw InternalServerErrorException if update fails', async () => {
      mockSchoolProfileModel.findByPk.mockResolvedValue(schoolProfileModels[0]);
      mockSchoolProfileModel.update.mockRejectedValue(new Error());

      await expect(
        repository.update(schoolProfiles[0].userId, updateData),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('delete', () => {
    it('should delete a school profile', async () => {
      schoolProfileModels[0].destroy = jest.fn().mockResolvedValue(true);
      mockSchoolProfileModel.findByPk.mockResolvedValue(schoolProfileModels[0]);

      const result = await repository.delete(schoolProfiles[0].userId);
      expect(result).toEqual(true);
      expect(schoolProfileModels[0].destroy).toHaveBeenCalled();
    });

    it("should throw NotFoundException if user doesn't exists", async () => {
      mockSchoolProfileModel.findByPk.mockResolvedValue(null);

      await expect(repository.delete(schoolProfiles[0].userId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw InternalServerErrorException if fetch fails', async () => {
      mockSchoolProfileModel.findByPk.mockRejectedValue(new Error());

      await expect(repository.delete(schoolProfiles[0].userId)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should throw InternalServerErrorException if delete fails', async () => {
      mockSchoolProfileModel.findByPk.mockResolvedValue(schoolProfileModels[0]);
      mockSchoolProfileModel.destroy.mockRejectedValue(new Error());

      await expect(repository.delete(schoolProfiles[0].userId)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
