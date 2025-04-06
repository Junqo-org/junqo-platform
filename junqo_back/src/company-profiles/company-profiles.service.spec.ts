import { Test, TestingModule } from '@nestjs/testing';
import { CompanyProfilesService } from './company-profiles.service';

describe('CompanyProfilesService', () => {
  let service: CompanyProfilesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CompanyProfilesService],
    }).compile();

    service = module.get<CompanyProfilesService>(CompanyProfilesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
