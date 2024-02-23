import { ContainerIdentifier } from '../types/container-identifier.type';

/**
 * Thrown when requested container was not found.
 */
export class ContainerNotFoundError extends Error {
  public name = 'ContainerNotFoundError';

  /** Normalized identifier name used in the error message. */
  private normalizedIdentifier: string = '<UNKNOWN_IDENTIFIER>';

  get message(): string {
    return (
      `Container with "${this.normalizedIdentifier}" identifier was not found in the container registry. ` +
      `Register it before usage via explicitly calling the "ContainerRegistry.registerContainer" function.`
    );
  }

  constructor(identifier: ContainerIdentifier) {
    super();

    if (typeof identifier === 'string') {
      this.normalizedIdentifier = identifier;
    } else if (typeof identifier === 'symbol') {
      this.normalizedIdentifier = identifier.toString();
    }
  }
}
