import { Test, TestingModule } from '@nestjs/testing';
import { ProfilesResolver } from './profiles.resolver';
import { ProfilesService } from './profiles.service';
import { CaslModule } from '../casl/casl.module';

describe('ProfilesResolver', () => {
  let resolver: ProfilesResolver;

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
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
