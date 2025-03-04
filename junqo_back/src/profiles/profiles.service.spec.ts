import { Test, TestingModule } from '@nestjs/testing';
import { ProfilesService } from './profiles.service';
import { ProfilesRepository } from './repository/profiles.repository';
import { CaslAbilityFactory } from '../casl/casl-ability.factory';
import {
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { AuthUserDTO } from '../shared/dto/auth-user.dto';
import {
  CreateStudentProfileDTO,
  StudentProfileDTO,
  UpdateStudentProfileDTO,
} from './dto/student-profile.dto';
import { UserType } from '../users/dto/user-type.enum';

describe('ProfilesService', () => {
  let service: ProfilesService;
  let profilesRepository: ProfilesRepository;
  let caslAbilityFactory: CaslAbilityFactory;

  beforeEach(async () => {
    const mockProfileRepository = {
      findAll: jest.fn(),
      findOneById: jest.fn(),
      createStudentProfile: jest.fn(),
      updateStudentProfile: jest.fn(),
      deleteStudentProfile: jest.fn(),
    };
    const mockCaslAbilityFactory = {
      createForUser: jest.fn().mockReturnValue({
        cannot: jest.fn().mockReturnValue(false),
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfilesService,
        {
          provide: ProfilesRepository,
          useValue: mockProfileRepository,
        },
        {
          provide: CaslAbilityFactory,
          useValue: mockCaslAbilityFactory,
        },
      ],
    }).compile();

    service = module.get<ProfilesService>(ProfilesService);
    profilesRepository = module.get<ProfilesRepository>(ProfilesRepository);
    caslAbilityFactory = module.get<CaslAbilityFactory>(CaslAbilityFactory);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw ForbiddenException if user cannot update profile', async () => {
    const currentUser: AuthUserDTO = {
      id: '1',
      type: UserType.STUDENT,
      name: 'test user',
      email: 'test@mail.com',
    };
    const updateDto: UpdateStudentProfileDTO = { name: 'Jane Doe' };

    jest
      .spyOn(caslAbilityFactory.createForUser(currentUser), 'cannot')
      .mockReturnValue(true);

    await expect(
      service.updateStudentProfile(currentUser, updateDto),
    ).rejects.toThrow(ForbiddenException);
  });

  it('should throw ForbiddenException if user is not a student', async () => {
    const currentUser: AuthUserDTO = {
      id: '1',
      type: UserType.SCHOOL,
      name: 'test user',
      email: 'test@mail.com',
    };
    const updateDto: UpdateStudentProfileDTO = { name: 'Jane Doe' };

    await expect(
      service.updateStudentProfile(currentUser, updateDto),
    ).rejects.toThrow(ForbiddenException);
  });

  it('should throw InternalServerErrorException if update fails', async () => {
    const currentUser: AuthUserDTO = {
      id: '1',
      type: UserType.STUDENT,
      name: 'test user',
      email: 'test@mail.com',
    };
    const updateDto: UpdateStudentProfileDTO = { name: 'Jane Doe' };

    jest
      .spyOn(profilesRepository, 'updateStudentProfile')
      .mockRejectedValue(new Error('Update failed'));

    await expect(
      service.updateStudentProfile(currentUser, updateDto),
    ).rejects.toThrow(InternalServerErrorException);
  });

  it('should return all student profiles', async () => {
    const profiles: StudentProfileDTO[] = [{ userId: '1', name: 'John Doe' }];
    jest.spyOn(profilesRepository, 'findAll').mockResolvedValue(profiles);

    const result = await service.findAll();
    expect(result).toEqual(profiles);
  });

  it('should throw NotFoundException if no student profiles found', async () => {
    jest.spyOn(profilesRepository, 'findAll').mockResolvedValue([]);

    await expect(service.findAll()).rejects.toThrow(NotFoundException);
  });

  it('should return a student profile by ID', async () => {
    const profile: StudentProfileDTO = { userId: '1', name: 'John Doe' };
    jest.spyOn(profilesRepository, 'findOneById').mockResolvedValue(profile);

    const result = await service.findOneByID('1');
    expect(result).toEqual(profile);
  });

  it('should throw BadRequestException for invalid ID', async () => {
    await expect(service.findOneByID('')).rejects.toThrow(BadRequestException);
  });

  it('should create a student profile', async () => {
    const currentUser: AuthUserDTO = {
      id: '1',
      type: UserType.STUDENT,
      name: 'test user',
      email: 'test@mail.com',
    };
    const createDto: CreateStudentProfileDTO = {
      userId: '1',
      name: 'test user',
    };
    const createdProfile: StudentProfileDTO = { userId: '1', name: 'John Doe' };

    jest
      .spyOn(profilesRepository, 'createStudentProfile')
      .mockResolvedValue(createdProfile);

    const result = await service.createStudentProfile(currentUser, createDto);
    expect(result).toEqual(createdProfile);
  });

  it('should throw ForbiddenException if user cannot create profile', async () => {
    const currentUser: AuthUserDTO = {
      id: '1',
      type: UserType.STUDENT,
      name: 'test user',
      email: 'test@mail.com',
    };
    const createDto: CreateStudentProfileDTO = {
      userId: '1',
      name: 'John Doe',
    };

    jest
      .spyOn(caslAbilityFactory.createForUser(currentUser), 'cannot')
      .mockReturnValue(true);

    await expect(
      service.createStudentProfile(currentUser, createDto),
    ).rejects.toThrow(ForbiddenException);
  });

  it('should delete a student profile', async () => {
    const currentUser: AuthUserDTO = {
      id: '1',
      type: UserType.STUDENT,
      name: 'test user',
      email: 'test@mail.com',
    };

    jest
      .spyOn(profilesRepository, 'deleteStudentProfile')
      .mockResolvedValue(true);

    const result = await service.deleteStudentProfile(currentUser);
    expect(result).toBe(true);
  });

  it('should throw ForbiddenException if user cannot delete profile', async () => {
    const currentUser: AuthUserDTO = {
      id: '1',
      type: UserType.STUDENT,
      name: 'test user',
      email: 'test@mail.com',
    };

    jest
      .spyOn(caslAbilityFactory.createForUser(currentUser), 'cannot')
      .mockReturnValue(true);

    await expect(service.deleteStudentProfile(currentUser)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('should throw NotFoundException if profile to delete is not found', async () => {
    const currentUser: AuthUserDTO = {
      id: '1',
      type: UserType.STUDENT,
      name: 'test user',
      email: 'test@mail.com',
    };

    jest
      .spyOn(profilesRepository, 'deleteStudentProfile')
      .mockResolvedValue(false);

    await expect(service.deleteStudentProfile(currentUser)).rejects.toThrow(
      NotFoundException,
    );
  });
});
