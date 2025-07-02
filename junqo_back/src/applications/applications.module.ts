import { Module } from '@nestjs/common';
import { ApplicationsController } from './applications.controller';
import { CaslModule } from '../casl/casl.module';
import { ApplicationsRepositoryModule } from './repository/applications.repository.module';
import { OffersModule } from '../offers/offers.module';
import { ApplicationsService } from './applications.service';

@Module({
  controllers: [ApplicationsController],
  providers: [ApplicationsService],
  imports: [ApplicationsRepositoryModule, CaslModule, OffersModule],
  exports: [ApplicationsService],
})
export class ApplicationsModule {}
