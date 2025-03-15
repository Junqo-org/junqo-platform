// Implemented from the official documentation: https://docs.nestjs.com/graphql/quick-start
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { UsersModule } from './users/users.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuthModule } from './auth/auth.module';
import { CaslModule } from './casl/casl.module';
import { ProfilesModule } from './profiles/profiles.module';
import { config } from './shared/config';
import { OffersModule } from './offers/offers.module';

@Module({
  imports: [
    UsersModule,
    SequelizeModule.forRoot({
      dialect: config.DATABASE_DIALECT,
      host: config.DATABASE_HOST,
      port: config.DATABASE_PORT,
      username: config.DATABASE_USER,
      password: config.DB_PASSWORD,
      database: config.DATABASE_NAME,
      autoLoadModels: true,
      synchronize: config.DATABASE_SYNCHRONIZE,
      retry: {
        max: 10,
        match: [
          /SequelizeConnectionError/,
          /SequelizeConnectionRefusedError/,
          /SequelizeHostNotFoundError/,
          /SequelizeHostNotReachableError/,
          /SequelizeInvalidConnectionError/,
          /SequelizeConnectionTimedOutError/,
        ],
      },
      pool: {
        max: 20,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
      logging: config.NODE_ENV !== 'production',
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      typePaths: config.GRAPHQL_TYPE_PATHS,
      // Generate typePaths
      definitions: {
        path: config.GRAPHQL_DEFINITIONS_PATH,
        outputAs: 'class',
      },
      playground: config.NODE_ENV === 'production' ? false : true,
      debug: config.NODE_ENV === 'production' ? false : true,
    }),
    AuthModule,
    CaslModule,
    ProfilesModule,
    OffersModule,
  ],
})
export class AppModule {}
