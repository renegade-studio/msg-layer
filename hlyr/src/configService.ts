import { cosmiconfig } from 'cosmiconfig';
import * as yaml from 'js-yaml';
import deepmerge from 'deepmerge';

const MODULE_NAME = 'humanlayer';

export interface AppConfig {
  activeProvider: 'ollama' | 'lmstudio' | 'togetherai';
  providers: {
    ollama: {
      host: string;
      model: string;
    };
    lmstudio: {
      baseURL: string;
      model: string;
    };
    togetherai: {
      apiKey: string;
      model: string;
    };
  };
}

const yamlLoader = (filepath: string, content: string) => {
  return yaml.load(content) as object;
};

export class ConfigService {
  private config: AppConfig;

  constructor() {
    // Initialize with a default config
    this.config = {
      activeProvider: 'ollama',
      providers: {
        ollama: { host: 'http://localhost:11434', model: 'llama2' },
        lmstudio: { baseURL: 'http://localhost:1234/v1', model: 'lmstudio-model' },
        togetherai: { apiKey: '', model: '' },
      },
    };
  }

  async loadConfig(): Promise<void> {
    const explorer = cosmiconfig(MODULE_NAME, {
      searchPlaces: [`${MODULE_NAME}.yml`, `${MODULE_NAME}.yaml`],
      loaders: {
        '.yml': yamlLoader,
        '.yaml': yamlLoader,
      },
    });

    const result = await explorer.search();
    if (result && result.config) {
      this.config = deepmerge(this.config, result.config as Partial<AppConfig>);
    }

    this.applyEnvironmentVariableOverrides();
  }

  private applyEnvironmentVariableOverrides(): void {
    // Override with environment variables
    if (process.env.HUMANLAYER_ACTIVE_PROVIDER) {
      this.config.activeProvider = process.env.HUMANLAYER_ACTIVE_PROVIDER as any;
    }
    if (process.env.HUMANLAYER_OLLAMA_HOST) {
      this.config.providers.ollama.host = process.env.HUMANLAYER_OLLAMA_HOST;
    }
    if (process.env.HUMANLAYER_OLLAMA_MODEL) {
      this.config.providers.ollama.model = process.env.HUMANLAYER_OLLAMA_MODEL;
    }
    if (process.env.HUMANLAYER_LMSTUDIO_BASEURL) {
      this.config.providers.lmstudio.baseURL = process.env.HUMANLAYER_LMSTUDIO_BASEURL;
    }
    if (process.env.HUMANLAYER_LMSTUDIO_MODEL) {
      this.config.providers.lmstudio.model = process.env.HUMANLAYER_LMSTUDIO_MODEL;
    }
    if (process.env.HUMANLAYER_TOGETHERAI_APIKEY) {
      this.config.providers.togetherai.apiKey = process.env.HUMANLAYER_TOGETHERAI_APIKEY;
    }
    if (process.env.HUMANLAYER_TOGETHERAI_MODEL) {
      this.config.providers.togetherai.model = process.env.HUMANLAYER_TOGETHERAI_MODEL;
    }
  }

  get<T>(key: keyof AppConfig): T {
    return this.config[key] as T;
  }

  getAll(): AppConfig {
    return this.config;
  }
}
