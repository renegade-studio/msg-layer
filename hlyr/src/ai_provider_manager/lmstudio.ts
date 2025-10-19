import { AIProvider } from './interface';
import OpenAI from 'openai';

export class LMStudioProvider implements AIProvider {
  private openai: OpenAI;
  private config: any;

  constructor() {}

  async initialize(config: any): Promise<void> {
    this.config = config;
    this.openai = new OpenAI({
      apiKey: 'not-needed', // LMStudio doesn't require an API key
      baseURL: config.baseURL || 'http://localhost:1234/v1',
    });
  }

  async request(request: any): Promise<any> {
    if (!this.config || !this.config.model) {
      throw new Error('LMStudio provider is not configured with a model.');
    }
    const completion = await this.openai.chat.completions.create({
      model: this.config.model,
      messages: request.messages,
    });
    return completion;
  }

  getName(): string {
    return 'LMStudio';
  }
}
