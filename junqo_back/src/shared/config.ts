import 'dotenv/config';
import { Algorithm } from 'jsonwebtoken';
import { Logger } from '@nestjs/common';
import { Dialect } from 'sequelize';
import * as path from 'path';
import * as fs from 'fs';

const PORT_MIN = 1;
const PORT_MAX = 65535;

class Config {
  private static instance: Config;

  // General config
  public readonly NODE_ENV: string = process.env.NODE_ENV;
  public readonly BACK_PORT: number = parseInt(process.env.BACK_PORT ?? '4200');
  public readonly CORS_ORIGINS = process.env.CORS_ORIGINS?.split(',') || /.*/;

  // JWT config
  public readonly HASH_ALGORITHM: Algorithm = 'HS256';
  public readonly JWT_EXPIRE_DELAY: string = '1w'; // TODO: change to needs
  public readonly JWT_ISSUER: string = 'junqo-auth';

  // Database config
  public readonly DB_PASSWORD: string = this.getDbPassword();
  public readonly DATABASE_DIALECT: Dialect = 'postgres';
  public readonly DATABASE_SYNCHRONIZE: boolean = true; // TODO: use migration instead, set to false on production
  public readonly DATABASE_HOST: string =
    process.env.DATABASE_HOST || 'localhost';
  public readonly DATABASE_PORT: number =
    parseInt(process.env.DATABASE_PORT) || 5432;
  public readonly DATABASE_USER: string = process.env.DATABASE_USER || 'junqo';
  public readonly DATABASE_NAME: string = process.env.DATABASE_NAME || 'junqo';

  // Graphql config
  public readonly GRAPHQL_TYPE_PATHS: string[] = [
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
  ];
  public readonly GRAPHQL_DEFINITIONS_PATH: string = path.join(
    process.cwd(),
    'src',
    'graphql.schema.ts',
  );

  private constructor() {
    if (
      Number.isNaN(this.BACK_PORT) ||
      this.BACK_PORT < PORT_MIN ||
      this.BACK_PORT > PORT_MAX
    ) {
      throw new Error(`Invalid port number: ${this.BACK_PORT}`);
    }
  }

  public static getInstance(): Config {
    if (!Config.instance) {
      Config.instance = new Config();
    }
    return Config.instance;
  }

  private validatePassword(password: string): string {
    if (!password) {
      throw new Error(
        process.env.NODE_ENV === 'production'
          ? 'Invalid database configuration'
          : 'Empty password provided',
      );
    }
    return password.split('\n')[0].trim();
  }

  private getDbPassword(): string {
    let passwordFile: string = undefined;
    const logger = new Logger('DatabasePassword');

    if (process.env.DATABASE_PASSWORD) {
      if (process.env.NODE_ENV === 'development') {
        logger.log('Database password loaded from environment variable');
      }
      return this.validatePassword(process.env.DATABASE_PASSWORD);
    }

    if (process.env.DATABASE_PASSWORD_FILE) {
      passwordFile = path.resolve(process.env.DATABASE_PASSWORD_FILE);
    } else {
      passwordFile = path.join(process.cwd(), '..', 'db_password.conf');
    }
    if (passwordFile && fs.existsSync(passwordFile)) {
      let password = fs.readFileSync(passwordFile, 'utf8');

      password = this.validatePassword(password);
      if (process.env.NODE_ENV === 'development') {
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
}

export const config = Config.getInstance();
