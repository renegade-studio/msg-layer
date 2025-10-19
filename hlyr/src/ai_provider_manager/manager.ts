import { AIProvider } from './interface';
import { OllamaProvider } from './ollama';
import { LMStudioProvider } from './lmstudio';
import { TogetherAIProvider } from './together';
import { ConfigService } from '../configService';
import logger from '../logger';

type ProviderName = 'ollama' | 'lmstudio' | 'togetherai';

export class AIProviderManager {
  private providers: Map<ProviderName, AIProvider>;
  private activeProvider?: AIProvider;
  private configService: ConfigService;

  constructor(configService: ConfigService) {
    this.configService = configService;
    this.providers = new Map();
    this.providers.set('ollama', new OllamaProvider());
    this.providers.set('lmstudio', new LMStudioProvider());
    this.providers.set('togetherai', new TogetherAIProvider());
  }

  async setActiveProvider(name: ProviderName, config: any): Promise<void> {
    const provider = this.providers.get(name);
    if (!provider) {
      throw new Error(`Provider ${name} not found.`);
    }
    await provider.initialize(config);
    this.activeProvider = provider;
  }

  getActiveProvider(): AIProvider | undefined {
    return this.activeProvider;
  }

  async request(request: any): Promise<any> {
    if (!this.activeProvider) {
      throw new Error('No active AI provider is set.');
    }
    return this.activeProvider.request(request);
  }
}
