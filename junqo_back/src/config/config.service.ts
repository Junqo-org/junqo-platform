import 'dotenv/config';
import { registerAs } from '@nestjs/config';
import { Algorithm } from 'jsonwebtoken';
import { Dialect } from 'sequelize';
import * as path from 'path';
import * as fs from 'fs';

const PORT_MIN = 1;
const PORT_MAX = 65535;

const DEVELOPMENT_ENV = 'development';
const PRODUCTION_ENV = 'production';

// Helper function to get database password from file or env
function getDbPassword(): string {
  let passwordFile: string = undefined;

  if (process.env.DATABASE_PASSWORD) {
    return process.env.DATABASE_PASSWORD.split('\n')[0].trim();
  }

  if (process.env.DATABASE_PASSWORD_FILE) {
    passwordFile = path.resolve(process.env.DATABASE_PASSWORD_FILE);
  } else {
    passwordFile = path.join(process.cwd(), '..', 'db_password.conf');
  }

  if (passwordFile && fs.existsSync(passwordFile)) {
    const password = fs.readFileSync(passwordFile, 'utf8');
    return password.split('\n')[0].trim();
  }

  throw new Error(
    process.env.NODE_ENV === PRODUCTION_ENV
      ? 'Invalid database configuration'
      : 'No database password provided',
  );
}

// Helper to validate port number
function validatePort(port: number): number {
  if (isNaN(port) || port < PORT_MIN || port > PORT_MAX) {
    throw new Error(`Invalid port number: ${port}`);
  }
  return port;
}

// Register app configuration
export const appConfig = registerAs('app', () => {
  const backPort = validatePort(parseInt(process.env.BACK_PORT ?? '4200'));
  let corsOrigins: string[] | RegExp | undefined = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',')
    : undefined;

  // Guard: Production must have explicit CORS_ORIGINS
  if (process.env.NODE_ENV === 'production' && !corsOrigins) {
    throw new Error(
      'CORS_ORIGINS must be explicitly set in production environment',
    );
  } else if (!corsOrigins) {
    corsOrigins = /.*/; // Allow all origins in development if not set
  }

  // Disable credentials when using wildcard CORS origins for security
  const isWildcard =
    corsOrigins instanceof RegExp ||
    (Array.isArray(corsOrigins) &&
      corsOrigins.some((origin) => origin === '*'));

  return {
    nodeEnv: process.env.NODE_ENV,
    port: backPort,
    corsOrigins,
    credentials: !isWildcard,
  };
});

// Register JWT configuration
export const jwtConfig = registerAs('jwt', () => ({
  algorithm: 'HS256' as Algorithm,
  expireDelay: '1w',
  issuer: 'junqo-auth',
}));

// Register database configuration
export const dbConfig = registerAs('database', () => ({
  password: getDbPassword(),
  dialect: 'postgres' as Dialect,
  synchronize: true,
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT) || 5432,
  username: process.env.DATABASE_USER || 'junqo',
  database: process.env.DATABASE_NAME || 'junqo',
  logging: process.env.NODE_ENV === DEVELOPMENT_ENV,
}));

// Export constants directly to be used in validators and other non-injectable places
export const JWT_CONSTANTS = {
  algorithm: 'HS256' as Algorithm,
  expireDelay: '1w',
  issuer: 'junqo-auth',
};
