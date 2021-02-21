import { Constructable } from '../types/constructable.type';

/**
 * Thrown when a service an async service is requested without being initialized.
 */
export class AsyncInitializationRequiredError extends Error {
  public name = 'AsyncInitializationRequiredError';

  get message(): string {
    return (
      `The "${this.target.constructor.name}" service requires async initialization before in can be injected. ` +
      `Please make sure you call "await Container.waitForServiceInitialization()" before requesting this service.`
    );
  }

  constructor(private target: Constructable<unknown>) {
    super();
  }
}
