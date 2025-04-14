import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ExperienceModel } from './models/experience.model';
import { ExperiencesRepository } from './experiences.repository';

@Module({
  imports: [SequelizeModule.forFeature([ExperienceModel])],
  providers: [ExperiencesRepository],
  exports: [ExperiencesRepository],
})
export class ExperiencesRepositoryModule {}
