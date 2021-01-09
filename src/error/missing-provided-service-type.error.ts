/**
 * Thrown when service is registered without type.
 */
export class MissingProvidedServiceTypeError extends Error {
  name = 'MissingProvidedServiceTypeError';

  constructor(identifier: any) {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    super(`Cannot determine a class of the requesting service "${identifier}"`);
    Object.setPrototypeOf(this, MissingProvidedServiceTypeError.prototype);
  }
}
