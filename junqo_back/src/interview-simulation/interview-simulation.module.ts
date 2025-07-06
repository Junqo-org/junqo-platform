import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { InterviewSimulationController } from './interview-simulation.controller';
import { InterviewSimulationService } from './interview-simulation.service';

@Module({
  imports: [ConfigModule],
  controllers: [InterviewSimulationController],
  providers: [InterviewSimulationService],
  exports: [InterviewSimulationService],
})
export class InterviewSimulationModule {} 