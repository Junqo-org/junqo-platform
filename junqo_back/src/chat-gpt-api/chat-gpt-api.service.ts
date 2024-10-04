import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class ChatgptService {
  private apiKey = process.env.OPENAI_API_KEY;

  private apiUrl = 'https://api.openai.com/v1/chat/completions';

  async simulateInterview(userMessage: string): Promise<string> {
    try {
      const response = await axios.post(
        this.apiUrl,
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'Tu es un recruteur qui mène un entretien pour un poste de développeur. Pose des questions et guide le candidat tout au long du processus.',
            },
            {
              role: 'user',
              content: userMessage,
            },
          ],
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
          },
        },
      );
      const recruiterResponse = response.data.choices[0].message.content;
      return recruiterResponse;
    } catch (error) {
      console.error('Erreur lors de la communication avec OpenAI:', error);
      throw new Error('Erreur lors de la communication avec l\'API OpenAI');
    }
  }
}
