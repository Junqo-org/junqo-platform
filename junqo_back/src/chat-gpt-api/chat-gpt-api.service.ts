import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { promises as fs } from 'fs';

@Injectable()
export class ChatgptService {
  private apiKey = process.env.OPENAI_API_KEY;
  private apiUrl = 'https://api.openai.com/v1/chat/completions';

  private async loadPromptFromFile(): Promise<string> {
    try {
      const data = await fs.readFile('src/chat-gpt-api/prompt.json', 'utf8');
      const prompt = JSON.parse(data);
      return prompt.system_message;
    } catch (error) {
      console.error('Erreur lors de la lecture du fichier JSON:', error);
      throw new Error('Impossible de lire le fichier prompt.json');
    }
  }

  async simulateInterview(userMessage: string): Promise<string> {
    try {
      const systemMessage = await this.loadPromptFromFile();

      const response = await axios.post(
        this.apiUrl,
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: systemMessage,
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
      throw new Error("Erreur lors de la communication avec l'API OpenAI");
    }
  }
}
