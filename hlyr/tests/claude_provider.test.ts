import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ClaudeProvider } from '../src/ai_provider_manager/claude';

// Mock the external dependency
const mockMessagesCreate = vi.fn(() =>
  Promise.resolve({ content: [{ text: 'Claude response' }] })
);

vi.mock('@anthropic-ai/sdk', () => ({
  default: vi.fn(() => ({
    messages: {
      create: mockMessagesCreate,
    },
  })),
}));

describe('ClaudeProvider', () => {
  let provider: ClaudeProvider;

  beforeEach(() => {
    provider = new ClaudeProvider();
    vi.clearAllMocks();
  });

  it('should initialize and get the provider name', async () => {
    await provider.initialize({ apiKey: 'test-key', model: 'claude-model' });
    expect(provider.getName()).toBe('Claude');
  });

  it('should make a request to Claude', async () => {
    await provider.initialize({ apiKey: 'test-key', model: 'claude-model' });
    const response = await provider.request({ messages: [{ role: 'user', content: 'Hello' }] });
    expect(response.content[0].text).toBe('Claude response');
  });

  it('should throw an error if not configured with a model', async () => {
    await provider.initialize({ apiKey: 'test-key' });
    await expect(provider.request({ messages: [{ role: 'user', content: 'Hello' }] })).rejects.toThrow(
      'Claude provider is not configured with a model.'
    );
  });

  it('should throw an error if api key is missing', async () => {
    await expect(provider.initialize({ model: 'claude-model' })).rejects.toThrow(
      'Claude provider requires an API key.'
    );
  });
});
