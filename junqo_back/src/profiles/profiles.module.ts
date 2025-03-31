import { Module } from '@nestjs/common';
import { StudentProfilesResolver } from './student-profiles.resolver';
import { ProfilesService } from './profiles.service';
import { ProfilesRepositoryModule } from './repository/profiles.repository.module';
import { CaslModule } from '../casl/casl.module';

@Module({
  providers: [StudentProfilesResolver, ProfilesService],
  imports: [ProfilesRepositoryModule, CaslModule],
  exports: [ProfilesService],
})
export class ProfilesModule {}
