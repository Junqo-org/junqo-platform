import { Test, TestingModule } from '@nestjs/testing';
import { StudentProfilesResolver } from './student-profiles.resolver';
import { ProfilesService } from './profiles.service';
import { CaslModule } from '../casl/casl.module';
import { NotFoundException } from '@nestjs/common';
import { AuthUserDTO } from '../shared/dto/auth-user.dto';
import { StudentProfileInput } from '../graphql.schema';
import { StudentProfileDTO } from './dto/student-profile.dto';
import { UserType } from '../users/dto/user-type.enum';
import { plainToInstance } from 'class-transformer';

const currentUser: AuthUserDTO = plainToInstance(AuthUserDTO, {
  id: 'e69cc25b-0cc4-4032-83c2-0d34c84318ba',
  type: UserType.STUDENT,
  name: 'test user',
  email: 'test@mail.com',
});

describe('ProfilesResolver', () => {
  let resolver: StudentProfilesResolver;
  let profilesService: ProfilesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StudentProfilesResolver,
        {
          provide: ProfilesService,
          useValue: {
            findOneById: jest.fn(),
            updateStudentProfile: jest.fn(),
          },
        },
      ],
      imports: [CaslModule],
    }).compile();

    resolver = module.get<StudentProfilesResolver>(StudentProfilesResolver);
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
    jest.spyOn(profilesService, 'findOneById').mockResolvedValue(mockProfile);

    expect(await resolver.studentProfile(currentUser, 'test-id')).toEqual(
      mockProfile,
    );
    expect(profilesService.findOneById).toHaveBeenCalledWith(
      currentUser,
      'test-id',
    );
  });

  it('should throw NotFoundException if student profile not found', async () => {
    jest.spyOn(profilesService, 'findOneById').mockResolvedValue(null);

    await expect(
      resolver.studentProfile(currentUser, 'test-id'),
    ).rejects.toThrow(NotFoundException);
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
