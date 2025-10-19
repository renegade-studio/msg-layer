import { cosmiconfig } from 'cosmiconfig';
import * as yaml from 'js-yaml';
import deepmerge from 'deepmerge';

const MODULE_NAME = 'humanlayer';

export interface AppConfig {
  activeProvider: 'ollama' | 'lmstudio' | 'togetherai' | 'claude' | 'gemini' | 'qwen' | 'codex';
  failoverProvider?: 'ollama' | 'lmstudio' | 'togetherai' | 'claude' | 'gemini' | 'qwen' | 'codex';
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
    claude: {
      apiKey: string;
      model: string;
    };
    gemini: {
      apiKey: string;
      model: string;
    };
    qwen: {
      apiKey: string;
      model: string;
    };
    codex: {
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
    this.config = {
      activeProvider: 'ollama',
      failoverProvider: undefined,
      providers: {
        ollama: { host: 'http://localhost:11434', model: 'llama2' },
        lmstudio: { baseURL: 'http://localhost:1234/v1', model: 'lmstudio-model' },
        togetherai: { apiKey: '', model: '' },
        claude: { apiKey: '', model: 'claude-3-opus-20240229' },
        gemini: { apiKey: '', model: 'gemini-pro' },
        qwen: { apiKey: '', model: 'qwen-turbo' },
        codex: { apiKey: '', model: 'code-davinci-002' },
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
    if (process.env.HUMANLAYER_ACTIVE_PROVIDER) {
      this.config.activeProvider = process.env.HUMANLAYER_ACTIVE_PROVIDER as any;
    }
    if (process.env.HUMANLAYER_FAILOVER_PROVIDER) {
      this.config.failoverProvider = process.env.HUMANLAYER_FAILOVER_PROVIDER as any;
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
    if (process.env.HUMANLAYER_CLAUDE_APIKEY) {
      this.config.providers.claude.apiKey = process.env.HUMANLAYER_CLAUDE_APIKEY;
    }
    if (process.env.HUMANLAYER_CLAUDE_MODEL) {
      this.config.providers.claude.model = process.env.HUMANLAYER_CLAUDE_MODEL;
    }
    if (process.env.HUMANLAYER_GEMINI_APIKEY) {
      this.config.providers.gemini.apiKey = process.env.HUMANLAYER_GEMINI_APIKEY;
    }
    if (process.env.HUMANLAYER_GEMINI_MODEL) {
      this.config.providers.gemini.model = process.env.HUMANLAYER_GEMINI_MODEL;
    }
    if (process.env.HUMANLAYER_QWEN_APIKEY) {
      this.config.providers.qwen.apiKey = process.env.HUMANLAYER_QWEN_APIKEY;
    }
    if (process.env.HUMANLAYER_QWEN_MODEL) {
      this.config.providers.qwen.model = process.env.HUMANLAYER_QWEN_MODEL;
    }
    if (process.env.HUMANLAYER_CODEX_APIKEY) {
      this.config.providers.codex.apiKey = process.env.HUMANLAYER_CODEX_APIKEY;
    }
    if (process.env.HUMANLAYER_CODEX_MODEL) {
      this.config.providers.codex.model = process.env.HUMANLAYER_CODEX_MODEL;
    }
  }

  get<T>(key: keyof AppConfig): T {
    return this.config[key] as T;
  }

  getAll(): AppConfig {
    return this.config;
  }
}
