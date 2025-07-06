import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CvImprovementRequestDto {
  @ApiProperty({
    description: 'Le contenu du CV à analyser',
    example: 'John Doe\nDéveloppeur Web\n10 ans d\'expérience...',
  })
  @IsNotEmpty()
  @IsString()
  cvContent: string;

  @ApiProperty({
    description: 'Le contexte du poste visé (optionnel)',
    example: 'Développeur frontend React',
    required: false,
  })
  @IsOptional()
  @IsString()
  jobContext?: string;
}

export class CvImprovementResponseDto {
  @ApiProperty({
    description: 'Les recommandations d\'amélioration pour le CV',
    example: '1. Ajoutez vos certifications.\n2. Mettez en avant vos compétences techniques...',
  })
  recommendations: string;
} 