import { Module } from '@nestjs/common';
import { SchoolLinkRequestsController } from './school-link-requests.controller';
import { SchoolLinkRequestsService } from './school-link-requests.service';
import { SchoolLinkRequestsRepositoryModule } from './repository/school-link-requests.repository.module';
import { StudentProfilesRepositoryModule } from '../student-profiles/repository/student-profiles.repository.module';
import { SchoolProfilesRepositoryModule } from '../school-profiles/repository/school-profiles.repository.module';
import { CaslModule } from '../casl/casl.module';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
        SchoolLinkRequestsRepositoryModule,
        StudentProfilesRepositoryModule,
        SchoolProfilesRepositoryModule,
        CaslModule,
        AuthModule,
    ],
    controllers: [SchoolLinkRequestsController],
    providers: [SchoolLinkRequestsService],
    exports: [SchoolLinkRequestsService],
})
export class SchoolLinkRequestsModule { }

