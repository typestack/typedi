/**
 * We have a hard dependency on reflect-metadata package. Without it the
 * dependency lookup won't work, so we warn users when it's not loaded.
 */
if (!Reflect || !(Reflect as any).getMetadata) {
  throw new Error(
    'TypeDI requires "Reflect.getMetadata" to work. Please import the "reflect-metadata" package at the very first line of your application.'
  );
}

/** This is an internal package, so we don't re-export it on purpose. */
import { ContainerRegistry } from './container-registry.class';

export * from './decorators/inject-many.decorator';
export * from './decorators/inject.decorator';
export * from './decorators/service.decorator';

export * from './error/cannot-inject-value.error';
export * from './error/cannot-instantiate-value.error';
export * from './error/service-not-found.error';

export { Handler } from './interfaces/handler.interface';
export { ServiceMetadata } from './interfaces/service-metadata.interface';
export { ServiceOptions } from './interfaces/service-options.interface';
export { TokenInfer } from './types/token-infer.type';
export { TokenInferMany } from './types/token-infer-many.type';
export { Constructable } from './types/constructable.type';
export { ServiceIdentifier } from './types/service-identifier.type';

export { ContainerInstance } from './container-instance.class';
export { Token } from './token.class';

/** We export the default container under the Container alias. */
export const Container = ContainerRegistry.defaultContainer;
export default Container;
