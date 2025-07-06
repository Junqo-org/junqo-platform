import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CvImprovementController } from './cv-improvement.controller';
import { CvImprovementService } from './cv-improvement.service';


@Module({
  imports: [ConfigModule],
  controllers: [CvImprovementController],
  providers: [CvImprovementService],
  exports: [CvImprovementService],
})
export class CvImprovementModule {} 