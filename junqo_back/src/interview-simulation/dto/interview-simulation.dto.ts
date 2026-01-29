import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class InterviewSimulationRequestDto {
  @ApiProperty({
    description: "Le message de l'utilisateur pour la simulation d'entretien",
    example: 'Pouvez-vous me parler de votre expérience professionnelle ?',
  })
  @IsNotEmpty()
  @IsString()
  message: string;

  @ApiProperty({
    description: "Le contexte de l'entretien (optionnel)",
    example: 'Entretien pour un poste de développeur fullstack',
    required: false,
  })
  @IsOptional()
  @IsString()
  context?: string;
}

export class ChatMessageDto {
  @ApiProperty({
    description: "Le rôle de l'émetteur du message",
    enum: ['user', 'assistant', 'system'],
    example: 'user',
  })
  @IsNotEmpty()
  @IsString()
  role: 'user' | 'assistant' | 'system';

  @ApiProperty({
    description: 'Le contenu du message',
    example: 'Bonjour, je suis intéressé par le poste.',
  })
  @IsNotEmpty()
  @IsString()
  content: string;
}

export class FeedbackRequestDto {
  @ApiProperty({
    description: "L'historique de la conversation jusqu'au message à analyser",
    type: [ChatMessageDto],
  })
  @IsNotEmpty()
  messages: ChatMessageDto[];

  @ApiProperty({
    description: "Le contexte de l'entretien (optionnel)",
    example: 'Entretien pour un poste de développeur fullstack',
    required: false,
  })
  @IsOptional()
  @IsString()
  context?: string;
}

export class InterviewSimulationResponseDto {
  @ApiProperty({
    description: "La réponse de l'IA à la question d'entretien",
    example:
      "J'ai travaillé pendant 5 ans comme développeur fullstack dans une startup...",
  })
  response: string;
}
