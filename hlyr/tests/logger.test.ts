import { describe, it, expect } from 'vitest';
import logger from '../src/logger';
import * as winston from 'winston';
import Transport from 'winston-transport';

class MockTransport extends Transport {
  public logs: any[] = [];
  log(info: any, callback: () => void) {
    this.logs.push(info);
    callback();
  }
}

describe('Logger', () => {
  it('should log messages to its transports', () => {
    const mockTransport = new MockTransport();
    logger.add(mockTransport);

    try {
      logger.info('Test message');
      expect(mockTransport.logs).toHaveLength(1);
      expect(mockTransport.logs[0].message).toBe('Test message');
    } finally {
      logger.remove(mockTransport);
    }
  });
});
