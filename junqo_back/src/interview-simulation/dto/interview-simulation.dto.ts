import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class InterviewSimulationRequestDto {
  @ApiProperty({
    description: 'Le message de l\'utilisateur pour la simulation d\'entretien',
    example: 'Pouvez-vous me parler de votre expérience professionnelle ?',
  })
  @IsNotEmpty()
  @IsString()
  message: string;

  @ApiProperty({
    description: 'Le contexte de l\'entretien (optionnel)',
    example: 'Entretien pour un poste de développeur fullstack',
    required: false,
  })
  @IsOptional()
  @IsString()
  context?: string;
}

export class InterviewSimulationResponseDto {
  @ApiProperty({
    description: 'La réponse de l\'IA à la question d\'entretien',
    example: 'J\'ai travaillé pendant 5 ans comme développeur fullstack dans une startup...',
  })
  response: string;
} 