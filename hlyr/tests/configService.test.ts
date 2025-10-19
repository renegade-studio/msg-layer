import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ConfigService } from '../src/configService';

const mockSearch = vi.fn();
vi.mock('cosmiconfig', () => ({
  cosmiconfig: vi.fn(() => ({
    search: mockSearch,
  })),
}));

describe('ConfigService', () => {
  let service: ConfigService;
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    mockSearch.mockClear();
    service = new ConfigService();
    originalEnv = { ...process.env };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should load default configuration', async () => {
    mockSearch.mockResolvedValue(null);
    await service.loadConfig();
    const config = service.getAll();
    expect(config.activeProvider).toBe('ollama');
  });

  it('should override with environment variables', async () => {
    process.env.HUMANLAYER_ACTIVE_PROVIDER = 'lmstudio';
    mockSearch.mockResolvedValue(null);
    await service.loadConfig();
    const config = service.getAll();
    expect(config.activeProvider).toBe('lmstudio');
  });
});
