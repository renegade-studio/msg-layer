export interface AIProvider {
  /**
   * Initializes the AI provider.
   * @param config The configuration for the provider.
   */
  initialize(config: unknown): Promise<void>;

  /**
   * Sends a request to the AI model.
   * @param request The request to send.
   * @returns A promise that resolves with the response from the model.
   */
  request(request: unknown): Promise<unknown>;

  /**
   * Returns the name of the provider.
   */
  getName(): string;
}
