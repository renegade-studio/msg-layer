export interface Model {
  name: string;
  modified_at: string;
  size: number;
}

export interface ModelManager {
  /**
   * Lists the models available locally for a specific provider.
   * @param providerName The name of the provider.
   */
  listModels(providerName: 'ollama'): Promise<Model[]>;

  /**
   * Downloads a model for a specific provider.
   * @param providerName The name of the provider.
   * @param modelName The name of the model to download.
   */
  downloadModel(providerName: 'ollama', modelName: string): Promise<void>;

  /**
   * Updates a model for a specific provider.
   * @param providerName The name of the provider.
   * @param modelName The name of the model to update.
   */
  updateModel(providerName: 'ollama', modelName: string): Promise<void>;
}
