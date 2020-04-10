/**
 * Thrown when user improperly uses the asyncInitialization Service option.
 */
export class MissingInitializedPromiseError extends Error {
  name = 'MissingInitializedPromiseError';

  // TODO: User proper type
  constructor(value: { name: string; initialized: boolean }) {
    super(
      (value.initialized
        ? `asyncInitialization: true was used, but ${value.name}#initialized is not a Promise. `
        : `asyncInitialization: true was used, but ${value.name}#initialized is undefined. `) +
        `You will need to either extend the abstract AsyncInitializedService class, or assign ` +
        `${value.name}#initialized to a Promise in your class' constructor that resolves when all required ` +
        `initialization is complete.`
    );
    Object.setPrototypeOf(this, MissingInitializedPromiseError.prototype);
  }
}
