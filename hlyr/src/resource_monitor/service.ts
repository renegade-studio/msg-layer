import * as si from 'systeminformation';

export interface ResourceUsage {
  cpu: si.Systeminformation.CpuData;
  memory: si.Systeminformation.MemData;
  disk: si.Systeminformation.FsSizeData[];
}

export interface IResourceMonitorService {
  getUsage(): Promise<ResourceUsage>;
}

export class ResourceMonitorService implements IResourceMonitorService {
  async getUsage(): Promise<ResourceUsage> {
    const [cpu, memory, disk] = await Promise.all([
      si.cpu(),
      si.mem(),
      si.fsSize(),
    ]);

    return { cpu, memory, disk };
  }
}
