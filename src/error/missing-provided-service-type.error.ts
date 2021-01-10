import { Token } from '../token.class';
import { ServiceIdentifier } from '../types/service-identifier.type';

/**
 * Thrown when service is registered without type.
 */
export class MissingProvidedServiceTypeError extends Error {
  public name = 'MissingProvidedServiceTypeError';

  /** Normalized identifier name used in the error message. */
  private normalizedIdentifier: string = '<UNKNOWN_IDENTIFIER>';

  get message(): string {
    return `Cannot determine a class of the requesting service: "${this.normalizedIdentifier}".`;
  }

  constructor(identifier: ServiceIdentifier) {
    super();

    if (typeof identifier === 'string') {
      this.normalizedIdentifier = identifier;
    } else if (identifier instanceof Token) {
      this.normalizedIdentifier = `Token<${identifier.name || 'UNSET_NAME'}>`;
    } else if (identifier && (identifier.name || identifier.prototype?.name)) {
      this.normalizedIdentifier =
        `MaybeConstructable<${identifier.name}>` ||
        `MaybeConstructable<${(identifier.prototype as { name: string })?.name}>`;
    }
  }
}
