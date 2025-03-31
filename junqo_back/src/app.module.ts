// Implemented from the official documentation: https://docs.nestjs.com/graphql/quick-start
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { UsersModule } from './users/users.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuthModule } from './auth/auth.module';
import { CaslModule } from './casl/casl.module';
import { ProfilesModule } from './profiles/profiles.module';
import { ConfigModule } from './config/config.module';
import { ConfigService } from '@nestjs/config';
import { OffersModule } from './offers/offers.module';

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

    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        typePaths: configService.get('graphql.typePaths'),
        definitions: {
          path: configService.get('graphql.definitionsPath'),
        },
        playground: configService.get('graphql.playground'),
        introspection: configService.get('graphql.introspection'),
      }),
    }),

    UsersModule,
    AuthModule,
    CaslModule,
    ProfilesModule,
    OffersModule,
  ],
})
export class AppModule {}
