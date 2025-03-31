import { Logger, ValidationPipe } from '@nestjs/common';
import { BadRequestExceptionFilter } from './shared/global-filters/bad-request-exception.filter';
import { ConfigService } from '@nestjs/config';

export async function AppSetup(app) {
  const logger = new Logger('AppSetup');
  const configService = app.get(ConfigService);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.useGlobalFilters(new BadRequestExceptionFilter());
  app.enableCors({
    origin: configService.get('app.corsOrigins'),
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  const port = configService.get('app.port');
  await app.listen(port);
  logger.log(`Application is running on port ${port}`);
}
