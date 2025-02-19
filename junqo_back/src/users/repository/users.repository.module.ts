import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserModel } from './models/user.model';
import { UsersRepository } from './users.repository';

@Module({
  imports: [SequelizeModule.forFeature([UserModel])],
  providers: [UsersRepository],
  exports: [UsersRepository],
})
export class UsersRepositoryModule {}
