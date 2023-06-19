import { Token } from '../token.class';
import { AnyInjectIdentifier } from '../types/inject-identifier.type';
import { LazyReference } from '../types/lazy-reference.type';
import { TypeWrapper } from '../types/type-wrapper.type';
import { isInjectedFactory } from './is-inject-identifier.util';
import { isLazyReference } from './is-lazy-reference.util';

/**
 * Helper function used in the injection-related decorators to resolve the received identifier to
 * an eager type when possible or to a lazy type when cyclic dependencies are possibly involved.
 *
 * @param typeOrIdentifier a service identifier or a function returning a type acting as service identifier or nothing
 * @param target the class definition of the target of the decorator
 */
export function resolveToTypeWrapper(
  typeOrIdentifier: AnyInjectIdentifier
): TypeWrapper {
  /**
   * ? We want to error out as soon as possible when looking up services to inject, however
   * ? we cannot determine the type at decorator execution when cyclic dependencies are involved
   * ? because calling the received `() => MyType` function right away would cause a JS error:
   * ? "Cannot access 'MyType' before initialization", so we need to execute the function in the handler,
   * ? when the classes are already created. To overcome this, we use a wrapper:
   * ?  - the lazyType is executed in the handler so we never have a JS error
   * ?  - the eagerType is checked when decorator is running and an error is raised if an unknown type is encountered
   */
  let typeWrapper!: TypeWrapper;

  /** If requested type is explicitly set via a string ID or token, we set it explicitly. */
  if (typeOrIdentifier && (typeof typeOrIdentifier === 'string' || typeOrIdentifier instanceof Token || typeof typeOrIdentifier === 'function')) {
    typeWrapper = { eagerType: typeOrIdentifier, lazyType: () => typeOrIdentifier, isFactory: false };
  }

  /** If requested type is an injected factory, we set it explicitly. */
  else if (typeof typeOrIdentifier === 'object' && isInjectedFactory(typeOrIdentifier)) {
    typeWrapper = { eagerType: null, factory: typeOrIdentifier, isFactory: true }
  }

  /** If requested type is explicitly set via a LazyReference, we set it explicitly. */
  else if (typeOrIdentifier && isLazyReference(typeOrIdentifier as object)) {
    /** We set eagerType to null, preventing the raising of the CannotInjectValueError in decorators.  */
    typeWrapper = { eagerType: null, lazyType: () => (typeOrIdentifier as LazyReference<any>).get(), isFactory: false };
  }

  return typeWrapper;
}
