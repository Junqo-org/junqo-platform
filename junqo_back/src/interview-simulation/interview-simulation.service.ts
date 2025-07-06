import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class InterviewSimulationService {
  private readonly logger = new Logger(InterviewSimulationService.name);
  private readonly apiKey: string;
  private readonly apiUrl = 'https://api.openai.com/v1/chat/completions';

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!this.apiKey) {
      this.logger.error('OPENAI_API_KEY is not set in the environment variables');
    }
  }

  async generateResponse(message: string, context?: string): Promise<string> {
    try {
      // Construire le système prompt
      const systemPrompt = context 
        ? `Tu es un recruteur conduisant un entretien d\u2019embauche pour un poste de ${context}. Pose des questions pertinentes, évalue les réponses et donne des conseils constructifs.`
        : 'Tu es un recruteur conduisant un entretien d\u2019embauche. Pose des questions pertinentes, évalue les réponses et donne des conseils constructifs.';

      // Construire les messages pour l'API
      const messages = [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: message,
        },
      ];

      // Appeler l'API OpenAI
      const response = await axios.post(
        this.apiUrl,
        {
          model: 'gpt-3.5-turbo',
          messages,
          temperature: 0.7,
          max_tokens: 1500,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
          },
        },
      );

      // Récupérer et retourner la réponse
      return response.data.choices[0].message.content;
    } catch (error) {
      this.logger.error(`Error calling OpenAI API: ${error.message}`);
      if (error.response) {
        this.logger.error(`Response data: ${JSON.stringify(error.response.data)}`);
      }
      throw new Error('Failed to generate interview response');
    }
  }
} 