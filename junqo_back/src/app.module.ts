import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuthModule } from './auth/auth.module';
import { CaslModule } from './casl/casl.module';
import { ConfigModule } from './config/config.module';
import { ConfigService } from '@nestjs/config';
import { OffersModule } from './offers/offers.module';
import { StudentProfilesModule } from './student-profiles/student-profiles.module';
import { CompanyProfilesModule } from './company-profiles/company-profiles.module';
import { SchoolProfilesModule } from './school-profiles/school-profiles.module';
import { ExperiencesModule } from './experiences/experiences.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ApplicationsModule } from './applications/applications.module';
import { InterviewSimulationModule } from './interview-simulation/interview-simulation.module';

@Module({
  imports: [
    ConfigModule,
    SequelizeModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        dialect: configService.get('database.dialect'),
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.database'),
        autoLoadModels: true,
        synchronize: configService.get('database.synchronize'),
        logging: configService.get('database.logging'),
      }),
    }),

    UsersModule,
    AuthModule,
    CaslModule,
    OffersModule,
    StudentProfilesModule,
    CompanyProfilesModule,
    SchoolProfilesModule,
    ExperiencesModule,
    ApplicationsModule,
    InterviewSimulationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
