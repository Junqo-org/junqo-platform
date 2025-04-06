import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ExperiencesController } from './experiences.controller';
import { ExperiencesService } from './experiences.service';
import { ExperiencesRepository } from './repository/experiences.repository';
import { ExperienceModel } from './repository/models/experience.model';
import { StudentProfilesModule } from '../student-profiles/student-profiles.module';
import { CaslModule } from '../casl/casl.module';

@Module({
  imports: [
    SequelizeModule.forFeature([ExperienceModel]),
    StudentProfilesModule,
    CaslModule,
  ],
  controllers: [ExperiencesController],
  providers: [ExperiencesService, ExperiencesRepository],
  exports: [ExperiencesService, ExperiencesRepository],
})
export class ExperiencesModule {}
