import { Command } from 'commander';
import { ConfigService } from '../configService.js';
import { maskSensitiveValue } from '../config.js';

export async function configShowCommand(this: Command) {
  const options = this.opts();
  const configService = new ConfigService();
  await configService.loadConfig();
  const config = configService.getAll();

  const maskedConfig = { ...config };

  // Mask all provider API keys
  for (const provider in maskedConfig.providers) {
      if (maskedConfig.providers[provider].apiKey) {
        maskedConfig.providers[provider].apiKey = maskSensitiveValue(maskedConfig.providers[provider].apiKey);
      }
  }

  if (options.json) {
    console.log(JSON.stringify(maskedConfig, null, 2));
  } else {
    console.log('HumanLayer Configuration:');
    console.log(JSON.stringify(maskedConfig, null, 2));
  }
}
