import { Test } from '@nestjs/testing';
import { ExperiencesModule } from './experiences.module';
import { ExperiencesService } from './experiences.service';
import { ExperiencesRepository } from './repository/experiences.repository';

describe('ExperiencesModule', () => {
  it('should compile the module', async () => {
    const module = await Test.createTestingModule({
      imports: [ExperiencesModule],
    }).compile();

    expect(module).toBeDefined();
    expect(module.get(ExperiencesService)).toBeDefined();
    expect(module.get(ExperiencesRepository)).toBeDefined();
  });
});
