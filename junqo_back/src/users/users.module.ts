import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersRepositoryModule } from './repository/users.repository.module';
import { CaslModule } from '../casl/casl.module';
import { UsersController } from './users.controller';
import { CompanyProfilesModule } from '../company-profiles/company-profiles.module';
import { StudentProfilesModule } from '../student-profiles/student-profiles.module';
import { SchoolProfilesModule } from '../school-profiles/school-profiles.module';

@Module({
  imports: [
    UsersRepositoryModule,
    CaslModule,
    CompanyProfilesModule,
    StudentProfilesModule,
    SchoolProfilesModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
