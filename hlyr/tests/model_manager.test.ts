import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OllamaModelManager } from '../src/model_manager/manager';

// Mock the external dependency
vi.mock('ollama', () => {
  const mockModels = {
    models: [
      { name: 'llama2:latest', modified_at: new Date().toISOString(), size: 12345 },
      { name: 'llama3:latest', modified_at: new Date().toISOString(), size: 67890 },
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
    expect(models).toHaveLength(2);
    expect(models[0].name).toBe('llama2:latest');
  });

  it('should download a new model', async () => {
    // The mock resolves if the call is made, so we just check that it doesn't throw
    await expect(manager.downloadModel('new-model:latest')).resolves.not.toThrow();
  });

  it('should update an existing model', async () => {
    // The mock resolves if the call is made, so we just check that it doesn't throw
    await expect(manager.updateModel('llama2:latest')).resolves.not.toThrow();
  });
});
