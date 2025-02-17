import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersResolver } from './users.resolver';
import { CaslAbilityFactory } from './../casl/casl-ability.factory';
import { UsersRepositoryModule } from './repository/users.repository.module';

@Module({
  imports: [UsersRepositoryModule],
  controllers: [],
  providers: [UsersService, UsersResolver, CaslAbilityFactory],
  exports: [UsersService],
})
export class UsersModule {}
