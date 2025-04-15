import {
  INestApplication,
  Logger,
  RequestMethod,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export async function AppSetup(app: INestApplication<any>) {
  const logger = new Logger('AppSetup');
  const configService = app.get(ConfigService);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.setGlobalPrefix('api/v1', {
    exclude: [
      { path: 'health', method: RequestMethod.GET },
      { path: '/', method: RequestMethod.GET },
    ],
  });

  app.enableCors({
    origin: configService.get('app.corsOrigins'),
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  const config = new DocumentBuilder()
    .addBearerAuth()
    .setTitle('Junqo API')
    .setDescription('The Junqo project API')
    .setVersion('1.0')
    .addTag('junqo')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/v1', app, documentFactory);

  const port = configService.get('app.port');
  await app.listen(port);
  logger.log(`Application is running on port ${port}`);
}
