import { Container } from './container.class';

export * from './decorators/service.decorator';
export * from './decorators/inject.decorator';
export * from './decorators/inject-many.decorator';
export { Container } from './container.class';
export { ContainerInstance } from './container-instance.class';
export { Token } from './token.class';
export { Handler } from './interfaces/handler.interface';
export { ServiceOptions } from './interfaces/service-options.interface';
export { ServiceIdentifier } from './types/service-identifier.type';
export { ServiceMetadata } from './interfaces/service-metadata.interface.';
export { Constructable as ObjectType } from './types/constructable.type';

export default Container;
