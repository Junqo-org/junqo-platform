import { ApplicationsController } from './applications.controller';
import { ApplicationsService } from './applications.service';
import { ApplicationDTO, UpdateApplicationDTO } from './dto/application.dto';
import { Mocked, TestBed } from '@suites/unit';
import { AuthUserDTO } from '../shared/dto/auth-user.dto';
import { plainToInstance } from 'class-transformer';
import { UserType } from '../users/dto/user-type.enum';
import { ApplicationStatus } from './dto/application-status.enum';

describe('ApplicationsController', () => {
  let controller: ApplicationsController;
  let service: Mocked<ApplicationsService>;

  const mockCurrentUser: AuthUserDTO = plainToInstance(AuthUserDTO, {
    id: 's19cc25b-0cc4-4032-83c2-0d34c84318ba',
    type: UserType.COMPANY,
    name: 'test user',
    email: 'test@mail.com',
  });

  const mockApplications: ApplicationDTO[] = [
    new ApplicationDTO({
      id: 'a1ec0948-58dd-40b2-b085-5a47244036c2',
      studentId: mockCurrentUser.id,
      companyId: 'c19cc25b-0cc4-4032-83c2-0d34c84318ba',
      offerId: 'o19cc25b-0cc4-4032-83c2-0d34c84318ba',
      status: ApplicationStatus.NOT_OPENED,
      createdAt: new Date('2024-01-01T00:00:00Z'),
      updatedAt: new Date('2024-01-02T00:00:00Z'),
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

  const mockUpdateApplication: UpdateApplicationDTO = {
    status: ApplicationStatus.ACCEPTED,
  };

  beforeEach(async () => {
    const { unit, unitRef } = await TestBed.solitary(
      ApplicationsController,
    ).compile();

    controller = unit;
    service = unitRef.get(ApplicationsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getByQuery', () => {
    it('should return a query output', async () => {
      const expectedOutput = {
        rows: mockApplications,
        count: mockApplications.length,
      };
      service.findByQuery.mockResolvedValue(expectedOutput);

      expect(await controller.findByQuery(mockCurrentUser, {})).toEqual(
        expectedOutput,
      );
    });
  });

  describe('getMy', () => {
    it('should return a list of applications', async () => {
      service.findByStudentId.mockResolvedValue(mockApplications);
      service.findByCompanyId.mockResolvedValue(mockApplications);

      expect(await controller.getMy(mockCurrentUser)).toEqual(mockApplications);
    });
  });

  describe('create', () => {
    it('should create and return an application', async () => {
      service.create.mockResolvedValue(mockApplications[0]);
      expect(
        await controller.create(mockCurrentUser, mockApplications[0].offerId),
      ).toEqual(mockApplications[0]);
    });
  });

  describe('updateApplication', () => {
    it('should update and return an application', async () => {
      service.update.mockResolvedValue(mockApplications[0]);
      expect(
        await controller.update(
          mockCurrentUser,
          '1aec0948-58dd-40b2-b085-5a47244036c2',
          mockUpdateApplication,
        ),
      ).toEqual(mockApplications[0]);
    });
  });
  describe('preAccept', () => {
    it('should pre-accept and return an application', async () => {
      const preAcceptDto = {
        offerId: 'o19cc25b-0cc4-4032-83c2-0d34c84318ba',
        studentId: 's19cc25b-0cc4-4032-83c2-0d34c84318ba',
      };
      const expectedApplication = mockApplications[0];

      service.preAccept.mockResolvedValue(expectedApplication);

      const result = await controller.preAccept(mockCurrentUser, preAcceptDto);

      expect(result).toBe(expectedApplication);
      expect(service.preAccept).toHaveBeenCalledWith(
        mockCurrentUser,
        preAcceptDto,
      );
    });
  });
});
