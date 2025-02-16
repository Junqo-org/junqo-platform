// Implemented from the official documentation: https://docs.nestjs.com/graphql/quick-start
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { UsersModule } from './users/users.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuthModule } from './auth/auth.module';
import { CaslModule } from './casl/casl.module';
import { Logger } from '@nestjs/common';
import { UsersRepositoryModule } from './users/repository/users.repository.module';
import * as path from 'path';
import * as fs from 'fs';
import 'dotenv/config';

function validatePassword(password: string): string {
  if (!password) {
    throw new Error(
      process.env.NODE_ENV === 'production'
        ? 'Invalid database configuration'
        : 'Empty password provided',
    );
  }
  return password.split('\n')[0].trim();
}

function getDbPassword(): string {
  let passwordFile: string = undefined;
  const logger = new Logger('DatabasePassword');

  if (process.env.DATABASE_PASSWORD) {
    if (process.env.NODE_ENV !== 'production') {
      logger.log('Database password loaded from environment variable');
    }
    return validatePassword(process.env.DATABASE_PASSWORD);
  }

  if (process.env.DATABASE_PASSWORD_FILE) {
    passwordFile = path.resolve(process.env.DATABASE_PASSWORD_FILE);
  } else {
    passwordFile = path.join(process.cwd(), '..', 'db_password.conf');
  }
  if (passwordFile && fs.existsSync(passwordFile)) {
    let password = fs.readFileSync(passwordFile, 'utf8');

    password = validatePassword(password);
    if (process.env.NODE_ENV !== 'production') {
      logger.log('Database password loaded from file');
    }
    return password;
  }
  throw new Error(
    process.env.NODE_ENV === 'production'
      ? 'Invalid database configuration'
      : 'No database password provided',
  );
}

@Module({
  imports: [
    UsersModule,
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT) || 5432,
      username: process.env.DATABASE_USER || 'junqo',
      password: getDbPassword(),
      database: process.env.DATABASE_NAME || 'junqo',
      autoLoadModels: true,
      synchronize: process.env.NODE_ENV !== 'production',
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
      logging: process.env.NODE_ENV !== 'production',
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      typePaths: [
        (() => {
          const schemaPath = path.resolve(
            process.env.GRAPHQL_SCHEMAS_PATH ||
              path.join(process.cwd(), '..', 'schemas'),
          );
          if (!fs.existsSync(schemaPath)) {
            throw new Error(`GraphQL schema path not found: ${schemaPath}`);
          }
          return path.join(schemaPath, '**/*.graphql');
        })(),
      ],
      // Generate typePaths
      definitions: {
        path: path.join(process.cwd(), 'src', 'graphql.schema.ts'),
        outputAs: 'class',
      },
      playground: process.env.NODE_ENV === 'production' ? false : true,
      debug: process.env.NODE_ENV === 'production' ? false : true,
    }),
    AuthModule,
    CaslModule,
    UsersRepositoryModule,
  ],
})
export class AppModule {}
