import { AIProvider } from './interface';
import OpenAI from 'openai';

export class CodexProvider implements AIProvider {
  private openai: OpenAI;
  private config: any;

  constructor() {}

  async initialize(config: any): Promise<void> {
    if (!config.apiKey) {
      throw new Error('Codex provider requires an API key.');
    }
    this.config = config;
    this.openai = new OpenAI({
      apiKey: config.apiKey,
      baseURL: 'https://api.openai.com/v1',
    });
  }

  async request(request: any): Promise<any> {
    if (!this.config || !this.config.model) {
      throw new Error('Codex provider is not configured with a model.');
    }
    const completion = await this.openai.chat.completions.create({
      model: this.config.model,
      messages: request.messages,
    });
    return completion;
  }

  async *requestStream(request: any): AsyncIterable<string> {
    if (!this.config || !this.config.model) {
      throw new Error('Codex provider is not configured with a model.');
    }
    const stream = await this.openai.chat.completions.create({
      model: this.config.model,
      messages: request.messages,
      stream: true,
    });
    for await (const chunk of stream) {
      yield chunk.choices[0]?.delta?.content || '';
    }
  }

  getName(): string {
    return 'Codex';
  }
}
