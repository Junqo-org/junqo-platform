import { ChatgptService } from './chat-gpt-api.service';
import * as dotenv from 'dotenv';
import * as readline from 'readline';

export async function IAinterview(app: any) {
  dotenv.config();
  const chatgptService = app.get(ChatgptService);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const askQuestionFromAI = async (question: string) => {
    rl.question(question + '\n> ', async (userResponse: string) => {
      const chatGptResponse =
        await chatgptService.simulateInterview(userResponse);
      askQuestionFromAI(chatGptResponse);
    });
  };

  const initialQuestion = "Bonjour, prêt pour commencer l'entretien ?";
  askQuestionFromAI(initialQuestion);
}
