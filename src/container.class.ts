import { ContainerInstance } from './container-instance.class';
import { Token } from './token.class';
import { Handler } from './interfaces/handler.interface';
import { Constructable } from './types/constructable.type';
import { ServiceIdentifier } from './types/service-identifier.type';
import { ServiceMetadata } from './interfaces/service-metadata.interface.';

/**
 * Service container.
 */
export class Container {
  // -------------------------------------------------------------------------
  // Private Static Properties
  // -------------------------------------------------------------------------

  /**
   * All registered handlers.
   */
  static readonly handlers: Handler[] = [];

  /**
   * Global container instance.
   */
  private static readonly globalInstance: ContainerInstance = new ContainerInstance(undefined);

  /**
   * Other containers created using Container.of method.
   */
  private static readonly instances: ContainerInstance[] = [];

  // -------------------------------------------------------------------------
  // Public Static Methods
  // -------------------------------------------------------------------------

  /**
   * Gets a separate container instance for the given instance id.
   */
  static of(instanceId: any): ContainerInstance {
    if (instanceId === undefined) return this.globalInstance;

    let container = this.instances.find(instance => instance.id === instanceId);
    if (!container) {
      container = new ContainerInstance(instanceId);
      this.instances.push(container);
    }

    return container;
  }

  /**
   * Checks if the service with given name or type is registered service container.
   * Optionally, parameters can be passed in case if instance is initialized in the container for the first time.
   */
  static has<T>(type: Constructable<T>): boolean;

  /**
   * Checks if the service with given name or type is registered service container.
   * Optionally, parameters can be passed in case if instance is initialized in the container for the first time.
   */
  static has<T>(id: string): boolean;

  /**
   * Checks if the service with given name or type is registered service container.
   * Optionally, parameters can be passed in case if instance is initialized in the container for the first time.
   */
  static has<T>(id: Token<T>): boolean;

  /**
   * Checks if the service with given name or type is registered service container.
   * Optionally, parameters can be passed in case if instance is initialized in the container for the first time.
   */
  static has<T>(identifier: ServiceIdentifier): boolean {
    return this.globalInstance.has(identifier as any);
  }

  /**
   * Retrieves the service with given name or type from the service container.
   * Optionally, parameters can be passed in case if instance is initialized in the container for the first time.
   */
  static get<T>(type: Constructable<T>): T;

  /**
   * Retrieves the service with given name or type from the service container.
   * Optionally, parameters can be passed in case if instance is initialized in the container for the first time.
   */
  static get<T>(id: string): T;

  /**
   * Retrieves the service with given name or type from the service container.
   * Optionally, parameters can be passed in case if instance is initialized in the container for the first time.
   */
  static get<T>(id: Token<T>): T;

  /**
   * Retrieves the service with given name or type from the service container.
   * Optionally, parameters can be passed in case if instance is initialized in the container for the first time.
   */
  static get<T>(service: { service: T }): T;

  /**
   * Retrieves the service with given name or type from the service container.
   * Optionally, parameters can be passed in case if instance is initialized in the container for the first time.
   */
  static get<T>(identifier: ServiceIdentifier<T>): T {
    return this.globalInstance.get(identifier as any);
  }

  /**
   * Like get, but returns a promise of a service that recursively resolves async properties.
   * Used when service defined with asyncInitialization: true flag.
   */
  static getAsync<T>(type: Constructable<T>): Promise<T>;

  /**
   * Like get, but returns a promise of a service that recursively resolves async properties.
   * Used when service defined with asyncInitialization: true flag.
   */
  static getAsync<T>(id: string): Promise<T>;

  /**
   * Like get, but returns a promise of a service that recursively resolves async properties.
   * Used when service defined with asyncInitialization: true flag.
   */
  static getAsync<T>(id: Token<T>): Promise<T>;

  /**
   * Like get, but returns a promise of a service that recursively resolves async properties.
   * Used when service defined with asyncInitialization: true flag.
   */
  static getAsync<T>(service: { service: T }): Promise<T>;

  /**
   * Like get, but returns a promise of a service that recursively resolves async properties.
   * Used when service defined with asyncInitialization: true flag.
   */
  static getAsync<T>(identifier: ServiceIdentifier<T>): Promise<T> {
    return this.globalInstance.getAsync(identifier as any);
  }

  /**
   * Gets all instances registered in the container of the given service identifier.
   * Used when service defined with multiple: true flag.
   */
  static getMany<T>(id: string): T[];

  /**
   * Gets all instances registered in the container of the given service identifier.
   * Used when service defined with multiple: true flag.
   */
  static getMany<T>(id: Token<T>): T[];

  /**
   * Gets all instances registered in the container of the given service identifier.
   * Used when service defined with multiple: true flag.
   */
  static getMany<T>(id: string | Token<T>): T[] {
    return this.globalInstance.getMany(id as any);
  }

  /**
   * Like getMany, but returns a promise that recursively resolves async properties on all services.
   * Used when services defined with multiple: true and asyncInitialization: true flags.
   */
  static getManyAsync<T>(id: string): T[];

  /**
   * Like getMany, but returns a promise that recursively resolves async properties on all services.
   * Used when services defined with multiple: true and asyncInitialization: true flags.
   */
  static getManyAsync<T>(id: Token<T>): T[];

  /**
   * Like getMany, but returns a promise that recursively resolves async properties on all services.
   * Used when services defined with multiple: true and asyncInitialization: true flags.
   */
  static getManyAsync<T>(id: string | Token<T>): Promise<T>[] {
    return this.globalInstance.getManyAsync(id as any);
  }

  /**
   * Sets a value for the given type or service name in the container.
   */
  static set<T, K extends keyof T>(service: ServiceMetadata<T, K>): Container;

  /**
   * Sets a value for the given type or service name in the container.
   */
  static set(type: Function, value: any): Container;

  /**
   * Sets a value for the given type or service name in the container.
   */
  static set(name: string, value: any): Container;

  /**
   * Sets a value for the given type or service name in the container.
   */
  static set(token: Token<any>, value: any): Container;

  /**
   * Sets a value for the given type or service name in the container.
   */
  static set<T, K extends keyof T>(values: ServiceMetadata<T, K>[]): Container;

  /**
   * Sets a value for the given type or service name in the container.
   */
  static set(
    identifierOrServiceMetadata: ServiceIdentifier | ServiceMetadata<any, any> | ServiceMetadata<any, any>[],
    value?: any
  ): Container {
    this.globalInstance.set(identifierOrServiceMetadata as any, value);
    return this;
  }

  /**
   * Removes services with a given service identifiers (tokens or types).
   */
  static remove(...ids: ServiceIdentifier[]): Container {
    this.globalInstance.remove(...ids);
    return this;
  }

  /**
   * Completely resets the container by removing all previously registered services and handlers from it.
   */
  static reset(containerId?: any): Container {
    if (containerId) {
      const instance = this.instances.find(instance => instance.id === containerId);
      if (instance) {
        instance.reset();
        this.instances.splice(this.instances.indexOf(instance), 1);
      }
    } else {
      this.globalInstance.reset();
      this.instances.forEach(instance => instance.reset());
    }
    return this;
  }

  /**
   * Registers a new handler.
   */
  static registerHandler(handler: Handler): Container {
    this.handlers.push(handler);
    return this;
  }

  /**
   * Helper method that imports given services.
   */
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  static import(services: Function[]): Container {
    return this;
  }
}
