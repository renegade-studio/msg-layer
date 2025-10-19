import { AIProvider } from './interface';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Content } from '@google/generative-ai';

export class GeminiProvider implements AIProvider {
  private genAI: GoogleGenerativeAI;
  private config: any;

  constructor() {}

  async initialize(config: any): Promise<void> {
    if (!config.apiKey) {
      throw new Error('Gemini provider requires an API key.');
    }
    this.config = config;
    this.genAI = new GoogleGenerativeAI(config.apiKey);
  }

  async request(request: { history: Content[], messages: Content[] }): Promise<any> {
    if (!this.config || !this.config.model) {
      throw new Error('Gemini provider is not configured with a model.');
    }
    const model = this.genAI.getGenerativeModel({ model: this.config.model });
    const chat = model.startChat({
      history: request.history,
    });
    const result = await chat.sendMessage(request.messages);
    return result.response;
  }

  async *requestStream(request: { history: Content[], messages: Content[] }): AsyncIterable<string> {
    if (!this.config || !this.config.model) {
      throw new Error('Gemini provider is not configured with a model.');
    }
    const model = this.genAI.getGenerativeModel({ model: this.config.model });
    const chat = model.startChat({
      history: request.history,
    });
    const result = await chat.sendMessageStream(request.messages);
    for await (const chunk of result.stream) {
      yield chunk.text();
    }
  }

  getName(): string {
    return 'Gemini';
  }
}
