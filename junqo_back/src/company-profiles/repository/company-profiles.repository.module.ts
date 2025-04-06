import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CompanyProfilesRepository } from './company-profiles.repository';
import { CompanyProfileModel } from './models/company-profile.model';

@Module({
  imports: [SequelizeModule.forFeature([CompanyProfileModel])],
  providers: [CompanyProfilesRepository],
  exports: [CompanyProfilesRepository],
})
export class CompanyProfilesRepositoryModule {}
