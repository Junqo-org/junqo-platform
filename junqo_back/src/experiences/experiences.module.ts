import { Module } from '@nestjs/common';
import { ExperiencesController } from './experiences.controller';
import { ExperiencesService } from './experiences.service';
import { StudentProfilesModule } from '../student-profiles/student-profiles.module';
import { CaslModule } from '../casl/casl.module';
import { ExperiencesRepositoryModule } from './repository/experiences.repository.module';

@Module({
  imports: [ExperiencesRepositoryModule, StudentProfilesModule, CaslModule],
  controllers: [ExperiencesController],
  providers: [ExperiencesService],
  exports: [ExperiencesService],
})
export class ExperiencesModule {}
