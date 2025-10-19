import { Command } from 'commander';
import { ConfigService } from '../configService.js';
import { maskSensitiveValue } from '../config.js';

export async function configShowCommand(this: Command) {
  const options = this.opts();
  const configService = new ConfigService();
  await configService.loadConfig();
  const config = configService.getAll();

  if (options.json) {
    const maskedConfig = { ...config };
    if (maskedConfig.providers.togetherai.apiKey) {
      maskedConfig.providers.togetherai.apiKey = maskSensitiveValue(maskedConfig.providers.togetherai.apiKey);
    }
    console.log(JSON.stringify(maskedConfig, null, 2));
  } else {
    console.log('HumanLayer Configuration:');
    console.log(JSON.stringify(config, null, 2));
  }
}
