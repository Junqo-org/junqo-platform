import { Module } from '@nestjs/common';
import { OffersRepositoryModule } from './repository/offers.repository.module';
import { OffersResolver } from './offers.resolver';
import { OffersService } from './offers.service';
import { CaslModule } from '../casl/casl.module';

@Module({
  imports: [OffersRepositoryModule, CaslModule],
  providers: [OffersResolver, OffersService],
})
export class OffersModule {}
