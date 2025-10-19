import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CodexProvider } from '../src/ai_provider_manager/codex';
import OpenAI from 'openai';

// Mock the external dependency
const mockOpenAICreate = vi.fn(() => Promise.resolve({ choices: [{ message: { content: 'Codex response' } }] }));

vi.mock('openai', () => ({
  default: vi.fn(() => ({
    chat: {
      completions: {
        create: mockOpenAICreate,
      },
    },
  })),
}));

describe('CodexProvider', () => {
  let provider: CodexProvider;

  beforeEach(() => {
    provider = new CodexProvider();
    vi.clearAllMocks();
  });

  it('should initialize and get the provider name', async () => {
    await provider.initialize({ apiKey: 'test-key', model: 'codex-model' });
    expect(provider.getName()).toBe('Codex');
  });

  it('should make a request to Codex', async () => {
    await provider.initialize({ apiKey: 'test-key', model: 'codex-model' });
    const response = await provider.request({ messages: [{ role: 'user', content: 'Hello' }] });
    expect(response.choices[0].message.content).toBe('Codex response');
  });

  it('should throw an error if not configured with a model', async () => {
    await provider.initialize({ apiKey: 'test-key' });
    await expect(provider.request({ messages: [{ role: 'user', content: 'Hello' }] })).rejects.toThrow(
      'Codex provider is not configured with a model.'
    );
  });

  it('should throw an error if api key is missing', async () => {
    await expect(provider.initialize({ model: 'codex-model' })).rejects.toThrow(
      'Codex provider requires an API key.'
    );
  });
});
