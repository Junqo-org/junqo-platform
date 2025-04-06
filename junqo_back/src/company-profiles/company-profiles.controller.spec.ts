import { Test, TestingModule } from '@nestjs/testing';
import { CompanyProfilesController } from './company-profiles.controller';
import { CompanyProfilesService } from './company-profiles.service';

describe('CompanyProfilesController', () => {
  let controller: CompanyProfilesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompanyProfilesController],
      providers: [CompanyProfilesService],
    }).compile();

    controller = module.get<CompanyProfilesController>(CompanyProfilesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
