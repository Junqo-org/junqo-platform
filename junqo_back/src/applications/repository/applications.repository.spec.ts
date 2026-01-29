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
import { StudentProfileDTO } from '../../student-profiles/dto/student-profile.dto';
import { CompanyProfileDTO } from '../../company-profiles/dto/company-profile.dto';
import { OfferDTO } from '../../offers/dto/offer.dto';
import { StudentProfileModel } from '../../student-profiles/repository/models/student-profile.model';
import { CompanyProfileModel } from '../../company-profiles/repository/models/company-profile.model';
import { OfferModel } from '../../offers/repository/models/offer.model';

const applications: ApplicationDTO[] = [
  plainToInstance(ApplicationDTO, {
    id: 'a42cc25b-0cc4-4032-83c2-0d34c84318ba',
    studentId: 's69cc25b-0cc4-4032-83c2-0d34c84318ba',
    companyId: '69cc25b-0cc4-4032-83c2-0d34c84318ba',
    offerId: 'e69cc25b-0cc4-4032-83c2-0d34c84318ba',
    createdAt: new Date(),
    updatedAt: new Date(),
    status: ApplicationStatus.NOT_OPENED,
    student: plainToInstance(StudentProfileDTO, {
      id: 's69cc25b-0cc4-4032-83c2-0d34c84318ba',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
    }),
    company: plainToInstance(CompanyProfileDTO, {
      id: '69cc25b-0cc4-4032-83c2-0d34c84318ba',
      name: 'Test Company',
      email: 'contact@testcompany.com',
    }),
    offer: plainToInstance(OfferDTO, {
      id: 'e69cc25b-0cc4-4032-83c2-0d34c84318ba',
      title: 'Software Engineer',
      description: 'Test position',
    }),
  }),
  plainToInstance(ApplicationDTO, {
    id: 'a42cc25b-0cc4-4032-83c2-0d34c84318bb',
    studentId: 's69cc25b-0cc4-4032-83c2-0d34c84318bb',
    companyId: 'c9cc25b-0cc4-4032-83c2-0d34c84318bb',
    offerId: 'o69cc25b-0cc4-4032-83c2-0d34c84318bb',
    createdAt: new Date(),
    updatedAt: new Date(),
    status: ApplicationStatus.PENDING,
    student: plainToInstance(StudentProfileDTO, {
      id: 's69cc25b-0cc4-4032-83c2-0d34c84318bb',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
    }),
    company: plainToInstance(CompanyProfileDTO, {
      id: 'c9cc25b-0cc4-4032-83c2-0d34c84318bb',
      name: 'Another Company',
      email: 'contact@anothercompany.com',
    }),
    offer: plainToInstance(OfferDTO, {
      id: 'o69cc25b-0cc4-4032-83c2-0d34c84318bb',
      title: 'Full Stack Developer',
      description: 'Another test position',
    }),
  }),
];

const includeOption = {
  include: [StudentProfileModel, CompanyProfileModel, OfferModel],
};

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

    it('should throw NotFoundException if there is no application', async () => {
      mockApplicationModel.findAll.mockResolvedValue([]);

      await expect(applicationsRepository.findAll()).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(mockApplicationModel.findAll).toHaveBeenCalledWith(includeOption);
    });
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
      expect(mockApplicationModel.findByPk).toHaveBeenCalledWith(
        applicationId,
        includeOption,
      );
    });

    it("should throw NotFoundException if the application don't exists", async () => {
      const applicationId = 'bad id';

      mockApplicationModel.findByPk.mockResolvedValue(null);

      await expect(
        applicationsRepository.findOneById(applicationId),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(mockApplicationModel.findByPk).toHaveBeenCalledWith(
        applicationId,
        includeOption,
      );
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
        includeOption,
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
        includeOption,
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
      const updatedModel = {
        ...applicationModel,
        ...updateData,
        reload: jest.fn().mockResolvedValue(undefined),
      };
      applicationModel.update = jest.fn().mockResolvedValue(updatedModel);

      mockApplicationModel.findByPk.mockResolvedValue(applicationModel);

      const result = await applicationsRepository.update(
        applications[0].id,
        updateData,
      );
      expect(result).toEqual(expectedApplication);
      expect(mockApplicationModel.findByPk).toHaveBeenCalledWith(
        applications[0].id,
        {
          ...includeOption,
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

    it('should throw InternalServerErrorException if update fails', async () => {
      const updateData: UpdateApplicationDTO = {
        status: ApplicationStatus.ACCEPTED,
      };
      const applicationId = applications[0].id;
      const applicationModel: ApplicationModel = {
        ...applications[0],
        ...mockApplicationModel,
        update: jest.fn().mockRejectedValue(new Error('Update failed')),
      };

      mockApplicationModel.findByPk.mockResolvedValue(applicationModel);

      await expect(
        applicationsRepository.update(applicationId, updateData),
      ).rejects.toThrow(InternalServerErrorException);

      expect(mockApplicationModel.findByPk).toHaveBeenCalledWith(
        applicationId,
        {
          ...includeOption,
          transaction: undefined,
        },
      );
    });
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
