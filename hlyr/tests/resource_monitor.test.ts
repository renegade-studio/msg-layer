import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ResourceMonitorService } from '../src/resource_monitor/service';
import * as si from 'systeminformation';

vi.mock('systeminformation', () => ({
  cpu: vi.fn(() => Promise.resolve({ manufacturer: 'Intel', brand: 'i9', speed: 3.6 })),
  mem: vi.fn(() => Promise.resolve({ total: 16 * 1024 ** 3, free: 8 * 1024 ** 3, used: 8 * 1024 ** 3 })),
  fsSize: vi.fn(() => Promise.resolve([{ fs: '/dev/sda1', size: 512 * 1024 ** 3, used: 256 * 1024 ** 3 }])),
}));

describe('ResourceMonitorService', () => {
  let service: ResourceMonitorService;

  beforeEach(() => {
    service = new ResourceMonitorService();
  });

  it('should return combined resource usage statistics', async () => {
    const usage = await service.getUsage();
    expect(usage).toHaveProperty('cpu');
    expect(usage.cpu.manufacturer).toBe('Intel');
  });
});
