import { Test, TestingModule } from '@nestjs/testing';
import { SchoolProfilesController } from './school-profiles.controller';
import { SchoolProfilesService } from './school-profiles.service';

describe('SchoolProfilesController', () => {
  let controller: SchoolProfilesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SchoolProfilesController],
      providers: [SchoolProfilesService],
    }).compile();

    controller = module.get<SchoolProfilesController>(SchoolProfilesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
