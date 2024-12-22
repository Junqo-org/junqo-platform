import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { UsersService } from './users.service';
import { UsersResolver } from './users.resolver';
import { User } from './models/user.model';
import { CaslAbilityFactory } from './../casl/casl-ability.factory';

@Module({
  imports: [SequelizeModule.forFeature([User])],
  controllers: [],
  providers: [UsersService, UsersResolver, CaslAbilityFactory],
  exports: [UsersService],
})
export class UsersModule {}
