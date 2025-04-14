import { plainToInstance } from 'class-transformer';
import {
  CreateApplicationDTO,
  ApplicationDTO,
  UpdateApplicationDTO,
} from '../dto/application.dto';
import { ApplicationsRepository } from './applications.repository';
import { ApplicationStatus } from '../dto/application-status.enum';
import { ApplicationModel } from './models/application.model';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

const applications: ApplicationDTO[] = [
  plainToInstance(ApplicationDTO, {
    id: 'e42cc25b-0cc4-4032-83c2-0d34c84318ba',
    userId: 'e69cc25b-0cc4-4032-83c2-0d34c84318ba',
    title: 'Application 1',
    description: 'Desc',
    createdAt: new Date(),
    updatedAt: new Date(),
    status: ApplicationStatus.NOT_OPENED,
    viewCount: 0,
  }),
  plainToInstance(ApplicationDTO, {
    id: 'e42cc25b-0cc4-4032-83c2-0d34c84318bb',
    userId: 'e69cc25b-0cc4-4032-83c2-0d34c84318bb',
    title: 'Application 2',
    description: 'Desc 2',
    createdAt: new Date(),
    updatedAt: new Date(),
    status: ApplicationStatus.PENDING,
    viewCount: 10,
  }),
];

describe('ApplicationsRepository', () => {
  let applicationsRepository: ApplicationsRepository;
  let mockApplicationModel: any;

  beforeEach(async () => {
    mockApplicationModel = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      findByPk: jest.fn(),
      update: jest.fn(),
      destroy: jest.fn(),
      toApplicationDTO: jest.fn(),
      sequelize: {
        transaction: jest.fn((transaction) => transaction()),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationsRepository,
        {
          provide: getModelToken(ApplicationModel),
          useValue: mockApplicationModel,
        },
      ],
    }).compile();

    applicationsRepository = module.get<ApplicationsRepository>(
      ApplicationsRepository,
    );
  });

  it('should be defined', () => {
    expect(applicationsRepository).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all applications', async () => {
      const applicationModels: ApplicationModel[] = applications.map(
        (application) => ({
          ...application,
          ...mockApplicationModel,
          toApplicationDTO: jest
            .fn()
            .mockReturnValue(plainToInstance(ApplicationDTO, application)),
        }),
      );
      mockApplicationModel.findAll.mockResolvedValue(applicationModels);

      const result = await applicationsRepository.findAll();
      expect(result).toEqual(applications);
    });

    it('should return an empty list if there is no application', async () => {});
  });

  describe('findOneById', () => {
    it('should return an application by ID', async () => {
      const applicationId = applications[0].id;
      const expectedApplication: ApplicationDTO = applications[0];
      const applicationModel: ApplicationModel = {
        ...applications[0],
        ...mockApplicationModel,
        toApplicationDTO: jest.fn().mockResolvedValue(expectedApplication),
      };

      mockApplicationModel.findByPk.mockResolvedValue(applicationModel);

      const result = await applicationsRepository.findOneById(applicationId);
      expect(result).toEqual(expectedApplication);
      expect(mockApplicationModel.findByPk).toHaveBeenCalledWith(applicationId);
    });

    it("should throw NotFoundException if the application don't exists", async () => {
      const applicationId = 'bad id';

      mockApplicationModel.findByPk.mockResolvedValue(null);

      await expect(
        applicationsRepository.findOneById(applicationId),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(mockApplicationModel.findByPk).toHaveBeenCalledWith(applicationId);
    });
  });

  describe('createApplication', () => {
    it('should create an application', async () => {
      const createApplication: CreateApplicationDTO = plainToInstance(
        CreateApplicationDTO,
        applications[0],
        {
          excludeExtraneousValues: true,
        },
      );
      const expectedApplication: ApplicationDTO = applications[0];
      const applicationModel: ApplicationModel = {
        ...applications[0],
        ...mockApplicationModel,
        toApplicationDTO: jest.fn().mockResolvedValue(expectedApplication),
      };

      mockApplicationModel.create.mockResolvedValue(applicationModel);

      const result = await applicationsRepository.create(createApplication);
      expect(result).toEqual(expectedApplication);
      expect(mockApplicationModel.create).toHaveBeenCalledWith(
        createApplication,
      );
    });

    it('should throw InternalServerErrorException if create fails', async () => {
      const createApplication: CreateApplicationDTO = plainToInstance(
        CreateApplicationDTO,
        applications[0],
        {
          excludeExtraneousValues: true,
        },
      );

      mockApplicationModel.create.mockResolvedValue(null);

      await expect(
        applicationsRepository.create(createApplication),
      ).rejects.toThrow(InternalServerErrorException);
      expect(mockApplicationModel.create).toHaveBeenCalledWith(
        createApplication,
      );
    });
  });

  describe('updateApplication', () => {
    it('should update an application', async () => {
      const updateData: UpdateApplicationDTO = {
        status: ApplicationStatus.ACCEPTED,
      };
      const expectedApplication: ApplicationDTO = applications[0];
      const applicationModel: ApplicationModel = {
        ...applications[0],
        ...mockApplicationModel,
        toApplicationDTO: jest.fn().mockResolvedValue(expectedApplication),
      };
      applicationModel.update = jest.fn().mockResolvedValue({
        ...applicationModel,
        ...updateData,
      });

      mockApplicationModel.findByPk.mockResolvedValue(applicationModel);

      const result = await applicationsRepository.update(
        applications[0].id,
        updateData,
      );
      expect(result).toEqual(expectedApplication);
      expect(mockApplicationModel.findByPk).toHaveBeenCalledWith(
        applications[0].id,
        {
          transaction: undefined,
        },
      );
      expect(applicationModel.update).toHaveBeenCalledWith(
        {
          ...updateData,
        },
        { transaction: undefined },
      );
    });

    it('should throw InternalServerErrorException if update fails', async () => {});
  });

  describe('deleteApplication', () => {
    it('should delete an application', async () => {
      const applicationId = '8aec0948-58dd-40b2-b085-5a47244036c2';
      const expectedApplication: ApplicationDTO = new ApplicationDTO(
        applications[0],
      );
      const applicationModel: ApplicationModel = {
        ...applications[0],
        ...mockApplicationModel,
        toApplicationDTO: jest.fn().mockResolvedValue(expectedApplication),
      };
      applicationModel.destroy = jest.fn().mockResolvedValue(true);

      mockApplicationModel.findByPk.mockResolvedValue(applicationModel);

      const result = await applicationsRepository.delete(applicationId);
      expect(result).toEqual(true);
      expect(applicationModel.destroy).toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException if delete fails', async () => {});
  });
});
