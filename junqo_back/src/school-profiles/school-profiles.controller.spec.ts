import { SchoolProfilesController } from './school-profiles.controller';
import { SchoolProfilesService } from './school-profiles.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { AuthUserDTO } from '../shared/dto/auth-user.dto';
import { SchoolProfileDTO } from './dto/school-profile.dto';
import { UserType } from '../users/dto/user-type.enum';
import { plainToInstance } from 'class-transformer';
import { ExperienceDTO } from '../experiences/dto/experience.dto';
import { Mocked, TestBed } from '@suites/unit';
import {
  SchoolProfileQueryDTO,
  SchoolProfileQueryOutputDTO,
} from './dto/school-profile-query.dto';

const currentUser: AuthUserDTO = plainToInstance(AuthUserDTO, {
  id: 'e69cc25b-0cc4-4032-83c2-0d34c84318ba',
  type: UserType.SCHOOL,
  name: 'test user',
  email: 'test@mail.com',
});

const schoolProfiles: SchoolProfileDTO[] = [
  plainToInstance(SchoolProfileDTO, {
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
  plainToInstance(SchoolProfileDTO, {
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

describe('SchoolProfilesController', () => {
  let controller: SchoolProfilesController;
  let schoolProfilesService: Mocked<SchoolProfilesService>;

  beforeEach(async () => {
    const { unit, unitRef } = await TestBed.solitary(
      SchoolProfilesController,
    ).compile();

    controller = unit;
    schoolProfilesService = unitRef.get(SchoolProfilesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('find by query', () => {
    const query: SchoolProfileQueryDTO = plainToInstance(
      SchoolProfileQueryDTO,
      {
        skills: 'skill,js',
        mode: 'any',
        offset: 0,
        limit: 10,
      },
    );

    it('should return every school profiles if no query', async () => {
      const expectedQueryResult: SchoolProfileQueryOutputDTO = {
        rows: schoolProfiles,
        count: schoolProfiles.length,
      };
      schoolProfilesService.findByQuery.mockResolvedValue(expectedQueryResult);

      expect(await controller.findByQuery(currentUser, {})).toEqual(
        expectedQueryResult,
      );
      expect(schoolProfilesService.findByQuery).toHaveBeenCalledWith(
        currentUser,
        {},
      );
    });

    it('should return every school profiles corresponding to given query', async () => {
      const expectedQueryResult: SchoolProfileQueryOutputDTO = {
        rows: schoolProfiles,
        count: schoolProfiles.length,
      };
      schoolProfilesService.findByQuery.mockResolvedValue(expectedQueryResult);

      expect(await controller.findByQuery(currentUser, query)).toEqual(
        expectedQueryResult,
      );
      expect(schoolProfilesService.findByQuery).toHaveBeenCalledWith(
        currentUser,
        query,
      );
    });

    it('should return empty if no school profiles correspond to given query', async () => {
      schoolProfilesService.findByQuery.mockResolvedValue({
        rows: [],
        count: 0,
      });

      expect(await controller.findByQuery(currentUser, query)).toEqual({
        rows: [],
        count: 0,
      });
      expect(schoolProfilesService.findByQuery).toHaveBeenCalledWith(
        currentUser,
        query,
      );
    });

    it("should throw ForbiddenException if user don't have rights to read school profile", async () => {
      schoolProfilesService.findByQuery.mockImplementation(async () => {
        throw new ForbiddenException();
      });

      await expect(controller.findByQuery(currentUser, null)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('findMy', () => {
    it('should find logged in school profile', async () => {
      schoolProfilesService.findOneById.mockResolvedValue(schoolProfiles[0]);

      expect(await controller.findMy(currentUser)).toEqual(schoolProfiles[0]);
      expect(schoolProfilesService.findOneById).toHaveBeenCalledWith(
        currentUser,
        currentUser.id,
      );
    });

    it('should throw NotFoundException if school profile not found', async () => {
      schoolProfilesService.findOneById.mockImplementation(async () => {
        throw new NotFoundException();
      });

      await expect(controller.findMy(currentUser)).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should throw ForbiddenException if user don't have rights to read school profile", async () => {
      schoolProfilesService.findOneById.mockImplementation(async () => {
        throw new ForbiddenException();
      });

      await expect(controller.findMy(currentUser)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('findOne', () => {
    it('should find a school profile by ID', async () => {
      schoolProfilesService.findOneById.mockResolvedValue(schoolProfiles[0]);

      expect(
        await controller.findOne(currentUser, schoolProfiles[0].userId),
      ).toEqual(schoolProfiles[0]);
      expect(schoolProfilesService.findOneById).toHaveBeenCalledWith(
        currentUser,
        schoolProfiles[0].userId,
      );
    });

    it('should throw NotFoundException if school profile not found', async () => {
      schoolProfilesService.findOneById.mockImplementation(async () => {
        throw new NotFoundException();
      });

      await expect(controller.findOne(currentUser, 'test-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should throw ForbiddenException if user don't have rights to read school profile", async () => {
      schoolProfilesService.findOneById.mockImplementation(async () => {
        throw new ForbiddenException();
      });

      await expect(controller.findOne(currentUser, 'test-id')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('updateMy', () => {
    const schoolProfileInput: SchoolProfileDTO = {
      avatar: 'https://picsum.photos/200/300',
      userId: '',
      name: '',
    };

    it('should update a school profile', async () => {
      const mockProfile: SchoolProfileDTO = plainToInstance(SchoolProfileDTO, {
        userId: 'test-id',
        name: 'John Doe',
      });
      schoolProfilesService.update.mockResolvedValue(mockProfile);

      expect(
        await controller.updateMy(currentUser, schoolProfileInput),
      ).toEqual(mockProfile);
      expect(schoolProfilesService.update).toHaveBeenCalledWith(
        currentUser,
        schoolProfileInput,
      );
    });

    it('should throw NotFoundException if school profile to update not found', async () => {
      schoolProfilesService.update.mockImplementation(async () => {
        throw new NotFoundException();
      });

      await expect(
        controller.updateMy(currentUser, schoolProfileInput),
      ).rejects.toThrow(NotFoundException);
    });

    it("should throw NotFoundException if user don't have rights to update school profile", async () => {
      schoolProfilesService.update.mockImplementation(async () => {
        throw new ForbiddenException();
      });

      await expect(
        controller.updateMy(currentUser, schoolProfileInput),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
