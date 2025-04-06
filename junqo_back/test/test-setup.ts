import * as net from 'net';
import { randomUUID } from 'crypto';
import {
  DockerComposeEnvironment,
  StartedDockerComposeEnvironment,
  Wait,
} from 'testcontainers';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { Sequelize } from 'sequelize-typescript';
import { AppSetup } from '../src/app.setup';
import { NestExpressApplication } from '@nestjs/platform-express';

/**
 * Finds a free port in the specified range
 * @param minPort Lower bound of port range (inclusive)
 * @param maxPort Upper bound of port range (inclusive)
 * @returns A promise that resolves to a free port number
 */
async function findFreePort(
  minPort: number = 10000,
  maxPort: number = 60000,
): Promise<number> {
  return new Promise((resolve, reject) => {
    // Generate a random port within the specified range
    const port = Math.floor(Math.random() * (maxPort - minPort + 1)) + minPort;

    const server = net.createServer();

    server.on('error', () => {
      // Port is not available, try again recursively
      findFreePort(minPort, maxPort).then(resolve).catch(reject);
    });

    server.listen(port, () => {
      // Port is available, close the server and return the port
      server.close(() => {
        resolve(port);
      });
    });
  });
}

/**
 * Creates an isolated test environment with its own database container and app instance
 * @returns The test environment with app and container references
 */
export async function createTestingEnvironment(): Promise<{
  app: INestApplication;
  environment: StartedDockerComposeEnvironment;
  port: number;
  resetDatabase: () => Promise<void>;
  tearDown: () => Promise<void>;
}> {
  // Find a free port for the application and database
  const appPort = await findFreePort(10000, 20000);
  const dbPort = await findFreePort(20001, 30000);

  console.log(
    `Creating test environment with app port: ${appPort}, db port: ${dbPort}`,
  );

  // Set environment variables before loading NestJS app
  // The ConfigService will pick these up when it initializes
  process.env.NODE_ENV = 'test';
  process.env.BACK_PORT = appPort.toString();
  process.env.DATABASE_PORT = dbPort.toString();

  const uniqueSuffix = randomUUID().substring(0, 8);
  const composeFilePath = './test';
  const composeFile = 'docker-compose.test.yaml';
  const dbContainerName = `junqo_db_test_${uniqueSuffix}`;

  const requiredEnvVars = {
    DATABASE_PASSWORD_FILE: 'db_password_test.conf',
    DATABASE_NAME: process.env.DATABASE_NAME || 'junqo_test',
    DATABASE_USER: process.env.DATABASE_USER || 'postgres',
    DB_CONTAINER_NAME: dbContainerName,
    DATABASE_PORT: dbPort.toString(),
    BACK_PORT: appPort.toString(),
  };

  // Validate environment variables
  for (const [key, value] of Object.entries(requiredEnvVars)) {
    if (!value) {
      throw new Error(`Required environment variable ${key} is not set`);
    }
  }

  let environment: StartedDockerComposeEnvironment;

  // Start Docker environment
  try {
    environment = await new DockerComposeEnvironment(
      composeFilePath,
      composeFile,
    )
      .withEnvironment({ ...requiredEnvVars })
      .withProjectName(`junqo-e2e-tests-${uniqueSuffix}`)
      .withWaitStrategy(dbContainerName, Wait.forHealthCheck())
      .up(['db']);

    console.log(`Database container started: ${dbContainerName}`);
  } catch (error) {
    throw new Error(
      `Critical Test Setup Error: when communicating with Docker Engine, verify it is running properly.
Error Message: ${error.message}`,
    );
  }

  // Wait for the environment to be fully ready
  const dbContainer = environment.getContainer(dbContainerName);
  if (!dbContainer) {
    throw new Error('Database container not found');
  }

  // Create NestJS application
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();
  const app = moduleFixture.createNestApplication();

  await AppSetup(app);
  await app.init();

  // Return both the app and environment for cleanup
  return {
    app,
    environment,
    port: appPort,
    resetDatabase: async () => {
      const sequelize = app.get(Sequelize);
      await sequelize.sync({ force: true });
    },
    tearDown: async () => {
      await app.close();
      await environment.down({ timeout: 10000 });
    },
  };
}
