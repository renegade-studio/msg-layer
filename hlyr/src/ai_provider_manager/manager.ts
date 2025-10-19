import { AIProvider } from './interface';
import { OllamaProvider } from './ollama';
import { LMStudioProvider } from './lmstudio';
import { TogetherAIProvider } from './together';
import { ClaudeProvider } from './claude';
import { GeminiProvider } from './gemini';
import { QwenProvider } from './qwen';
import { CodexProvider } from './codex';
import { ConfigService } from '../configService';
import logger from '../logger';

type ProviderName = 'ollama' | 'lmstudio' | 'togetherai' | 'claude' | 'gemini' | 'qwen' | 'codex';

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
    this.providers.set('claude', new ClaudeProvider());
    this.providers.set('gemini', new GeminiProvider());
    this.providers.set('qwen', new QwenProvider());
    this.providers.set('codex', new CodexProvider());
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
    try {
      return await this.activeProvider.request(request);
    } catch (error) {
      logger.warn(`Active provider failed with error: ${error.message}. Checking for failover.`);
      const failoverProviderName = this.configService.get<ProviderName>('failoverProvider');
      if (failoverProviderName) {
        const failoverProvider = this.providers.get(failoverProviderName);
        const failoverConfig = this.configService.get<any>('providers')[failoverProviderName];
        if (failoverProvider && failoverConfig) {
           logger.info(`Attempting to failover to provider: ${failoverProviderName}`);
          await failoverProvider.initialize(failoverConfig);
          return failoverProvider.request(request);
        }
      }
      logger.error(`Failover not configured or failed. Rethrowing original error.`);
      throw error;
    }
  }

  async *requestStream(request: any): AsyncIterable<string> {
    if (!this.activeProvider) {
      throw new Error('No active AI provider is set.');
    }
    try {
      if (!this.activeProvider.requestStream) {
        throw new Error('Active provider does not support streaming.');
      }
      for await (const chunk of this.activeProvider.requestStream(request)) {
        yield chunk;
      }
    } catch (error) {
      logger.warn(`Active provider failed with error: ${error.message}. Checking for failover.`);
      const failoverProviderName = this.configService.get<ProviderName>('failoverProvider');
      if (failoverProviderName) {
        const failoverProvider = this.providers.get(failoverProviderName);
        const failoverConfig = this.configService.get<any>('providers')[failoverProviderName];
        if (failoverProvider && failoverConfig && failoverProvider.requestStream) {
          logger.info(`Attempting to failover to provider: ${failoverProviderName}`);
          await failoverProvider.initialize(failoverConfig);
          for await (const chunk of failoverProvider.requestStream(request)) {
            yield chunk;
          }
          return;
        }
      }
      logger.error(`Failover not configured or failed. Rethrowing original error.`);
      throw error;
    }
  }
}
