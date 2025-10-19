import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OllamaProvider } from '../src/ai_provider_manager/ollama';
import { LMStudioProvider } from '../src/ai_provider_manager/lmstudio';
import { TogetherAIProvider } from '../src/ai_provider_manager/together';
import { AIProvider } from '../src/ai_provider_manager/interface';

// Mock the external dependencies
vi.mock('ollama', () => ({
  Ollama: vi.fn(() => ({
    chat: vi.fn(() => Promise.resolve({ message: { content: 'Ollama response' } })),
  })),
}));

vi.mock('openai', () => ({
  default: vi.fn(() => ({
    chat: {
      completions: {
        create: vi.fn(() => Promise.resolve({ choices: [{ message: { content: 'OpenAI response' } }] })),
      },
    },
  })),
}));


describe('AI Provider Manager', () => {
  describe('OllamaProvider', () => {
    let provider: AIProvider;

    beforeEach(() => {
      provider = new OllamaProvider();
    });

    it('should initialize and get the provider name', async () => {
      await provider.initialize({ model: 'llama2' });
      expect(provider.getName()).toBe('Ollama');
    });

    it('should make a request to Ollama', async () => {
      await provider.initialize({ model: 'llama2' });
      const response = await provider.request({ messages: [{ role: 'user', content: 'Hello' }] });
      expect(response).toEqual({ message: { content: 'Ollama response' } });
    });

    it('should throw an error if not configured', async () => {
      await expect(provider.request({ messages: [{ role: 'user', content: 'Hello' }] })).rejects.toThrow(
        'Ollama provider is not configured with a model.'
      );
    });
  });

  describe('LMStudioProvider', () => {
    let provider: AIProvider;

    beforeEach(() => {
      provider = new LMStudioProvider();
    });

    it('should initialize and get the provider name', async () => {
      await provider.initialize({ model: 'lmstudio-model' });
      expect(provider.getName()).toBe('LMStudio');
    });

    it('should make a request to LMStudio', async () => {
      await provider.initialize({ model: 'lmstudio-model' });
      const response = await provider.request({ messages: [{ role: 'user', content: 'Hello' }] });
      expect(response).toEqual({ choices: [{ message: { content: 'OpenAI response' } }] });
    });

    it('should throw an error if not configured', async () => {
      await expect(provider.request({ messages: [{ role: 'user', content: 'Hello' }] })).rejects.toThrow(
        'LMStudio provider is not configured with a model.'
      );
    });
  });

  describe('TogetherAIProvider', () => {
    let provider: AIProvider;

    beforeEach(() => {
      provider = new TogetherAIProvider();
    });

    it('should initialize and get the provider name', async () => {
      await provider.initialize({ apiKey: 'test-key', model: 'together-model' });
      expect(provider.getName()).toBe('TogetherAI');
    });

    it('should make a request to TogetherAI', async () => {
      await provider.initialize({ apiKey: 'test-key', model: 'together-model' });
      const response = await provider.request({ messages: [{ role: 'user', content: 'Hello' }] });
      expect(response).toEqual({ choices: [{ message: { content: 'OpenAI response' } }] });
    });

    it('should throw an error if not configured', async () => {
      await expect(provider.request({ messages: [{ role: 'user', content: 'Hello' }] })).rejects.toThrow(
        'Together AI provider is not configured with a model.'
      );
    });

     it('should throw an error if api key is missing', async () => {
      await expect(provider.initialize({ model: 'together-model' })).rejects.toThrow(
        'Together AI provider requires an API key.'
      );
    });
  });
});

import { AIProviderManager } from '../src/ai_provider_manager/manager';

describe('AIProviderManager', () => {
  let manager: AIProviderManager;

  beforeEach(() => {
    manager = new AIProviderManager();
  });

  it('should set and get an active provider', async () => {
    await manager.setActiveProvider('ollama', { model: 'llama2' });
    const activeProvider = manager.getActiveProvider();
    expect(activeProvider).toBeInstanceOf(OllamaProvider);
    expect(activeProvider?.getName()).toBe('Ollama');
  });

  it('should throw an error for an unknown provider', async () => {
    // @ts-expect-error - Testing invalid provider name
    await expect(manager.setActiveProvider('unknown', {})).rejects.toThrow(
      'Provider unknown not found.'
    );
  });

  it('should make a request through the active provider', async () => {
    await manager.setActiveProvider('ollama', { model: 'llama2' });
    const response = await manager.request({ messages: [{ role: 'user', content: 'Hello' }] });
    expect(response).toEqual({ message: { content: 'Ollama response' } });
  });

  it('should throw an error if no active provider is set', async () => {
    await expect(manager.request({ messages: [{ role: 'user', content: 'Hello' }] })).rejects.toThrow(
      'No active AI provider is set.'
    );
  });
});
