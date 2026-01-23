import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersRepositoryModule } from './repository/users.repository.module';
import { CaslModule } from '../casl/casl.module';
import { UsersController } from './users.controller';
import { CompanyProfilesModule } from '../company-profiles/company-profiles.module';
import { StudentProfilesModule } from '../student-profiles/student-profiles.module';
import { SchoolProfilesModule } from '../school-profiles/school-profiles.module';
import { StatisticsService } from './statistics.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { OfferModel } from '../offers/repository/models/offer.model';
import { ApplicationModel } from '../applications/repository/models/application.model';
import { ConversationModel } from '../conversations/repository/models/conversation.model';
import { MessageModel } from '../messages/repository/models/message.model';
import { StudentProfileModel } from '../student-profiles/repository/models/student-profile.model';
import { CompanyProfileModel } from '../company-profiles/repository/models/company-profile.model';

@Module({
  imports: [
    UsersRepositoryModule,
    CaslModule,
    CompanyProfilesModule,
    StudentProfilesModule,
    SchoolProfilesModule,
    SequelizeModule.forFeature([
      OfferModel,
      ApplicationModel,
      ConversationModel,
      MessageModel,
      StudentProfileModel,
      CompanyProfileModel,
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService, StatisticsService],
  exports: [UsersService],
})
export class UsersModule {}
