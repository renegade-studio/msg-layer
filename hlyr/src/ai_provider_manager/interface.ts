export interface AIProvider {
  initialize(config: unknown): Promise<void>;
  request(request: unknown): Promise<unknown>;
  getName(): string;
}
