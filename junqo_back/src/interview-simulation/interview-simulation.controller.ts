import { Controller, Post, Body, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { InterviewSimulationService } from './interview-simulation.service';
import { InterviewSimulationRequestDto, InterviewSimulationResponseDto } from './dto/interview-simulation.dto';

@ApiTags('interview-simulation')
@Controller('interview-simulation')
export class InterviewSimulationController {
  constructor(private readonly interviewSimulationService: InterviewSimulationService) {}

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Générer une réponse pour une simulation d\'entretien' })
  @ApiResponse({
    status: 200,
    description: 'Réponse générée avec succès',
    type: InterviewSimulationResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Requête invalide',
  })
  @ApiResponse({
    status: 500,
    description: 'Erreur serveur',
  })
  async generateInterviewResponse(
    @Body() interviewRequest: InterviewSimulationRequestDto,
  ): Promise<InterviewSimulationResponseDto> {
    try {
      const response = await this.interviewSimulationService.generateResponse(
        interviewRequest.message,
        interviewRequest.context,
      );
      
      return { response };
    } catch (error) {
      throw new HttpException(
        'Failed to generate interview response',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
} 