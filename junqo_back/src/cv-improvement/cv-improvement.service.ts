import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class CvImprovementService {
  private readonly logger = new Logger(CvImprovementService.name);
  private readonly apiKey: string;
  private readonly apiUrl = 'https://api.openai.com/v1/chat/completions';

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!this.apiKey) {
      this.logger.error(
        'OPENAI_API_KEY is not set in the environment variables',
      );
    }
  }

  async analyzeCv(cvContent: string, jobContext?: string): Promise<string> {
    try {
      if (!cvContent || cvContent.trim().length < 10) {
        throw new Error('CV content is too short or empty');
      }

      this.logger.log(
        `Analyzing CV (${cvContent.length} characters)${jobContext ? ` for ${jobContext} position` : ''}`,
      );

      // Construct prompts
      const systemPrompt = jobContext
        ? `Tu es un expert en recrutement et ressources humaines, spécialisé dans l'analyse et l'amélioration de CV pour des postes de ${jobContext}. 
           Analyse le CV fourni et donne des conseils constructifs pour l'améliorer. Sois précis et détaillé dans un format facilement lisible. il faut que tu prennent en compte que le texte est extrait d'un pdf donc si il y a des choses pas cohérentes a la suite, tu ne les prend pas en comptes c'est juste que le pdf n'a pas été bien scanné et aussi tu ne peux pas jugé la mise en page a partir d'un texte donc omet les problemes de mise en page`
        : `Tu es un expert en recrutement et ressources humaines, spécialisé dans l'analyse et l'amélioration de CV. 
           Analyse le CV fourni et donne des conseils constructifs pour l'améliorer. Sois précis et détaillé dans un format facilement lisible. il faut que tu prennent en compte que le texte est extrait d'un pdf donc si il y a des choses pas cohérentes a la suite, tu ne les prend pas en comptes c'est juste que le pdf n'a pas été bien scanné et aussi tu ne peux pas jugé la mise en page a partir d'un texte donc omet les problemes de mise en page`;

      const userPrompt = `Voici le contenu d'un CV à analyser et améliorer:

${cvContent}

Fais une analyse complète de ce CV et propose des améliorations spécifiques et constructives. 
Organise tes recommandations par catégories (contenu, expérience professionnelle, formation, etc.).`;

      // Build messages for OpenAI API
      const messages = [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: userPrompt,
        },
      ];

      // Call OpenAI API with proper error handling
      const response = await axios.post(
        this.apiUrl,
        {
          model: 'gpt-3.5-turbo', // Using gpt-3.5-turbo for reliability
          messages,
          temperature: 0.7,
          max_tokens: 1500,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
          },
          timeout: 30000, // 30 seconds timeout
        },
      );

      // Get and log the response
      const result = response.data.choices[0].message.content;
      this.logger.log(
        `Analysis complete, generated ${result.length} characters of recommendations`,
      );

      return result;
    } catch (error) {
      // Enhanced error logging
      this.logger.error(`Error analyzing CV: ${error.message}`);

      if (error.response) {
        this.logger.error(`API response status: ${error.response.status}`);
        this.logger.error(
          `API response data: ${JSON.stringify(error.response.data)}`,
        );
      } else if (error.request) {
        this.logger.error('No response received from OpenAI API');
      }

      // Throw a more specific error for better client-side handling
      throw new Error(`Failed to analyze CV: ${error.message}`);
    }
  }
}
