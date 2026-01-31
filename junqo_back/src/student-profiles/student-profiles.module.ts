import { Module } from '@nestjs/common';
import { StudentProfilesService } from './student-profiles.service';
import { StudentProfilesController } from './student-profiles.controller';
import { StudentProfilesRepositoryModule } from './repository/student-profiles.repository.module';
import { CaslModule } from '../casl/casl.module';

@Module({
  controllers: [StudentProfilesController],
  providers: [StudentProfilesService],
  exports: [StudentProfilesService, StudentProfilesRepositoryModule],
  imports: [StudentProfilesRepositoryModule, CaslModule],
})
export class StudentProfilesModule {}
