import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { SchoolProfilesRepository } from './school-profiles.repository';
import { SchoolProfileModel } from './models/school-profile.model';

@Module({
  imports: [SequelizeModule.forFeature([SchoolProfileModel])],
  providers: [SchoolProfilesRepository],
  exports: [SchoolProfilesRepository],
})
export class SchoolProfilesRepositoryModule {}
