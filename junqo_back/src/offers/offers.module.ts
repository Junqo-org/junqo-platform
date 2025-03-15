import { Module } from '@nestjs/common';
import { OffersRepositoryModule } from './repository/offers.repository.module';
import { OffersResolver } from './offers.resolver';
import { OffersService } from './offers.service';

@Module({
  imports: [OffersRepositoryModule],
  providers: [OffersResolver, OffersService],
})
export class OffersModule {}
