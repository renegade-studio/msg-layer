import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QwenProvider } from '../src/ai_provider_manager/qwen';
import OpenAI from 'openai';

// Mock the external dependency
const mockOpenAICreate = vi.fn(() => Promise.resolve({ choices: [{ message: { content: 'Qwen response' } }] }));

vi.mock('openai', () => ({
  default: vi.fn(() => ({
    chat: {
      completions: {
        create: mockOpenAICreate,
      },
    },
  })),
}));

describe('QwenProvider', () => {
  let provider: QwenProvider;

  beforeEach(() => {
    provider = new QwenProvider();
    vi.clearAllMocks();
  });

  it('should initialize and get the provider name', async () => {
    await provider.initialize({ apiKey: 'test-key', model: 'qwen-model' });
    expect(provider.getName()).toBe('Qwen');
  });

  it('should make a request to Qwen', async () => {
    await provider.initialize({ apiKey: 'test-key', model: 'qwen-model' });
    const response = await provider.request({ messages: [{ role: 'user', content: 'Hello' }] });
    expect(response.choices[0].message.content).toBe('Qwen response');
  });

  it('should throw an error if not configured with a model', async () => {
    await provider.initialize({ apiKey: 'test-key' });
    await expect(provider.request({ messages: [{ role: 'user', content: 'Hello' }] })).rejects.toThrow(
      'Qwen provider is not configured with a model.'
    );
  });

  it('should throw an error if api key is missing', async () => {
    await expect(provider.initialize({ model: 'qwen-model' })).rejects.toThrow(
      'Qwen provider requires an API key.'
    );
  });
});
