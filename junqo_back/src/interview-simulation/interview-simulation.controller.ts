import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
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
      // Log the original error for more detailed debugging on the server side
      console.error('Error in generateInterviewResponse:', error);
      throw new HttpException(
        // Include error message in the response for better client-side info (optional)
        `Failed to generate interview response: ${error.message || error.toString()}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
} 