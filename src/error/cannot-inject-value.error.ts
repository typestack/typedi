/**
 * Thrown when DI cannot inject value into property decorated by @Inject decorator.
 */
export class CannotInjectValueError extends Error {
  name = 'CannotInjectValueError';

  constructor(target: Object, propertyName: string) {
    super(
      `Cannot inject value into "${target.constructor.name}.${propertyName}". ` +
        `Please make sure you setup reflect-metadata properly and you don't use interfaces without service tokens as injection value.`
    );
    Object.setPrototypeOf(this, CannotInjectValueError.prototype);
  }
}
