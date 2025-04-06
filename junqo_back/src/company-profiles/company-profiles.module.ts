import { Module } from '@nestjs/common';
import { CompanyProfilesService } from './company-profiles.service';
import { CompanyProfilesController } from './company-profiles.controller';
import { CompanyProfilesRepositoryModule } from './repository/company-profiles.repository.module';
import { CaslModule } from '../casl/casl.module';

@Module({
  controllers: [CompanyProfilesController],
  providers: [CompanyProfilesService],
    exports: [CompanyProfilesService],
  imports: [CompanyProfilesRepositoryModule, CaslModule],
})
export class CompanyProfilesModule {}
