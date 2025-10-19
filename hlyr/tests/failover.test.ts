import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OllamaProvider } from '../src/ai_provider_manager/ollama';
import { AIProviderManager } from '../src/ai_provider_manager/manager';
import { ConfigService } from '../src/configService';

// Mocks
const mockOllamaChat = vi.fn();
vi.mock('ollama', () => ({
  Ollama: vi.fn(() => ({ chat: mockOllamaChat })),
}));

const mockOpenAICreate = vi.fn();
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

  it('should failover to the specified provider on error', async () => {
    // Arrange
    await configService.loadConfig();
    configService.getAll().failoverProvider = 'lmstudio';

    await manager.setActiveProvider('ollama', { model: 'llama2' });

    mockOllamaChat.mockRejectedValueOnce(new Error('Primary provider failed'));
    mockOpenAICreate.mockResolvedValueOnce({ choices: [{ message: { content: 'Failover response' } }] });

    // Act
    const response = await manager.request({ messages: [] });

    // Assert
    expect(response.choices[0].message.content).toBe('Failover response');
    expect(mockOllamaChat).toHaveBeenCalledTimes(1);
    expect(mockOpenAICreate).toHaveBeenCalledTimes(1);
  });

  it('should rethrow the error if failover is not configured', async () => {
    // Arrange
    await manager.setActiveProvider('ollama', { model: 'llama2' });
    mockOllamaChat.mockRejectedValueOnce(new Error('Primary provider failed'));

    // Act & Assert
    await expect(manager.request({ messages: [] })).rejects.toThrow('Primary provider failed');
    expect(mockOllamaChat).toHaveBeenCalledTimes(1);
    expect(mockOpenAICreate).not.toHaveBeenCalled();
  });
});
