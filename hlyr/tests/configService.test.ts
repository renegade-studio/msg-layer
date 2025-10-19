import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ConfigService } from '../src/configService';

// Create a mock search function that we can control in each test
const mockSearch = vi.fn();

// Mock the external dependency
vi.mock('cosmiconfig', () => ({
  cosmiconfig: vi.fn(() => ({
    search: mockSearch,
  })),
}));

describe('ConfigService', () => {
  let service: ConfigService;
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    // Reset the mock before each test to ensure test isolation
    mockSearch.mockClear();
    service = new ConfigService();
    originalEnv = { ...process.env };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should load default configuration when no file is found', async () => {
    // Mock cosmiconfig finding nothing
    mockSearch.mockResolvedValue(null);
    await service.loadConfig();

    const config = service.getAll();
    expect(config.activeProvider).toBe('ollama');
    expect(config.providers.ollama.model).toBe('llama2');
  });

  it('should load and merge configuration from a YAML file', async () => {
    const mockYamlConfig = {
      activeProvider: 'lmstudio',
      providers: {
        lmstudio: { model: 'custom-lmstudio-model' },
      },
    };

    mockSearch.mockResolvedValue({ config: mockYamlConfig, filepath: '/fake/path.yml' });

    await service.loadConfig();
    const config = service.getAll();

    // Check that the value from the YAML file is used
    expect(config.activeProvider).toBe('lmstudio');
    // Check that the deep merge worked and the default ollama config is still present
    expect(config.providers.ollama.model).toBe('llama2');
    // Check that the model from the YAML is used
    expect(config.providers.lmstudio.model).toBe('custom-lmstudio-model');
  });

  it('should override configuration with environment variables', async () => {
    process.env.HUMANLAYER_ACTIVE_PROVIDER = 'togetherai';
    process.env.HUMANLAYER_TOGETHERAI_MODEL = 'custom-together-model';
    process.env.HUMANLAYER_TOGETHERAI_APIKEY = 'env-api-key';

    // Mock cosmiconfig finding nothing so we only test env vars
    mockSearch.mockResolvedValue(null);

    await service.loadConfig();
    const config = service.getAll();

    expect(config.activeProvider).toBe('togetherai');
    expect(config.providers.togetherai.model).toBe('custom-together-model');
    expect(config.providers.togetherai.apiKey).toBe('env-api-key');
  });

  it('should allow env variables to override YAML config', async () => {
    const mockYamlConfig = {
      activeProvider: 'lmstudio',
      providers: {
        lmstudio: { model: 'yaml-model' },
      },
    };

    mockSearch.mockResolvedValue({ config: mockYamlConfig, filepath: '/fake/path.yml' });

    // Set an env var that should take precedence
    process.env.HUMANLAYER_ACTIVE_PROVIDER = 'ollama';

    await service.loadConfig();
    const config = service.getAll();

    expect(config.activeProvider).toBe('ollama');
    expect(config.providers.lmstudio.model).toBe('yaml-model'); // This should still be from the YAML
  });
});
