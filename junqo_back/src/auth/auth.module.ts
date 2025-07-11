import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants, bcryptConstants } from './constants';
import { AuthService } from './auth.service';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth.guard';
import { UsersModule } from '../users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { StudentProfilesModule } from '../student-profiles/student-profiles.module';
import { CompanyProfilesModule } from '../company-profiles/company-profiles.module';
import { SchoolProfilesModule } from '../school-profiles/school-profiles.module';
import { WsAuthGuard } from './auth.ws-guard';
import { SocketAuthMiddleware } from './socket-auth.middleware';

if (jwtConstants.secret === undefined) {
  throw new Error('JWT_SECRET is not defined, please set it in .env file');
}
if (bcryptConstants.saltOrRounds === undefined) {
  throw new Error(
    'BCRYPT_SALT_OR_ROUNDS is not defined, please set it in .env file',
  );
}

@Module({
  imports: [
    UsersModule,
    StudentProfilesModule,
    CompanyProfilesModule,
    SchoolProfilesModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        global: true,
        secret: jwtConstants.secret,
        signOptions: {
          expiresIn: configService.get('jwt.expireDelay'),
          issuer: configService.get('jwt.issuer'),
          algorithm: configService.get('jwt.algorithm'),
        },
      }),
    }),
  ],
  providers: [
    AuthService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    WsAuthGuard,
    SocketAuthMiddleware,
  ],
  exports: [AuthService, WsAuthGuard, SocketAuthMiddleware, JwtModule],
  controllers: [AuthController],
})
export class AuthModule {}
