import { StudentProfilesController } from './student-profiles.controller';
import { StudentProfilesService } from './student-profiles.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { AuthUserDTO } from '../shared/dto/auth-user.dto';
import { StudentProfileDTO, StudentProfileQueryDTO } from './dto/student-profile.dto';
import { UserType } from '../users/dto/user-type.enum';
import { plainToInstance } from 'class-transformer';
import { ExperienceDTO } from '../experiences/dto/experience.dto'
import { Mocked, TestBed } from '@suites/unit';

const currentUser: AuthUserDTO = plainToInstance(AuthUserDTO, {
  id: 'e69cc25b-0cc4-4032-83c2-0d34c84318ba',
  type: UserType.STUDENT,
  name: 'test user',
  email: 'test@mail.com',
});

const studentProfiles: StudentProfileDTO[] = [
  plainToInstance(StudentProfileDTO, {
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
  plainToInstance(StudentProfileDTO, {
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

describe('StudentProfilesController', () => {
  let controller: StudentProfilesController;
  let studentProfilesService: Mocked<StudentProfilesService>;

  beforeEach(async () => {
    const { unit, unitRef } = await TestBed.solitary(
      StudentProfilesController,
    ).compile();

    controller = unit;
    studentProfilesService = unitRef.get(StudentProfilesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('find by query', () => {
    const query: StudentProfileQueryDTO = plainToInstance(StudentProfileQueryDTO, {
      skills: ['skill'],
      page: 1,
      limit: 1,
    })

    it('should return every student profiles if no query', async () => {
      studentProfilesService.findByQuery.mockResolvedValue(studentProfiles);

      expect(await controller.findByQuery(currentUser, {})).toEqual(
        studentProfiles,
      );
      expect(studentProfilesService.findByQuery).toHaveBeenCalledWith(currentUser, {});
    });

    it('should return every student profiles corresponding to given query', async () => {
      studentProfilesService.findByQuery.mockResolvedValue(studentProfiles);

      expect(await controller.findByQuery(currentUser, query)).toEqual(
        studentProfiles,
      );
      expect(studentProfilesService.findByQuery).toHaveBeenCalledWith(currentUser, query);
    });

    it('should return empty if no student profiles correspond to given query', async () => {
      studentProfilesService.findByQuery.mockResolvedValue([]);

      expect(await controller.findByQuery(currentUser, query)).toEqual([]);
      expect(studentProfilesService.findByQuery).toHaveBeenCalledWith(currentUser, query);
    });

    it("should throw ForbiddenException if user don't have rights to read student profile", async () => {
      studentProfilesService.findByQuery.mockImplementation(async () => {
        throw new ForbiddenException();
      });

      await expect(controller.findByQuery(currentUser, null)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('findMy', () => {
    it('should find logged in student profile', async () => {
      studentProfilesService.findOneById.mockResolvedValue(studentProfiles[0]);

      expect(await controller.findMy(currentUser)).toEqual(studentProfiles[0]);
      expect(studentProfilesService.findOneById).toHaveBeenCalledWith(
        currentUser,
        currentUser.id,
      );
    });

    it('should throw NotFoundException if student profile not found', async () => {
      studentProfilesService.findOneById.mockImplementation(async () => {
        throw new NotFoundException();
      });

      await expect(controller.findMy(currentUser)).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should throw ForbiddenException if user don't have rights to read student profile", async () => {
      studentProfilesService.findOneById.mockImplementation(async () => {
        throw new ForbiddenException();
      });

      await expect(controller.findMy(currentUser)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('findOne', () => {
    it('should find a student profile by ID', async () => {
      studentProfilesService.findOneById.mockResolvedValue(studentProfiles[0]);

      expect(
        await controller.findOne(currentUser, studentProfiles[0].userId),
      ).toEqual(studentProfiles[0]);
      expect(studentProfilesService.findOneById).toHaveBeenCalledWith(
        currentUser,
        studentProfiles[0].userId,
      );
    });

    it('should throw NotFoundException if student profile not found', async () => {
      studentProfilesService.findOneById.mockImplementation(async () => {
        throw new NotFoundException();
      });

      await expect(controller.findOne(currentUser, 'test-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should throw ForbiddenException if user don't have rights to read student profile", async () => {
      studentProfilesService.findOneById.mockImplementation(async () => {
        throw new ForbiddenException();
      });

      await expect(controller.findOne(currentUser, 'test-id')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('updateMy', () => {
    const studentProfileInput: StudentProfileDTO = {
      avatar: 'https://picsum.photos/200/300',
      userId: '',
      name: '',
    };

    it('should update a student profile', async () => {
      const mockProfile: StudentProfileDTO = plainToInstance(
        StudentProfileDTO,
        {
          userId: 'test-id',
          name: 'John Doe',
        },
      );
      studentProfilesService.update.mockResolvedValue(mockProfile);

      expect(
        await controller.updateMy(currentUser, studentProfileInput),
      ).toEqual(mockProfile);
      expect(studentProfilesService.update).toHaveBeenCalledWith(
        currentUser,
        studentProfileInput,
      );
    });

    it('should throw NotFoundException if student profile to update not found', async () => {
      studentProfilesService.update.mockImplementation(async () => {
        throw new NotFoundException();
      });

      await expect(
        controller.updateMy(currentUser, studentProfileInput),
      ).rejects.toThrow(NotFoundException);
    });

    it("should throw NotFoundException if user don't have rights to update student profile", async () => {
      studentProfilesService.update.mockImplementation(async () => {
        throw new ForbiddenException();
      });

      await expect(
        controller.updateMy(currentUser, studentProfileInput),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
