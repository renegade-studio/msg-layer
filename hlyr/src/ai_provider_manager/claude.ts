import { AIProvider } from './interface';
import Anthropic from '@anthropic-ai/sdk';
import { MessageParam } from '@anthropic-ai/sdk/resources';

export class ClaudeProvider implements AIProvider {
  private anthropic: Anthropic;
  private config: any;

  constructor() {}

  async initialize(config: any): Promise<void> {
    if (!config.apiKey) {
      throw new Error('Claude provider requires an API key.');
    }
    this.config = config;
    this.anthropic = new Anthropic({ apiKey: config.apiKey });
  }

  async request(request: { messages: MessageParam[] }): Promise<any> {
    if (!this.config || !this.config.model) {
      throw new Error('Claude provider is not configured with a model.');
    }
    const response = await this.anthropic.messages.create({
      model: this.config.model,
      max_tokens: this.config.maxTokens || 1024,
      messages: request.messages,
    });
    return response;
  }

  async *requestStream(request: { messages: MessageParam[] }): AsyncIterable<string> {
    if (!this.config || !this.config.model) {
      throw new Error('Claude provider is not configured with a model.');
    }
    const stream = this.anthropic.messages.stream({
      model: this.config.model,
      max_tokens: this.config.maxTokens || 1024,
      messages: request.messages,
    });
    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
        yield chunk.delta.text;
      }
    }
  }

  getName(): string {
    return 'Claude';
  }
}
