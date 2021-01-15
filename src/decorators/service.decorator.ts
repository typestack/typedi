import { Container } from '../container.class';
import { Token } from '../token.class';
import { ServiceMetadata } from '../interfaces/service-metadata.interface.';
import { ServiceOptions } from '../interfaces/service-options.interface';
import { EMPTY_VALUE } from '../empty.const';
import { Constructable } from '../types/constructable.type';

/**
 * Marks class as a service that can be injected using Container.
 */
export function Service(): Function;

/**
 * Marks class as a service that can be injected using Container.
 */
export function Service(name: string): Function;

/**
 * Marks class as a service that can be injected using Container.
 */
export function Service<T = unknown>(token: Token<unknown>): Function;

/**
 * Marks class as a service that can be injected using Container.
 */
export function Service<T = unknown>(options?: ServiceOptions<T>): Function;

/**
 * Marks class as a service that can be injected using container.
 */
export function Service<T>(optionsOrServiceIdentifier?: ServiceOptions<T> | Token<any> | string): ClassDecorator {
  return targetConstructor => {
    const serviceMetadata: ServiceMetadata<T> = {
      id: targetConstructor,
      // TODO: Let's investigate why we receive Function type instead of a constructable.
      type: (targetConstructor as unknown) as Constructable<T>,
      factory: undefined,
      multiple: false,
      global: false,
      eager: false,
      transient: false,
      value: EMPTY_VALUE,
    };

    if (optionsOrServiceIdentifier instanceof Token || typeof optionsOrServiceIdentifier === 'string') {
      /** We received a Token or string ID. */
      serviceMetadata.id = optionsOrServiceIdentifier;
    } else if (optionsOrServiceIdentifier) {
      /** We received a ServiceOptions object. */
      serviceMetadata.id = optionsOrServiceIdentifier.id || targetConstructor;
      serviceMetadata.factory = optionsOrServiceIdentifier.factory || undefined;
      serviceMetadata.multiple = optionsOrServiceIdentifier.multiple || false;
      serviceMetadata.global = optionsOrServiceIdentifier.global || false;
      serviceMetadata.eager = optionsOrServiceIdentifier.eager || false;
      serviceMetadata.transient = optionsOrServiceIdentifier.transient || false;
    }

    Container.set(serviceMetadata);
  };
}
