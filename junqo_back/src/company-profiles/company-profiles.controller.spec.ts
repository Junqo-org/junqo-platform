import { CompanyProfilesController } from './company-profiles.controller';
import { CompanyProfilesService } from './company-profiles.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { AuthUserDTO } from '../shared/dto/auth-user.dto';
import {
  CompanyProfileDTO,
  CompanyProfileQueryDTO,
} from './dto/company-profile.dto';
import { UserType } from '../users/dto/user-type.enum';
import { plainToInstance } from 'class-transformer';
import { ExperienceDTO } from '../experiences/dto/experience.dto';
import { Mocked, TestBed } from '@suites/unit';

const currentUser: AuthUserDTO = plainToInstance(AuthUserDTO, {
  id: 'e69cc25b-0cc4-4032-83c2-0d34c84318ba',
  type: UserType.COMPANY,
  name: 'test user',
  email: 'test@mail.com',
});

const companyProfiles: CompanyProfileDTO[] = [
  plainToInstance(CompanyProfileDTO, {
    userId: 'e69cc25b-0cc4-4032-83c2-0d34c84318ba',
    name: 'test user',
    avatar: 'https://picsum.photos/200/300',
    skills: ['nestjs', 'flutter', 'work in team'],
    experiences: [
      plainToInstance(ExperienceDTO, {
        title: 'title',
        company: 'company',
        startDate: new Date('01/02/2020'),
        endDate: new Date('01/05/2020'),
        description: 'description',
        skills: ['nestjs', 'flutter', 'work in team'],
      }),
    ],
  }),
  plainToInstance(CompanyProfileDTO, {
    userId: 'e69cc25b-0cc4-4032-83c2-0d34c84318bb',
    name: 'test user 2',
    avatar: 'https://picsum.photos/200/300',
    skills: ['nestjs', 'flutter'],
    experiences: [
      plainToInstance(ExperienceDTO, {
        title: 'title 2',
        company: 'company 2',
        startDate: new Date('01/02/2022'),
        endDate: new Date('01/05/2022'),
        description: 'description 2',
        skills: ['nestjs', 'flutter'],
      }),
    ],
  }),
];

describe('CompanyProfilesController', () => {
  let controller: CompanyProfilesController;
  let companyProfilesService: Mocked<CompanyProfilesService>;

  beforeEach(async () => {
    const { unit, unitRef } = await TestBed.solitary(
      CompanyProfilesController,
    ).compile();

    controller = unit;
    companyProfilesService = unitRef.get(CompanyProfilesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('find by query', () => {
    const query: CompanyProfileQueryDTO = plainToInstance(
      CompanyProfileQueryDTO,
      {
        skills: 'skill,js',
        page: 1,
        limit: 1,
      },
    );

    it('should return every company profiles if no query', async () => {
      companyProfilesService.findByQuery.mockResolvedValue(companyProfiles);

      expect(await controller.findByQuery(currentUser, {})).toEqual(
        companyProfiles,
      );
      expect(companyProfilesService.findByQuery).toHaveBeenCalledWith(
        currentUser,
        {},
      );
    });

    it('should return every company profiles corresponding to given query', async () => {
      companyProfilesService.findByQuery.mockResolvedValue(companyProfiles);

      expect(await controller.findByQuery(currentUser, query)).toEqual(
        companyProfiles,
      );
      expect(companyProfilesService.findByQuery).toHaveBeenCalledWith(
        currentUser,
        query,
      );
    });

    it('should return empty if no company profiles correspond to given query', async () => {
      companyProfilesService.findByQuery.mockResolvedValue([]);

      expect(await controller.findByQuery(currentUser, query)).toEqual([]);
      expect(companyProfilesService.findByQuery).toHaveBeenCalledWith(
        currentUser,
        query,
      );
    });

    it("should throw ForbiddenException if user don't have rights to read company profile", async () => {
      companyProfilesService.findByQuery.mockImplementation(async () => {
        throw new ForbiddenException();
      });

      await expect(controller.findByQuery(currentUser, null)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('findMy', () => {
    it('should find logged in company profile', async () => {
      companyProfilesService.findOneById.mockResolvedValue(companyProfiles[0]);

      expect(await controller.findMy(currentUser)).toEqual(companyProfiles[0]);
      expect(companyProfilesService.findOneById).toHaveBeenCalledWith(
        currentUser,
        currentUser.id,
      );
    });

    it('should throw NotFoundException if company profile not found', async () => {
      companyProfilesService.findOneById.mockImplementation(async () => {
        throw new NotFoundException();
      });

      await expect(controller.findMy(currentUser)).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should throw ForbiddenException if user don't have rights to read company profile", async () => {
      companyProfilesService.findOneById.mockImplementation(async () => {
        throw new ForbiddenException();
      });

      await expect(controller.findMy(currentUser)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('findOne', () => {
    it('should find a company profile by ID', async () => {
      companyProfilesService.findOneById.mockResolvedValue(companyProfiles[0]);

      expect(
        await controller.findOne(currentUser, companyProfiles[0].userId),
      ).toEqual(companyProfiles[0]);
      expect(companyProfilesService.findOneById).toHaveBeenCalledWith(
        currentUser,
        companyProfiles[0].userId,
      );
    });

    it('should throw NotFoundException if company profile not found', async () => {
      companyProfilesService.findOneById.mockImplementation(async () => {
        throw new NotFoundException();
      });

      await expect(controller.findOne(currentUser, 'test-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should throw ForbiddenException if user don't have rights to read company profile", async () => {
      companyProfilesService.findOneById.mockImplementation(async () => {
        throw new ForbiddenException();
      });

      await expect(controller.findOne(currentUser, 'test-id')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('updateMy', () => {
    const companyProfileInput: CompanyProfileDTO = {
      avatar: 'https://picsum.photos/200/300',
      userId: '',
      name: '',
    };

    it('should update a company profile', async () => {
      const mockProfile: CompanyProfileDTO = plainToInstance(
        CompanyProfileDTO,
        {
          userId: 'test-id',
          name: 'John Doe',
        },
      );
      companyProfilesService.update.mockResolvedValue(mockProfile);

      expect(
        await controller.updateMy(currentUser, companyProfileInput),
      ).toEqual(mockProfile);
      expect(companyProfilesService.update).toHaveBeenCalledWith(
        currentUser,
        companyProfileInput,
      );
    });

    it('should throw NotFoundException if company profile to update not found', async () => {
      companyProfilesService.update.mockImplementation(async () => {
        throw new NotFoundException();
      });

      await expect(
        controller.updateMy(currentUser, companyProfileInput),
      ).rejects.toThrow(NotFoundException);
    });

    it("should throw NotFoundException if user don't have rights to update company profile", async () => {
      companyProfilesService.update.mockImplementation(async () => {
        throw new ForbiddenException();
      });

      await expect(
        controller.updateMy(currentUser, companyProfileInput),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
