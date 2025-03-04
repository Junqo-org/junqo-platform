import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ProfilesRepository } from './profiles.repository';
import { StudentProfileModel } from './models/student-profile.model';
import { ExperienceModel } from './models/experience.model';
import { CompanyProfileModel } from './models/company-profile.model';

@Module({
  imports: [
    SequelizeModule.forFeature([
      StudentProfileModel,
      ExperienceModel,
      CompanyProfileModel,
    ]),
  ],
  providers: [ProfilesRepository],
  exports: [ProfilesRepository],
})
export class ProfilesRepositoryModule {}
