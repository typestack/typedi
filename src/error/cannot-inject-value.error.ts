import { Constructable } from '../types/constructable.type';

/**
 * Thrown when DI cannot inject value into property decorated by @Inject decorator.
 */
export class CannotInjectValueError extends Error {
  public name = 'CannotInjectValueError';

  get message(): string {
    return (
      `Cannot inject value into "${this.target.constructor.name}.${this.propertyName}". ` +
      `Please make sure you setup reflect-metadata properly and you don't use interfaces without service tokens as injection value.`
    );
  }

  constructor(private target: Constructable<unknown>, private propertyName: string) {
    super();
  }
}
