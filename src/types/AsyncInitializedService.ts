/**
 * Extend when declaring a service with asyncInitialization: true flag.
 */
export abstract class AsyncInitializedService {
  public initialized: Promise<any>;

  constructor() {
    this.initialized = this.initialize();
  }

  protected abstract initialize(): Promise<any>;
}
