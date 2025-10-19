import { AIProvider } from './interface';
import { Ollama } from 'ollama';

export class OllamaProvider implements AIProvider {
  private ollama: Ollama;
  private config: any;

  constructor() {
    this.ollama = new Ollama({ host: 'http://localhost:11434' });
  }

  async initialize(config: any): Promise<void> {
    this.config = config;
    if (config.host) {
      this.ollama = new Ollama({ host: config.host });
    }
  }

  async request(request: any): Promise<any> {
    if (!this.config || !this.config.model) {
      throw new Error('Ollama provider is not configured with a model.');
    }
    const response = await this.ollama.chat({
      model: this.config.model,
      messages: request.messages,
    });
    return response;
  }

  getName(): string {
    return 'Ollama';
  }
}
