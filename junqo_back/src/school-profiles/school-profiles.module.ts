import { Module } from '@nestjs/common';
import { SchoolProfilesService } from './school-profiles.service';
import { SchoolProfilesController } from './school-profiles.controller';
import { SchoolProfilesRepositoryModule } from './repository/school-profiles.repository.module';
import { CaslModule } from '../casl/casl.module';

@Module({
  controllers: [SchoolProfilesController],
  providers: [SchoolProfilesService],
  exports: [SchoolProfilesService],
  imports: [SchoolProfilesRepositoryModule, CaslModule],
})
export class SchoolProfilesModule {}
