export interface AIProvider {
  initialize(config: unknown): Promise<void>;
  request(request: unknown): Promise<unknown>;
  requestStream?(request: unknown): AsyncIterable<string>;
  getName(): string;
}
