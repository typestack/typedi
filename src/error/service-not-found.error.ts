import { ServiceIdentifier } from '../types/service-identifier.type';
import { Token } from '../token.class';

/**
 * Thrown when requested service was not found.
 */
export class ServiceNotFoundError extends Error {
  name = 'ServiceNotFoundError';

  constructor(identifier: ServiceIdentifier) {
    super();

    if (typeof identifier === 'string') {
      this.message =
        `Service "${identifier}" was not found, looks like it was not registered in the container. ` +
        `Register it by calling Container.set("${identifier}", ...) before using service.`;
    } else if (identifier instanceof Token && identifier.name) {
      this.message =
        `Service "${identifier.name}" was not found, looks like it was not registered in the container. ` +
        `Register it by calling Container.set before using service.`;
    } else if (identifier instanceof Token) {
      this.message =
        `Service with a given token was not found, looks like it was not registered in the container. ` +
        `Register it by calling Container.set before using service.`;
    }

    Object.setPrototypeOf(this, ServiceNotFoundError.prototype);
  }
}
