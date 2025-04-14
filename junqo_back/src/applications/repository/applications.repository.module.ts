import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ApplicationModel } from './models/application.model';
import { ApplicationsRepository } from './applications.repository';

@Module({
  imports: [SequelizeModule.forFeature([ApplicationModel])],
  providers: [ApplicationsRepository],
  exports: [ApplicationsRepository],
})
export class ApplicationsRepositoryModule {}
