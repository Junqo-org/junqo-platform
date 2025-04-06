import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import {
  appConfig,
  dbConfig,
  jwtConfig,
} from './config.service';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true, // Make the config module available app-wide
      load: [appConfig, dbConfig, jwtConfig], // Load our configuration
      cache: true, // Enable caching for better performance
      envFilePath: ['.env.local', '.env'], // Load env vars from files
      expandVariables: true, // Allow variables to refer to each other
    }),
  ],
  exports: [NestConfigModule],
})
export class ConfigModule {}
