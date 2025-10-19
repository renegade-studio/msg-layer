import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AIProviderManager } from '../src/ai_provider_manager/manager';
import { ConfigService } from '../src/configService';
import { OllamaProvider } from '../src/ai_provider_manager/ollama';
import { LMStudioProvider } from '../src/ai_provider_manager/lmstudio';
import { TogetherAIProvider } from '../src/ai_provider_manager/together';
import { ClaudeProvider } from '../src/ai_provider_manager/claude';
import { GeminiProvider } from '../src/ai_provider_manager/gemini';
import { QwenProvider } from '../src/ai_provider_manager/qwen';
import { CodexProvider } from '../src/ai_provider_manager/codex';

// --- Mocks with Streaming Support ---
const mockOllamaChatStream = vi.fn().mockImplementation(async function* () {
  yield { message: { content: 'Ollama ' } };
  yield { message: { content: 'response' } };
});
vi.mock('ollama', () => ({
  Ollama: vi.fn(() => ({
    chat: (options:any) => mockOllamaChatStream(),
  })),
}));

const mockOpenAICreateStream = vi.fn().mockImplementation(async function* () {
  yield { choices: [{ delta: { content: 'OpenAI ' } }] };
  yield { choices: [{ delta: { content: 'response' } }] };
});
vi.mock('openai', () => ({
  default: vi.fn(() => ({
    chat: {
      completions: {
        create: (options:any) => mockOpenAICreateStream(),
      },
    },
  })),
}));

const mockMessagesStream = vi.fn().mockImplementation(async function* () {
  yield { type: 'content_block_delta', delta: { type: 'text_delta', text: 'Claude ' } };
  yield { type: 'content_block_delta', delta: { type: 'text_delta', text: 'response' } };
});
vi.mock('@anthropic-ai/sdk', () => ({
  default: vi.fn(() => ({
    messages: {
      stream: mockMessagesStream,
    },
  })),
}));

const mockSendMessageStream = vi.fn(() => ({
    stream: (async function*() {
        yield { text: () => 'Gemini ' };
        yield { text: () => 'response' };
    })()
}));
const mockChat = {
  sendMessageStream: mockSendMessageStream,
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

describe('Streaming Tests', () => {
    let manager: AIProviderManager;
    let configService: ConfigService;

    beforeEach(() => {
        configService = new ConfigService();
        manager = new AIProviderManager(configService);
        vi.clearAllMocks();
    });

    it('should stream a response from Ollama', async () => {
        const provider = new OllamaProvider();
        await provider.initialize({ model: 'llama2' });
        const stream = provider.requestStream({ messages: [] });
        const chunks = [];
        for await (const chunk of stream) {
            chunks.push(chunk);
        }
        expect(chunks.join('')).toBe('Ollama response');
    });

    it('should failover a streaming request on error', async () => {
        await configService.loadConfig();
        configService.getAll().failoverProvider = 'lmstudio';

        await manager.setActiveProvider('ollama', { model: 'llama2' });

        mockOllamaChatStream.mockImplementationOnce(
           () => (async function*() { throw new Error('Primary provider failed'); })()
        );

        const stream = manager.requestStream({ messages: [] });
        const chunks = [];
        for await (const chunk of stream) {
          chunks.push(chunk);
        }

        expect(chunks.join('')).toBe('OpenAI response');
        expect(mockOllamaChatStream).toHaveBeenCalledTimes(1);
        expect(mockOpenAICreateStream).toHaveBeenCalledTimes(1);
  });
});
