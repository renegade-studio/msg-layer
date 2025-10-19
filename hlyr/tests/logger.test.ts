import { describe, it, expect } from 'vitest';
import logger from '../src/logger';
import * as winston from 'winston';
import Transport from 'winston-transport';

// Create a simple mock transport to capture log output
class MockTransport extends Transport {
  public logs: any[] = [];

  constructor(opts?: Transport.TransportStreamOptions) {
    super(opts);
  }

  log(info: any, callback: () => void) {
    this.logs.push(info);
    callback();
  }
}

describe('Logger', () => {
  it('should be a valid winston logger instance', () => {
    expect(logger).toBeInstanceOf(winston.Logger);
  });

  it('should log messages to its transports', () => {
    const mockTransport = new MockTransport();
    logger.add(mockTransport); // Add the mock transport for this test

    try {
      logger.info('This is an info message');
      logger.warn('This is a warning');
      logger.error('This is an error');

      // Check that the mock transport received the logs
      expect(mockTransport.logs).toHaveLength(3);

      // Check message content
      expect(mockTransport.logs[0].message).toBe('This is an info message');

      // Check log levels (winston adds color codes, so we use `toContain`)
      expect(mockTransport.logs[0].level).toContain('info');
      expect(mockTransport.logs[1].level).toContain('warn');
      expect(mockTransport.logs[2].level).toContain('error');
    } finally {
      logger.remove(mockTransport); // Always clean up the transport
    }
  });

  it('should have the correct default log level', () => {
    expect(logger.level).toBe('info');
  });
});
