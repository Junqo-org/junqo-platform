import { Module } from '@nestjs/common';
import { ProfilesResolver } from './profiles.resolver';
import { ProfilesService } from './profiles.service';
import { ProfilesRepositoryModule } from './repository/profiles.repository.module';
import { CaslModule } from '../casl/casl.module';

@Module({
  providers: [ProfilesResolver, ProfilesService],
  imports: [ProfilesRepositoryModule, CaslModule],
  exports: [],
})
export class ProfilesModule {}
