import { Module } from '@nestjs/common';
import { SchoolProfilesService } from './school-profiles.service';
import { SchoolProfilesController } from './school-profiles.controller';
import { SchoolProfilesRepositoryModule } from './repository/school-profiles.repository.module';
import { CaslModule } from '../casl/casl.module';
import { StudentProfilesRepositoryModule } from '../student-profiles/repository/student-profiles.repository.module';

@Module({
  controllers: [SchoolProfilesController],
  providers: [SchoolProfilesService],
  exports: [SchoolProfilesService],
  imports: [
    SchoolProfilesRepositoryModule,
    CaslModule,
    StudentProfilesRepositoryModule,
  ],
})
export class SchoolProfilesModule {}
