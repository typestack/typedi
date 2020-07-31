import { Container } from './Container';

export * from './decorators/Service';
export * from './decorators/Inject';
export * from './decorators/InjectMany';
export { Container } from './Container';
export { ContainerInstance } from './ContainerInstance';
export { Token } from './Token';
export { Handler } from './types/Handler';
export { ServiceOptions } from './types/ServiceOptions';
export { ServiceIdentifier } from './types/ServiceIdentifier';
export { ServiceMetadata } from './types/ServiceMetadata';
export { ObjectType } from './types/ObjectType';

export default Container;
