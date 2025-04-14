import { Module } from '@nestjs/common';
import { OffersRepositoryModule } from './repository/offers.repository.module';
import { OffersService } from './offers.service';
import { CaslModule } from '../casl/casl.module';
import { OffersController } from './offers.controller';

@Module({
  imports: [OffersRepositoryModule, CaslModule],
  controllers: [OffersController],
  providers: [OffersService],
  exports: [OffersService],
})
export class OffersModule {}
