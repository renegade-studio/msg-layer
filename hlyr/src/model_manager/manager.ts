import { Model, ModelManager } from './interface';
import { Ollama } from 'ollama';

export class OllamaModelManager implements ModelManager {
  private ollama: Ollama;

  constructor(host: string = 'http://localhost:11434') {
    this.ollama = new Ollama({ host });
  }

  async listModels(): Promise<Model[]> {
    const response = await this.ollama.list();
    return response.models;
  }

  async downloadModel(modelName: string): Promise<void> {
    await this.ollama.pull({ model: modelName, stream: false });
  }

  async updateModel(modelName: string): Promise<void> {
    await this.downloadModel(modelName);
  }
}
