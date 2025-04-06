import { Test, TestingModule } from '@nestjs/testing';
import { SchoolProfilesService } from './school-profiles.service';

describe('SchoolProfilesService', () => {
  let service: SchoolProfilesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SchoolProfilesService],
    }).compile();

    service = module.get<SchoolProfilesService>(SchoolProfilesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
