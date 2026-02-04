import { TestBed } from '@suites/unit';
import { ApplicationsService } from './applications.service';
import { ApplicationsRepository } from './repository/applications.repository';
import { Actions, CaslAbilityFactory } from '../casl/casl-ability.factory';
import {
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { AuthUserDTO } from '../shared/dto/auth-user.dto';
import {
  ApplicationDTO,
  CreateApplicationDTO,
  UpdateApplicationDTO,
} from './dto/application.dto';
import { UserType } from '../users/dto/user-type.enum';
import { plainToInstance } from 'class-transformer';
import { Mocked } from '@suites/doubles.jest';
import { ApplicationResource } from '../casl/dto/application-resource.dto';
import { ApplicationStatus } from './dto/application-status.enum';
import { ApplicationQueryDTO } from './dto/application-query.dto';
import { OffersService } from '../offers/offers.service';
import { OfferDTO } from '../offers/dto/offer.dto';
import { OfferStatus } from '../offers/dto/offer-status.enum';
import { ConversationsService } from '../conversations/conversations.service';
import {
  CreateConversationDTO,
  ConversationDTO,
} from '../conversations/dto/conversation.dto';
import { StudentProfileDTO } from '../student-profiles/dto/student-profile.dto';
import { CompanyProfileDTO } from '../company-profiles/dto/company-profile.dto';
import { PreAcceptApplicationDTO } from './dto/pre-accept-application.dto';
import { StudentProfilesService } from '../student-profiles/student-profiles.service';

const currentUser: AuthUserDTO = plainToInstance(AuthUserDTO, {
  id: 'e69cc25b-0cc4-4032-83c2-0d34c84318ba',
  type: UserType.COMPANY,
  name: 'test user',
  email: 'test@mail.com',
});

const applications: ApplicationDTO[] = [
  new ApplicationDTO({
    id: 'a1ec0948-58dd-40b2-b085-5a47244036c2',
    studentId: currentUser.id,
    companyId: 'c19cc25b-0cc4-4032-83c2-0d34c84318ba',
    offerId: 'o19cc25b-0cc4-4032-83c2-0d34c84318ba',
    status: ApplicationStatus.NOT_OPENED,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-02T00:00:00Z'),
    student: plainToInstance(StudentProfileDTO, {
      id: currentUser.id,
      userId: currentUser.id,
      firstName: 'Student',
      lastName: 'User',
      name: 'Student',
    }),
    company: plainToInstance(CompanyProfileDTO, {
      id: 'c19cc25b-0cc4-4032-83c2-0d34c84318ba',
      userId: 'c19cc25b-0cc4-4032-83c2-0d34c84318ba',
      name: 'Company',
    }),
    offer: plainToInstance(OfferDTO, {
      id: 'o19cc25b-0cc4-4032-83c2-0d34c84318ba',
      title: 'Offer',
    }),
  }),
  new ApplicationDTO({
    id: 'a2ec0948-58dd-40b2-b085-5a47244036c2',
    studentId: 's29cc25b-0cc4-4032-83c2-0d34c84318ba',
    companyId: 'c29cc25b-0cc4-4032-83c2-0d34c84318ba',
    offerId: 'o29cc25b-0cc4-4032-83c2-0d34c84318ba',
    status: ApplicationStatus.PENDING,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-02T00:00:00Z'),
  }),
];

const offers: OfferDTO[] = [
  plainToInstance(OfferDTO, {
    id: 'o19cc25b-0cc4-4032-83c2-0d34c84318ba',
    userId: 'c19cc25b-0cc4-4032-83c2-0d34c84318ba',
    title: 'Offer 1',
    description: 'Desc',
    createdAt: new Date(),
    updatedAt: new Date(),
    status: OfferStatus.ACTIVE,
    viewCount: 0,
  }),
  plainToInstance(OfferDTO, {
    id: 'o29cc25b-0cc4-4032-83c2-0d34c84318ba',
    userId: 'c29cc25b-0cc4-4032-83c2-0d34c84318ba',
    title: 'Offer 2',
    description: 'Desc 2',
    createdAt: new Date(),
    updatedAt: new Date(),
    status: OfferStatus.INACTIVE,
    viewCount: 10,
  }),
];

describe('ApplicationsService', () => {
  let applicationsService: ApplicationsService;
  let offersService: Mocked<OffersService>;
  let conversationsService: Mocked<ConversationsService>;
  let studentProfileService: Mocked<StudentProfilesService>;
  let applicationsRepository: Mocked<ApplicationsRepository>;
  let caslAbilityFactory: Mocked<CaslAbilityFactory>;
  let canMockFn: jest.Mock;
  let cannotMockFn: jest.Mock;
  let canMockFnRev: jest.Mock;
  let cannotMockFnRev: jest.Mock;

  beforeEach(async () => {
    canMockFn = jest.fn().mockReturnValue(true);
    cannotMockFn = jest.fn().mockReturnValue(false);
    canMockFnRev = jest.fn().mockReturnValue(false);
    cannotMockFnRev = jest.fn().mockReturnValue(true);

    const mockCaslAbilityFactory = () => ({
      createForUser: jest.fn(() => {
        const ability = {
          can: canMockFn,
          cannot: cannotMockFn,
        };
        return ability;
      }),
    });

    const { unit, unitRef } = await TestBed.solitary(ApplicationsService)
      .mock(CaslAbilityFactory)
      .impl(mockCaslAbilityFactory)
      .compile();

    applicationsService = unit;
    offersService = unitRef.get(OffersService);
    conversationsService = unitRef.get(ConversationsService);
    studentProfileService = unitRef.get(StudentProfilesService);
    applicationsRepository = unitRef.get(ApplicationsRepository);
    caslAbilityFactory = unitRef.get(CaslAbilityFactory);
  });

  it('should be defined', () => {
    expect(applicationsService).toBeDefined();
  });

  describe('findByQuery', () => {
    const query: ApplicationQueryDTO = {
      studentId: currentUser.id,
      companyId: 'c19cc25b-0cc4-4032-83c2-0d34c84318ba',
      offerId: 'o19cc25b-0cc4-4032-83c2-0d34c84318ba',
      status: ApplicationStatus.NOT_OPENED,
      offset: 0,
      limit: 10,
    };

    it('should return all applications', async () => {
      const expectedOutput = {
        rows: applications,
        count: applications.length,
      };
      applicationsRepository.findByQuery.mockResolvedValue(expectedOutput);

      const result = await applicationsService.findByQuery(currentUser, query);
      expect(result).toBe(expectedOutput);
      expect(applicationsRepository.findByQuery).toHaveBeenCalled();
      expect(caslAbilityFactory.createForUser).toHaveBeenCalledWith(
        currentUser,
      );
      expect(cannotMockFn).toHaveBeenLastCalledWith(
        Actions.READ,
        plainToInstance(
          ApplicationResource,
          applications[applications.length - 1],
        ),
      );
    });

    it('should throw NotFoundException if there is no application', async () => {
      const expectedOutput = {
        rows: [],
        count: 0,
      };
      applicationsRepository.findByQuery.mockResolvedValue(expectedOutput);

      await expect(
        applicationsService.findByQuery(currentUser, query),
      ).rejects.toThrow(NotFoundException);
      expect(applicationsRepository.findByQuery).toHaveBeenCalled();
      expect(caslAbilityFactory.createForUser).toHaveBeenCalledWith(
        currentUser,
      );
    });

    it('should throw ForbiddenException if user cannot read application', async () => {
      const expectedOutput = {
        rows: applications,
        count: applications.length,
      };
      applicationsRepository.findByQuery.mockResolvedValue(expectedOutput);
      caslAbilityFactory.createForUser.mockImplementationOnce(
        caslAbilityFactory.createForUser,
      );
      caslAbilityFactory.createForUser.mockImplementationOnce(
        jest.fn().mockReturnValue({
          can: canMockFnRev,
          cannot: cannotMockFnRev,
        }),
      );

      await expect(
        applicationsService.findByQuery(currentUser, query),
      ).rejects.toThrow(ForbiddenException);
      expect(caslAbilityFactory.createForUser).toHaveBeenCalledWith(
        currentUser,
      );
      expect(cannotMockFnRev).toHaveBeenLastCalledWith(
        Actions.READ,
        plainToInstance(ApplicationResource, applications[0]),
      );
    });
  });

  describe('findByCompanyId', () => {
    it('should return all applications', async () => {
      applicationsRepository.findByCompanyId.mockResolvedValue(applications);

      const result = await applicationsService.findByCompanyId(
        currentUser,
        applications[0].companyId,
      );
      expect(result).toBe(applications);
      expect(applicationsRepository.findByCompanyId).toHaveBeenCalled();
      expect(caslAbilityFactory.createForUser).toHaveBeenCalledWith(
        currentUser,
      );
      expect(cannotMockFn).toHaveBeenLastCalledWith(
        Actions.READ,
        plainToInstance(ApplicationResource, {
          companyId: applications[0].companyId,
        }),
      );
    });

    it('should throw NotFoundException if there is no application', async () => {
      applicationsRepository.findByCompanyId.mockResolvedValue([]);

      await expect(
        applicationsService.findByCompanyId(
          currentUser,
          applications[0].companyId,
        ),
      ).rejects.toThrow(NotFoundException);
      expect(applicationsRepository.findByCompanyId).toHaveBeenCalled();
      expect(caslAbilityFactory.createForUser).toHaveBeenCalledWith(
        currentUser,
      );
      expect(cannotMockFn).toHaveBeenLastCalledWith(
        Actions.READ,
        plainToInstance(ApplicationResource, {
          companyId: applications[0].companyId,
        }),
      );
    });

    it('should throw ForbiddenException if user cannot read application', async () => {
      applicationsRepository.findByCompanyId.mockResolvedValue(applications);
      caslAbilityFactory.createForUser.mockImplementationOnce(
        caslAbilityFactory.createForUser,
      );
      caslAbilityFactory.createForUser.mockImplementationOnce(
        jest.fn().mockReturnValue({
          can: canMockFnRev,
          cannot: cannotMockFnRev,
        }),
      );

      await expect(
        applicationsService.findByCompanyId(
          currentUser,
          applications[0].companyId,
        ),
      ).rejects.toThrow(ForbiddenException);
      expect(caslAbilityFactory.createForUser).toHaveBeenCalledWith(
        currentUser,
      );
      expect(cannotMockFnRev).toHaveBeenLastCalledWith(
        Actions.READ,
        plainToInstance(ApplicationResource, {
          companyId: applications[0].companyId,
        }),
      );
    });
  });

  describe('findByStudentId', () => {
    it('should return all applications', async () => {
      applicationsRepository.findByStudentId.mockResolvedValue(applications);

      const result = await applicationsService.findByStudentId(
        currentUser,
        applications[0].studentId,
      );
      expect(result).toBe(applications);
      expect(applicationsRepository.findByStudentId).toHaveBeenCalled();
      expect(caslAbilityFactory.createForUser).toHaveBeenCalledWith(
        currentUser,
      );
      expect(cannotMockFn).toHaveBeenLastCalledWith(
        Actions.READ,
        plainToInstance(ApplicationResource, {
          studentId: applications[0].studentId,
        }),
      );
    });

    it('should throw NotFoundException if there is no application', async () => {
      applicationsRepository.findByStudentId.mockResolvedValue([]);

      await expect(
        applicationsService.findByStudentId(
          currentUser,
          applications[0].studentId,
        ),
      ).rejects.toThrow(NotFoundException);
      expect(applicationsRepository.findByStudentId).toHaveBeenCalled();
      expect(caslAbilityFactory.createForUser).toHaveBeenCalledWith(
        currentUser,
      );
      expect(cannotMockFn).toHaveBeenLastCalledWith(
        Actions.READ,
        plainToInstance(ApplicationResource, {
          studentId: applications[0].studentId,
        }),
      );
    });

    it('should throw ForbiddenException if user cannot read application', async () => {
      applicationsRepository.findByStudentId.mockResolvedValue(applications);
      caslAbilityFactory.createForUser.mockImplementationOnce(
        caslAbilityFactory.createForUser,
      );
      caslAbilityFactory.createForUser.mockImplementationOnce(
        jest.fn().mockReturnValue({
          can: canMockFnRev,
          cannot: cannotMockFnRev,
        }),
      );

      await expect(
        applicationsService.findByStudentId(
          currentUser,
          applications[0].studentId,
        ),
      ).rejects.toThrow(ForbiddenException);
      expect(caslAbilityFactory.createForUser).toHaveBeenCalledWith(
        currentUser,
      );
      expect(cannotMockFnRev).toHaveBeenLastCalledWith(
        Actions.READ,
        plainToInstance(ApplicationResource, {
          studentId: applications[0].studentId,
        }),
      );
    });
  });

  describe('findOneById', () => {
    it('should return an application by ID', async () => {
      applicationsRepository.findOneById.mockResolvedValue(applications[0]);

      const result = await applicationsService.findOneById(
        currentUser,
        applications[0].id,
      );
      expect(result).toBe(applications[0]);
      expect(applicationsRepository.findOneById).toHaveBeenCalledWith(
        applications[0].id,
      );
      expect(caslAbilityFactory.createForUser).toHaveBeenCalledWith(
        currentUser,
      );
      expect(cannotMockFn).toHaveBeenLastCalledWith(
        Actions.READ,
        plainToInstance(ApplicationResource, applications[0], {
          excludeExtraneousValues: true,
        }),
      );
    });

    it("should throw NotFoundException if the application don't exists", async () => {
      applicationsRepository.findOneById.mockRejectedValueOnce(
        new NotFoundException(),
      );

      await expect(
        applicationsService.findOneById(currentUser, applications[0].id),
      ).rejects.toThrow(NotFoundException);
      expect(applicationsRepository.findOneById).toHaveBeenCalled();
    });

    it('should throw ForbiddenException if user cannot read application', async () => {
      applicationsRepository.findOneById.mockResolvedValue(applications[0]);
      caslAbilityFactory.createForUser.mockImplementationOnce(
        caslAbilityFactory.createForUser,
      );
      caslAbilityFactory.createForUser.mockImplementationOnce(
        jest.fn().mockReturnValue({
          can: canMockFnRev,
          cannot: cannotMockFnRev,
        }),
      );

      await expect(
        applicationsService.findOneById(currentUser, applications[0].id),
      ).rejects.toThrow(ForbiddenException);
      expect(caslAbilityFactory.createForUser).toHaveBeenCalledWith(
        currentUser,
      );
      expect(cannotMockFnRev).toHaveBeenLastCalledWith(
        Actions.READ,
        plainToInstance(ApplicationResource, applications[0], {
          excludeExtraneousValues: true,
        }),
      );
    });
  });

  describe('create', () => {
    it('should create an application', async () => {
      const createInput: CreateApplicationDTO = plainToInstance(
        CreateApplicationDTO,
        applications[0],
        { excludeExtraneousValues: true },
      );

      offersService.findOneById.mockResolvedValue(offers[0]);
      applicationsRepository.findByQuery.mockResolvedValue({
        rows: [],
        count: 0,
      });
      applicationsRepository.create.mockResolvedValue(applications[0]);

      const result = await applicationsService.create(
        currentUser,
        applications[0].offerId,
      );
      expect(result).toBe(applications[0]);
      expect(applicationsRepository.create).toHaveBeenCalledWith(createInput);
      expect(caslAbilityFactory.createForUser).toHaveBeenCalledWith(
        currentUser,
      );
      expect(cannotMockFn).toHaveBeenLastCalledWith(
        Actions.CREATE,
        plainToInstance(
          ApplicationResource,
          { studentId: applications[0].studentId },
          {
            excludeExtraneousValues: true,
          },
        ),
      );
    });

    it('should throw ForbiddenException if user cannot create application', async () => {
      offersService.findOneById.mockResolvedValue(offers[0]);
      applicationsRepository.create.mockResolvedValue(applications[0]);
      caslAbilityFactory.createForUser.mockImplementationOnce(
        caslAbilityFactory.createForUser,
      );
      caslAbilityFactory.createForUser.mockImplementationOnce(
        jest.fn().mockReturnValue({
          can: canMockFnRev,
          cannot: cannotMockFnRev,
        }),
      );

      await expect(
        applicationsService.create(currentUser, applications[0].offerId),
      ).rejects.toThrow(ForbiddenException);
      expect(caslAbilityFactory.createForUser).toHaveBeenCalledWith(
        currentUser,
      );
      expect(cannotMockFnRev).toHaveBeenLastCalledWith(
        Actions.CREATE,
        plainToInstance(
          ApplicationResource,
          { studentId: applications[0].studentId },
          {
            excludeExtraneousValues: true,
          },
        ),
      );
    });

    it('should throw InternalServerErrorException if create fails', async () => {
      offersService.findOneById.mockResolvedValue(offers[0]);
      applicationsRepository.create.mockRejectedValue(new Error());

      await expect(
        applicationsService.create(currentUser, applications[0].offerId),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it("should throw NotFoundException if application doesn't exist", async () => {
      offersService.findOneById.mockRejectedValue(new NotFoundException());

      await expect(
        applicationsService.create(currentUser, applications[0].offerId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update an application', async () => {
      const newData = {
        title: 'new title',
        status: ApplicationStatus.ACCEPTED,
      };
      const updateInput: UpdateApplicationDTO = plainToInstance(
        UpdateApplicationDTO,
        newData,
        {
          excludeExtraneousValues: true,
        },
      );
      const expectedApplication: ApplicationDTO = plainToInstance(
        ApplicationDTO,
        {
          ...applications[0],
          ...newData,
        },
      );
      const createConversationDto: CreateConversationDTO = {
        participantsIds: [applications[0].studentId, applications[0].companyId],
        participantTitles: {
          [applications[0].studentId]:
            `${applications[0].offer?.title || 'Offer'} - ${applications[0].company?.name || 'Company'}`,
          [applications[0].companyId]:
            `${applications[0].offer?.title || 'Offer'} - ${applications[0].student?.name || 'Student'}`,
        },
        title: `Application Discussion - ${applications[0].offer?.title || 'Offer'}`,
        offerId: applications[0].offerId,
        applicationId: applications[0].id,
      };

      applicationsRepository.findOneById.mockResolvedValue(applications[0]);
      applicationsRepository.update.mockResolvedValue(expectedApplication);
      conversationsService.create.mockResolvedValue({
        id: 'conv-123',
        participantsIds: [applications[0].studentId, applications[0].companyId],
      } as ConversationDTO);

      const result = await applicationsService.update(
        currentUser,
        applications[0].id,
        updateInput,
      );
      expect(result).toBe(expectedApplication);
      expect(applicationsRepository.update).toHaveBeenCalledWith(
        applications[0].id,
        updateInput,
      );
      expect(conversationsService.create).toHaveBeenCalledWith(
        currentUser,
        createConversationDto,
      );
      expect(caslAbilityFactory.createForUser).toHaveBeenCalledWith(
        currentUser,
      );
      expect(cannotMockFn).toHaveBeenLastCalledWith(
        'update',
        plainToInstance(ApplicationResource, applications[0], {
          excludeExtraneousValues: true,
        }),
      );
    });

    it('should throw ForbiddenException if user cannot update application', async () => {
      const invalidCurrentUser = plainToInstance(AuthUserDTO, {
        ...currentUser,
        id: 'other user',
      });
      const newData = {
        title: 'new title',
      };
      const updateInput: UpdateApplicationDTO = plainToInstance(
        UpdateApplicationDTO,
        newData,
      );
      const expectedApplication: ApplicationDTO = plainToInstance(
        ApplicationDTO,
        {
          ...applications[0],
          ...newData,
        },
      );

      applicationsRepository.findOneById.mockResolvedValue(applications[0]);
      applicationsRepository.update.mockResolvedValue(expectedApplication);
      caslAbilityFactory.createForUser.mockImplementationOnce(
        caslAbilityFactory.createForUser,
      );
      caslAbilityFactory.createForUser.mockImplementationOnce(
        jest.fn().mockReturnValue({
          can: canMockFnRev,
          cannot: cannotMockFnRev,
        }),
      );

      await expect(
        applicationsService.update(
          invalidCurrentUser,
          applications[0].id,
          updateInput,
        ),
      ).rejects.toThrow(ForbiddenException);
      expect(caslAbilityFactory.createForUser).toHaveBeenCalledWith(
        invalidCurrentUser,
      );
      expect(cannotMockFnRev).toHaveBeenLastCalledWith(
        'update',
        plainToInstance(ApplicationResource, applications[0], {
          excludeExtraneousValues: true,
        }),
      );
    });

    it('should throw InternalServerErrorException if update fails', async () => {
      const newData = {
        title: 'new title',
      };
      const updateInput: UpdateApplicationDTO = plainToInstance(
        UpdateApplicationDTO,
        newData,
      );

      applicationsRepository.findOneById.mockResolvedValue(applications[0]);
      applicationsRepository.update.mockRejectedValue(new Error());

      await expect(
        applicationsService.update(
          currentUser,
          applications[0].id,
          updateInput,
        ),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('delete', () => {
    it('should delete an application', async () => {
      applicationsRepository.findOneById.mockResolvedValue(applications[0]);
      applicationsRepository.delete.mockResolvedValue(true);

      const result = await applicationsService.delete(
        currentUser,
        applications[0].id,
      );
      expect(result).toBe(true);
      expect(applicationsRepository.delete).toHaveBeenCalledWith(
        applications[0].id,
      );
      expect(caslAbilityFactory.createForUser).toHaveBeenCalledWith(
        currentUser,
      );
      expect(cannotMockFn).toHaveBeenLastCalledWith(
        Actions.DELETE,
        plainToInstance(ApplicationResource, applications[0], {
          excludeExtraneousValues: true,
        }),
      );
    });

    it('should throw ForbiddenException if user cannot read application', async () => {
      applicationsRepository.findOneById.mockResolvedValue(applications[0]);
      applicationsRepository.delete.mockResolvedValue(true);
      caslAbilityFactory.createForUser.mockImplementationOnce(
        caslAbilityFactory.createForUser,
      );
      caslAbilityFactory.createForUser.mockImplementationOnce(
        jest.fn().mockReturnValue({
          can: canMockFnRev,
          cannot: cannotMockFnRev,
        }),
      );

      await expect(
        applicationsService.delete(currentUser, applications[0].id),
      ).rejects.toThrow(ForbiddenException);
      expect(caslAbilityFactory.createForUser).toHaveBeenCalledWith(
        currentUser,
      );
      expect(cannotMockFnRev).toHaveBeenLastCalledWith(
        Actions.DELETE,
        plainToInstance(ApplicationResource, applications[0], {
          excludeExtraneousValues: true,
        }),
      );
    });

    it('should throw InternalServerErrorException if delete fails', async () => {
      applicationsRepository.findOneById.mockResolvedValue(applications[0]);
      applicationsRepository.delete.mockRejectedValue(new Error());

      await expect(
        applicationsService.delete(currentUser, applications[0].id),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should throw InternalServerErrorException if delete returns false', async () => {
      applicationsRepository.findOneById.mockResolvedValue(applications[0]);
      applicationsRepository.delete.mockResolvedValue(false);

      await expect(
        applicationsService.delete(currentUser, applications[0].id),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('preAccept', () => {
    const preAcceptDto: PreAcceptApplicationDTO = {
      offerId: 'o19cc25b-0cc4-4032-83c2-0d34c84318ba',
      studentId: 's19cc25b-0cc4-4032-83c2-0d34c84318ba',
    };

    const studentProfile = plainToInstance(StudentProfileDTO, {
      id: preAcceptDto.studentId,
      userId: preAcceptDto.studentId,
      firstName: 'Student',
      lastName: 'User',
      name: 'Student',
    });

    const offer = plainToInstance(OfferDTO, {
      id: preAcceptDto.offerId,
      userId: currentUser.id, // Offer belongs to current user (company)
      title: 'Offer',
      status: OfferStatus.ACTIVE,
    });

    it('should pre-accept a student (create new application)', async () => {
      offersService.findOneById.mockResolvedValue(offer);
      studentProfileService.findOneById.mockResolvedValue(studentProfile);
      applicationsRepository.findByQuery.mockResolvedValue({
        rows: [],
        count: 0,
      });

      const newApplication = plainToInstance(ApplicationDTO, {
        id: 'new-app-id',
        studentId: preAcceptDto.studentId,
        companyId: currentUser.id,
        offerId: preAcceptDto.offerId,
        status: ApplicationStatus.PRE_ACCEPTED,
      });

      applicationsRepository.create.mockResolvedValue(newApplication);

      // Setup ability to allow CREATE
      caslAbilityFactory.createForUser.mockReturnValue({
        can: jest.fn().mockReturnValue(true), // Allow create
        cannot: jest.fn().mockReturnValue(false),
      } as any);

      const result = await applicationsService.preAccept(
        currentUser,
        preAcceptDto,
      );

      expect(result).toBe(newApplication);
      expect(offersService.findOneById).toHaveBeenCalledWith(
        currentUser,
        preAcceptDto.offerId,
      );
      expect(studentProfileService.findOneById).toHaveBeenCalledWith(
        currentUser,
        preAcceptDto.studentId,
      );
      expect(applicationsRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          status: ApplicationStatus.PRE_ACCEPTED,
        }),
      );
    });

    it('should update existing application to PRE_ACCEPTED', async () => {
      offersService.findOneById.mockResolvedValue(offer);
      studentProfileService.findOneById.mockResolvedValue(studentProfile);

      const existingApplication = plainToInstance(ApplicationDTO, {
        id: 'existing-app-id',
        status: ApplicationStatus.PENDING,
        studentId: preAcceptDto.studentId,
        companyId: currentUser.id,
        offerId: preAcceptDto.offerId,
      });

      applicationsRepository.findByQuery.mockResolvedValue({
        rows: [existingApplication],
        count: 1,
      });

      const updatedApplication = {
        ...existingApplication,
        status: ApplicationStatus.PRE_ACCEPTED,
      };

      applicationsRepository.findOneById.mockResolvedValue(existingApplication);
      applicationsRepository.update.mockResolvedValue(updatedApplication);
      // Mock conversation creation which happens on update
      conversationsService.create.mockResolvedValue({} as any);

      // Setup ability to allow UPDATE
      caslAbilityFactory.createForUser.mockReturnValue({
        can: jest.fn().mockReturnValue(true), // Allow update
        cannot: jest.fn().mockReturnValue(false),
      } as any);

      const result = await applicationsService.preAccept(
        currentUser,
        preAcceptDto,
      );

      expect(result).toEqual(updatedApplication);
      expect(applicationsRepository.update).toHaveBeenCalledWith(
        existingApplication.id,
        expect.objectContaining({
          status: ApplicationStatus.PRE_ACCEPTED,
        }),
      );
    });

    it('should throw ForbiddenException if user does not own the offer', async () => {
      const otherOffer = { ...offer, userId: 'other-company' };
      offersService.findOneById.mockResolvedValue(otherOffer);

      await expect(
        applicationsService.preAccept(currentUser, preAcceptDto),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if student profile not found', async () => {
      offersService.findOneById.mockResolvedValue(offer);
      studentProfileService.findOneById.mockResolvedValue(null);

      await expect(
        applicationsService.preAccept(currentUser, preAcceptDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should return existing application if already ACCEPTED', async () => {
      offersService.findOneById.mockResolvedValue(offer);
      studentProfileService.findOneById.mockResolvedValue(studentProfile);

      const acceptedApp = plainToInstance(ApplicationDTO, {
        id: 'app-id',
        status: ApplicationStatus.ACCEPTED,
      });

      applicationsRepository.findByQuery.mockResolvedValue({
        rows: [acceptedApp],
        count: 1,
      });

      const result = await applicationsService.preAccept(
        currentUser,
        preAcceptDto,
      );

      expect(result).toBe(acceptedApp);
      expect(applicationsRepository.update).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException if permission denied for create', async () => {
      offersService.findOneById.mockResolvedValue(offer);
      studentProfileService.findOneById.mockResolvedValue(studentProfile);
      applicationsRepository.findByQuery.mockResolvedValue({
        rows: [],
        count: 0,
      });

      // Setup ability to DENY create
      caslAbilityFactory.createForUser.mockReturnValue({
        can: jest.fn().mockReturnValue(false),
        cannot: jest.fn().mockReturnValue(true), // Deny create
      } as any);

      await expect(
        applicationsService.preAccept(currentUser, preAcceptDto),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
