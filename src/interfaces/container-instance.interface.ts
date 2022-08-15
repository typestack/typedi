import { ContainerIdentifier } from '../types/container-identifier.type';
import { ServiceIdentifier } from '../types/service-identifier.type';
import { ServiceOptions } from './service-options.interface';
import { Handler } from './handler.interface';

export interface ContainerInstanceInterface {
  readonly id: ContainerIdentifier;
  has<T = unknown>(identifier: ServiceIdentifier<T>): boolean;
  get<T = unknown>(identifier: ServiceIdentifier<T>): T;
  getMany<T = unknown>(identifier: ServiceIdentifier<T>): T[];
  set<T = unknown>(serviceOptions: ServiceOptions<T>): this;
  remove(identifierOrIdentifierArray: ServiceIdentifier | ServiceIdentifier[]): this;
  of(containerId: ContainerIdentifier): ContainerInstanceInterface;
  findOf(containerId: ContainerIdentifier): ContainerInstanceInterface | undefined;
  registerHandler(handler: Handler): ContainerInstanceInterface;
  import(services: Function[]): ContainerInstanceInterface;
  reset(options: { strategy: 'resetValue' | 'resetServices' }): this;
  dispose(): Promise<void>;
}
