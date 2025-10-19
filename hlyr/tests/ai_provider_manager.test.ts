import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OllamaProvider } from '../src/ai_provider_manager/ollama';
import { LMStudioProvider } from '../src/ai_provider_manager/lmstudio';
import { TogetherAIProvider } from '../src/ai_provider_manager/together';
import { AIProvider } from '../src/ai_provider_manager/interface';
import { ConfigService } from '../src/configService';
import { AIProviderManager } from '../src/ai_provider_manager/manager';

// Mocks
const mockOllamaChat = vi.fn(() => Promise.resolve({ message: { content: 'Ollama response' } }));
vi.mock('ollama', () => ({
  Ollama: vi.fn(() => ({ chat: mockOllamaChat })),
}));

const mockOpenAICreate = vi.fn(() => Promise.resolve({ choices: [{ message: { content: 'OpenAI response' } }] }));
vi.mock('openai', () => ({
  default: vi.fn(() => ({ chat: { completions: { create: mockOpenAICreate } } })),
}));

describe('AIProviderManager', () => {
  let manager: AIProviderManager;
  let configService: ConfigService;

  beforeEach(() => {
    configService = new ConfigService();
    manager = new AIProviderManager(configService);
    vi.clearAllMocks();
  });

  it('should set and get an active provider', async () => {
    await manager.setActiveProvider('ollama', { model: 'llama2' });
    const activeProvider = manager.getActiveProvider();
    expect(activeProvider).toBeInstanceOf(OllamaProvider);
    expect(activeProvider?.getName()).toBe('Ollama');
  });

  it('should make a request through the active provider', async () => {
    await manager.setActiveProvider('ollama', { model: 'llama2' });
    const response = await manager.request({ messages: [{ role: 'user', content: 'Hello' }] });
    expect(response).toEqual({ message: { content: 'Ollama response' } });
  });
});
