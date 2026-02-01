import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { SchoolLinkRequestModel } from './models/school-link-request.model';
import { SchoolLinkRequestsRepository } from './school-link-requests.repository';

@Module({
  imports: [SequelizeModule.forFeature([SchoolLinkRequestModel])],
  providers: [SchoolLinkRequestsRepository],
  exports: [SchoolLinkRequestsRepository],
})
export class SchoolLinkRequestsRepositoryModule {}
