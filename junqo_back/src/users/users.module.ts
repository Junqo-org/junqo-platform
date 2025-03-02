import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersResolver } from './users.resolver';
import { UsersRepositoryModule } from './repository/users.repository.module';
import { CaslModule } from '../casl/casl.module';

@Module({
  imports: [UsersRepositoryModule, CaslModule],
  controllers: [],
  providers: [UsersService, UsersResolver],
  exports: [UsersService],
})
export class UsersModule {}
