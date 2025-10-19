export interface Model {
  name: string;
  modified_at: string;
  size: number;
}

export interface ModelManager {
  listModels(): Promise<Model[]>;
  downloadModel(modelName: string): Promise<void>;
  updateModel(modelName: string): Promise<void>;
}
