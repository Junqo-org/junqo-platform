import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CvImprovementService } from './cv-improvement.service';
import { CvImprovementRequestDto, CvImprovementResponseDto } from './dto/cv-improvement.dto';

@ApiTags('cv-improvement')
@Controller('cv-improvement')
export class CvImprovementController {
  constructor(private readonly cvImprovementService: CvImprovementService) {}

  @Post('analyze')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Analyser un CV et fournir des recommandations d\'amélioration' })
  @ApiResponse({
    status: 200,
    description: 'Analyse et recommandations générées avec succès',
    type: CvImprovementResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Requête invalide',
  })
  @ApiResponse({
    status: 500,
    description: 'Erreur serveur',
  })
  async analyzeCv(
    @Body() cvRequest: CvImprovementRequestDto,
  ): Promise<CvImprovementResponseDto> {
    try {
      const recommendations = await this.cvImprovementService.analyzeCv(
        cvRequest.cvContent,
        cvRequest.jobContext,
      );
      
      return { recommendations };
    } catch (error) {
      // Log the original error for more detailed debugging on the server side
      console.error('Error in analyzeCv:', error);
      throw new HttpException(
        `Failed to analyze CV: ${error.message || error.toString()}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
} 