import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OllamaModelManager } from '../src/model_manager/manager';

vi.mock('ollama', () => {
  const mockModels = {
    models: [
      { name: 'llama2:latest', modified_at: new Date().toISOString(), size: 12345 },
    ],
  };
  return {
    Ollama: vi.fn(() => ({
      list: vi.fn(() => Promise.resolve(mockModels)),
      pull: vi.fn(() => Promise.resolve()),
    })),
  };
});

describe('OllamaModelManager', () => {
  let manager: OllamaModelManager;

  beforeEach(() => {
    manager = new OllamaModelManager();
  });

  it('should list available models', async () => {
    const models = await manager.listModels();
    expect(models).toHaveLength(1);
    expect(models[0].name).toBe('llama2:latest');
  });

  it('should download a new model', async () => {
    await expect(manager.downloadModel('new-model:latest')).resolves.not.toThrow();
  });
});
