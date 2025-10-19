import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GeminiProvider } from '../src/ai_provider_manager/gemini';

// Mock the external dependency
const mockSendMessage = vi.fn(() =>
  Promise.resolve({ response: { text: () => 'Gemini response' } })
);

const mockChat = {
  sendMessage: mockSendMessage,
};

const mockModel = {
  startChat: vi.fn(() => mockChat),
};

const mockGenAI = {
  getGenerativeModel: vi.fn(() => mockModel),
};

vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: vi.fn(() => mockGenAI),
}));

describe('GeminiProvider', () => {
  let provider: GeminiProvider;

  beforeEach(() => {
    provider = new GeminiProvider();
    vi.clearAllMocks();
  });

  it('should initialize and get the provider name', async () => {
    await provider.initialize({ apiKey: 'test-key', model: 'gemini-model' });
    expect(provider.getName()).toBe('Gemini');
  });

  it('should make a request to Gemini', async () => {
    await provider.initialize({ apiKey: 'test-key', model: 'gemini-model' });
    const response = await provider.request({ history: [], messages: [{ role: 'user', parts: [{text: 'Hello'}] }] });
    expect(response.text()).toBe('Gemini response');
  });

  it('should throw an error if not configured with a model', async () => {
    await provider.initialize({ apiKey: 'test-key' });
    await expect(provider.request({ history: [], messages: [] })).rejects.toThrow(
      'Gemini provider is not configured with a model.'
    );
  });

  it('should throw an error if api key is missing', async () => {
    await expect(provider.initialize({ model: 'gemini-model' })).rejects.toThrow(
      'Gemini provider requires an API key.'
    );
  });
});
