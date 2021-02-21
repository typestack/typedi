import { ContainerRegistry } from '../container-registry.class';
import { Token } from '../token.class';
import { CannotInjectValueError } from '../error/cannot-inject-value.error';
import { ServiceIdentifier } from '../types/service-identifier.type';
import { Constructable } from '../types/constructable.type';
import { resolveToTypeWrapper } from '../utils/resolve-to-type-wrapper.util';

/**
 * Injects a service into a class property or constructor parameter.
 */
export function Inject(): Function;
export function Inject(typeFn: (type?: never) => Constructable<unknown>): Function;
export function Inject(serviceName?: string): Function;
export function Inject(token: Token<unknown>): Function;
export function Inject(
  typeOrIdentifier?: ((type?: never) => Constructable<unknown>) | ServiceIdentifier<unknown>
): ParameterDecorator | PropertyDecorator {
  return function (target: Object, propertyName: string | Symbol, index?: number): void {
    const typeWrapper = resolveToTypeWrapper(typeOrIdentifier, target, propertyName, index);

    /** If no type was inferred, or the general Object type was inferred we throw an error. */
    if (typeWrapper === undefined || typeWrapper.eagerType === undefined || typeWrapper.eagerType === Object) {
      throw new CannotInjectValueError(target as Constructable<unknown>, propertyName as string);
    }

    ContainerRegistry.defaultContainer.registerHandler({
      object: target as Constructable<unknown>,
      propertyName: propertyName as string,
      index: index,
      value: containerInstance => {
        const evaluatedLazyType = typeWrapper.lazyType();

        /** If no type was inferred lazily, or the general Object type was inferred we throw an error. */
        if (evaluatedLazyType === undefined || evaluatedLazyType === Object) {
          throw new CannotInjectValueError(target as Constructable<unknown>, propertyName as string);
        }

        return containerInstance.get<unknown>(evaluatedLazyType);
      },
    });
  };
}
