import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ResourceMonitorService } from '../src/resource_monitor/service';
import * as si from 'systeminformation';

// Mock the external dependency
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
    expect(usage).toHaveProperty('memory');
    expect(usage).toHaveProperty('disk');

    expect(usage.cpu.manufacturer).toBe('Intel');
    expect(usage.memory.total).toBe(16 * 1024 ** 3);
    expect(usage.disk[0].fs).toBe('/dev/sda1');
  });

  it('should call the underlying systeminformation functions', async () => {
    await service.getUsage();
    expect(si.cpu).toHaveBeenCalled();
    expect(si.mem).toHaveBeenCalled();
    expect(si.fsSize).toHaveBeenCalled();
  });
});
