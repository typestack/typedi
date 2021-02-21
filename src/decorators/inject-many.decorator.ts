import { ContainerRegistry } from '../container-registry.class';
import { Token } from '../token.class';
import { CannotInjectValueError } from '../error/cannot-inject-value.error';
import { resolveToTypeWrapper } from '../utils/resolve-to-type-wrapper.util';
import { Constructable } from '../types/constructable.type';
import { ServiceIdentifier } from '../types/service-identifier.type';

/**
 * Injects a list of services into a class property or constructor parameter.
 */
export function InjectMany(): Function;
export function InjectMany(type?: (type?: any) => Function): Function;
export function InjectMany(serviceName?: string): Function;
export function InjectMany(token: Token<any>): Function;
export function InjectMany(
  typeOrIdentifier?: ((type?: never) => Constructable<unknown>) | ServiceIdentifier<unknown>
): Function {
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

        return containerInstance.getMany<unknown>(evaluatedLazyType);
      },
    });
  };
}
