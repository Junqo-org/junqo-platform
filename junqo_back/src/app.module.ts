// Implemented from the official documentation: https://docs.nestjs.com/graphql/quick-start
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import * as path from 'path';
import { UsersModule } from './users/users.module';
import { SequelizeModule } from '@nestjs/sequelize';
import * as fs from 'fs';

function getDbPassword(): string {
  if (process.env.DATABASE_PASSWORD) {
    return process.env.DATABASE_PASSWORD;
  }
  const passwordFile: string =
    process.env.DATABASE_PASSWORD_FILE ?? '../db_password.conf';

  if (passwordFile && fs.existsSync(passwordFile)) {
    return fs.readFileSync(passwordFile, 'utf8');
  }
  throw new Error('No database password provided');
}

@Module({
  imports: [
    UsersModule,
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT) || 5432,
      username: process.env.DATABASE_USER || 'root',
      password: getDbPassword(),
      database: process.env.DATABASE_NAME || 'junqo',
      autoLoadModels: true,
      synchronize: true,
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      typePaths: [
        path.join(
          process.env.GRAPHQL_SCHEMAS_PATH || '../schemas',
          '/**/*.graphql',
        ),
      ],
      // Generate typePaths
      definitions: {
        path: path.join(process.cwd(), 'src', 'graphql.ts'),
      },
      playground: process.env.NODE_ENV === 'production' ? false : true,
    }),
  ],
})
export class AppModule {}
