/**
 * Thrown when ContainerRegistry cannot register the given container.
 */
export class CannotRegisterContainerError extends Error {
  public name = 'CannotRegisterContainerError';

  get message(): string {
    return this._message;
  }

  constructor(private _message: string) {
    super();
  }
}
