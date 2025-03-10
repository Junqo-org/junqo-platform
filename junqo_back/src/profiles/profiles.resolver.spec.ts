import { Test, TestingModule } from '@nestjs/testing';
import { ProfilesResolver } from './profiles.resolver';
import { ProfilesService } from './profiles.service';
import { CaslModule } from '../casl/casl.module';
import { NotFoundException } from '@nestjs/common';
import { AuthUserDTO } from '../shared/dto/auth-user.dto';
import { StudentProfileInput } from './../graphql.schema';
import { StudentProfileDTO } from './dto/student-profile.dto';
import { UserType } from '../users/dto/user-type.enum';
import { plainToInstance } from 'class-transformer';

describe('ProfilesResolver', () => {
  let resolver: ProfilesResolver;
  let profilesService: ProfilesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfilesResolver,
        {
          provide: ProfilesService,
          useValue: {
            findOneByID: jest.fn(),
            updateStudentProfile: jest.fn(),
          },
        },
      ],
      imports: [CaslModule],
    }).compile();

    resolver = module.get<ProfilesResolver>(ProfilesResolver);
    profilesService = module.get<ProfilesService>(ProfilesService);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  it('should find a student profile by ID', async () => {
    const mockProfile: StudentProfileDTO = plainToInstance(StudentProfileDTO, {
      userId: 'test-id',
      name: 'John Doe',
    });
    jest.spyOn(profilesService, 'findOneByID').mockResolvedValue(mockProfile);

    expect(await resolver.studentProfile('test-id')).toEqual(mockProfile);
    expect(profilesService.findOneByID).toHaveBeenCalledWith('test-id');
  });

  it('should throw NotFoundException if student profile not found', async () => {
    jest.spyOn(profilesService, 'findOneByID').mockResolvedValue(null);

    await expect(resolver.studentProfile('test-id')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should update a student profile', async () => {
    const currentUser: AuthUserDTO = {
      id: 'user-id',
      name: 'John Doe',
      email: 'john.doe@example.com',
      type: UserType.STUDENT,
    };
    const studentProfileInput: StudentProfileInput = {
      avatar: 'https://picsum.photos/200/300',
    };
    const mockProfile: StudentProfileDTO = plainToInstance(StudentProfileDTO, {
      userId: 'test-id',
      name: 'John Doe',
    });
    jest
      .spyOn(profilesService, 'updateStudentProfile')
      .mockResolvedValue(mockProfile);

    expect(
      await resolver.updateStudentProfile(currentUser, studentProfileInput),
    ).toEqual(mockProfile);
    expect(profilesService.updateStudentProfile).toHaveBeenCalledWith(
      currentUser,
      studentProfileInput,
    );
  });

  it('should throw NotFoundException if student profile to update not found', async () => {
    const currentUser: AuthUserDTO = {
      id: 'user-id',
      name: 'John Doe',
      email: 'john.doe@example.com',
      type: UserType.STUDENT,
    };
    const studentProfileInput: StudentProfileInput = {
      avatar: 'https://picsum.photos/200/300',
    };
    jest.spyOn(profilesService, 'updateStudentProfile').mockResolvedValue(null);

    await expect(
      resolver.updateStudentProfile(currentUser, studentProfileInput),
    ).rejects.toThrow(NotFoundException);
  });
});
