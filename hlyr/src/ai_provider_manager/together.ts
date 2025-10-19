import { AIProvider } from './interface';
import OpenAI from 'openai';

export class TogetherAIProvider implements AIProvider {
  private openai: OpenAI;
  private config: any;

  constructor() {}

  async initialize(config: any): Promise<void> {
    if (!config.apiKey) {
      throw new Error('Together AI provider requires an API key.');
    }
    this.config = config;
    this.openai = new OpenAI({
      apiKey: config.apiKey,
      baseURL: 'https://api.together.xyz/v1',
    });
  }

  async request(request: any): Promise<any> {
    if (!this.config || !this.config.model) {
      throw new Error('Together AI provider is not configured with a model.');
    }
    const completion = await this.openai.chat.completions.create({
      model: this.config.model,
      messages: request.messages,
    });
    return completion;
  }

  getName(): string {
    return 'TogetherAI';
  }
}
