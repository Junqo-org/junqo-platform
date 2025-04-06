import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { StudentProfilesRepository } from './student-profiles.repository';
import { StudentProfileModel } from './models/student-profile.model';

@Module({
  imports: [SequelizeModule.forFeature([StudentProfileModel])],
  providers: [StudentProfilesRepository],
  exports: [StudentProfilesRepository],
})
export class StudentProfilesRepositoryModule {}
