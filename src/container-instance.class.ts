import { Container } from './container.class';
import { MissingProvidedServiceTypeError } from './error/missing-provided-service-type.error';
import { ServiceNotFoundError } from './error/service-not-found.error';
import { Token } from './token.class';
import { Constructable } from './types/constructable.type';
import { AbstractConstructable } from './types/abstract-constructable.type';
import { ServiceIdentifier } from './types/service-identifier.type';
import { ServiceMetadata } from './interfaces/service-metadata.interface.';
import { EMPTY_VALUE } from './empty.const';
import { ServiceOptions } from './interfaces/service-options.interface';

/**
 * TypeDI can have multiple containers.
 * One container is ContainerInstance.
 */
export class ContainerInstance {
  /** Container instance id. */
  public readonly id!: string;

  /** All registered services in the container. */
  private services: ServiceMetadata<unknown>[] = [];

  constructor(id: string) {
    this.id = id;
  }

  /**
   * Checks if the service with given name or type is registered service container.
   * Optionally, parameters can be passed in case if instance is initialized in the container for the first time.
   */
  has<T>(type: Constructable<T>): boolean;
  has<T>(id: string): boolean;
  has<T>(id: Token<T>): boolean;
  has<T>(identifier: ServiceIdentifier): boolean {
    return !!this.findService(identifier);
  }

  /**
   * Retrieves the service with given name or type from the service container.
   * Optionally, parameters can be passed in case if instance is initialized in the container for the first time.
   */
  get<T>(type: Constructable<T>): T;
  get<T>(type: AbstractConstructable<T>): T;
  get<T>(id: string): T;
  get<T>(id: Token<T>): T;
  get<T>(identifier: ServiceIdentifier<T>): T {
    const globalContainer = Container.of(undefined);
    const globalService = globalContainer.findService(identifier);
    const scopedService = this.findService(identifier);

    if (globalService && globalService.global === true) return this.getServiceValue(globalService);

    if (scopedService) return this.getServiceValue(scopedService);

    /** If it's the first time requested in the child container we load it from parent and set it. */
    if (globalService && this !== globalContainer) {
      const clonedService = Object.assign({}, globalService);
      clonedService.value = EMPTY_VALUE;
      const value = this.getServiceValue(clonedService);
      this.set(identifier, value);
      return value;
    }

    if (globalService) return this.getServiceValue(globalService);

    throw new ServiceNotFoundError(identifier);
  }

  /**
   * Gets all instances registered in the container of the given service identifier.
   * Used when service defined with multiple: true flag.
   */
  getMany<T>(id: string): T[];
  getMany<T>(id: Token<T>): T[];
  getMany<T>(id: string | Token<T>): T[] {
    return this.filterServices(id).map(service => this.getServiceValue(service));
  }

  /**
   * Sets a value for the given type or service name in the container.
   */
  set<T = unknown>(service: ServiceMetadata<T>): this; // This should be hidden
  set<T = unknown>(type: Constructable<T>, instance: T): this;
  set<T = unknown>(type: AbstractConstructable<T>, instance: T): this;
  set<T = unknown>(name: string, instance: T): this;
  set<T = unknown>(token: Token<T>, instance: T): this;
  set<T = unknown>(token: ServiceIdentifier, instance: T): this;
  set<T = unknown>(metadata: ServiceOptions<T>): this;
  set<T = unknown>(metadataArray: ServiceOptions<T>[]): this;
  set<T = unknown>(
    identifierOrServiceMetadata: ServiceIdentifier | ServiceOptions<T> | ServiceOptions<T>[],
    value?: T
  ): this {
    if (identifierOrServiceMetadata instanceof Array) {
      identifierOrServiceMetadata.forEach(data => this.set(data));
      return this;
    }
    if (typeof identifierOrServiceMetadata === 'string' || identifierOrServiceMetadata instanceof Token) {
      return this.set({
        id: identifierOrServiceMetadata,
        type: null,
        value: value,
        factory: undefined,
        global: false,
        multiple: false,
        transient: false,
      });
    }

    if (typeof identifierOrServiceMetadata === 'function') {
      return this.set({
        id: identifierOrServiceMetadata,
        // TODO: remove explicit casting
        type: identifierOrServiceMetadata as Constructable<unknown>,
        value: value,
        factory: undefined,
        global: false,
        multiple: false,
        transient: false,
      });
    }

    const newService: ServiceMetadata<T> = {
      id: new Token('UNREACHABLE'),
      type: null,
      factory: undefined,
      value: EMPTY_VALUE,
      global: false,
      multiple: false,
      transient: false,
      ...identifierOrServiceMetadata,
    };
    const service = this.findService(newService.id);
    if (service && service.multiple !== true) {
      Object.assign(service, newService);
    } else {
      this.services.push(newService);
    }

    return this;
  }

  /**
   * Removes services with a given service identifiers (tokens or types).
   */
  remove(...ids: ServiceIdentifier[]): this {
    ids.forEach(id => {
      this.filterServices(id).forEach(service => {
        this.services.splice(this.services.indexOf(service), 1);
      });
    });
    return this;
  }

  /**
   * Completely resets the container by removing all previously registered services from it.
   */
  public reset(options: { strategy: 'resetValue' | 'resetServices' } = { strategy: 'resetValue' }): this {
    // TODO: The resources should be freed up.
    switch (options.strategy) {
      case 'resetValue':
        this.services = this.services.map(s => {
          return {
            ...s,
            value: !!s.type ? EMPTY_VALUE : s.value,
          };
        });
        break;
      case 'resetValue':
        this.services = [];
        break;
      default:
        throw new Error('Received invalid reset strategy.');
    }
    return this;
  }

  /**
   * Filters registered service in the with a given service identifier.
   */
  private filterServices(identifier: ServiceIdentifier): ServiceMetadata<any>[] {
    return this.services.filter(service => {
      if (service.id) return service.id === identifier;

      if (service.type && typeof identifier === 'function')
        return service.type === identifier || identifier.prototype instanceof service.type;

      return false;
    });
  }

  /**
   * Finds registered service in the with a given service identifier.
   */
  private findService(identifier: ServiceIdentifier): ServiceMetadata<any> | undefined {
    return this.services.find(service => {
      if (service.id) {
        if (
          identifier instanceof Object &&
          service.id instanceof Token &&
          (identifier as any).service instanceof Token
        ) {
          return service.id === (identifier as any).service;
        }

        return service.id === identifier;
      }

      if (service.type && typeof identifier === 'function') return service.type === identifier; // todo: not sure why it was here || identifier.prototype instanceof service.type;

      return false;
    });
  }

  /**
   * Gets service value.
   */
  private getServiceValue(serviceMetadata: ServiceMetadata<unknown>): any {
    // find if instance of this object already initialized in the container and return it if it is
    /**
     * If the service value has been set to anything prior to this call we return the set value.
     * NOTE: This part builds on the assumption that transient dependencies has no value set ever.
     */
    if (serviceMetadata.value !== EMPTY_VALUE) {
      return serviceMetadata.value;
    }

    // if named service was requested and its instance was not found plus there is not type to know what to initialize,
    // this means service was not pre-registered and we throw an exception
    if (
      (!serviceMetadata || !serviceMetadata.type) &&
      (!serviceMetadata || !serviceMetadata.factory) &&
      (typeof serviceMetadata.id === 'string' || serviceMetadata.id instanceof Token)
    )
      throw new ServiceNotFoundError(serviceMetadata.id);

    // at this point we either have type in service registered, either identifier is a target type
    let construtableType: Constructable<unknown> | undefined;

    if (serviceMetadata && serviceMetadata.type) {
      construtableType = serviceMetadata.type;
    } else if (typeof serviceMetadata.id === 'function') {
      construtableType = serviceMetadata.id as Constructable<unknown>;
    }

    // setup constructor parameters for a newly initialized service
    const paramTypes =
      construtableType && Reflect && (Reflect as any).getMetadata
        ? (Reflect as any).getMetadata('design:paramtypes', construtableType)
        : undefined;
    // TODO: remove as any, here it cannot be undefined but TS doesn't see this.
    let params: any[] = paramTypes ? this.initializeParams(construtableType as any, paramTypes) : [];

    // if factory is set then use it to create service instance
    let value: any;
    if (serviceMetadata.factory) {
      // filter out non-service parameters from created service constructor
      // non-service parameters can be, lets say Car(name: string, isNew: boolean, engine: Engine)
      // where name and isNew are non-service parameters and engine is a service parameter
      params = params.filter(param => param !== undefined);

      if (serviceMetadata.factory instanceof Array) {
        // use special [Type, "create"] syntax to allow factory services
        // in this case Type instance will be obtained from Container and its method "create" will be called
        let factoryInstance;
        try {
          factoryInstance = this.get<any>(serviceMetadata.factory[0]);
        } catch (error) {
          if (error instanceof ServiceNotFoundError) {
            factoryInstance = new serviceMetadata.factory[0]();
          }
        }

        // TODO: rethink this
        // We need to pass `this` to make the following test pass:
        // "should support function injection with Token dependencies"
        // We should have the dependencies here, instead of passing the container to the factory.
        // Maybe we should save the dependency ID list on the meta-data?
        value = factoryInstance[serviceMetadata.factory[1]](...params, this);
      } else {
        // regular factory function
        value = serviceMetadata.factory(...params, this);
      }
    } else {
      // TODO: Commented it out as this makes no sense.
      // params.unshift(null);

      // "extra feature" - always pass container instance as the last argument to the service function
      // this allows us to support javascript where we don't have decorators and emitted metadata about dependencies
      // need to be injected, and user can use provided container to get instances he needs
      params.push(this);

      if (!construtableType) throw new MissingProvidedServiceTypeError(serviceMetadata.id);

      // eslint-disable-next-line prefer-spread
      value = new construtableType(...params);
    }

    if (serviceMetadata && !serviceMetadata.transient && value) serviceMetadata.value = value;

    if (construtableType) this.applyPropertyHandlers(construtableType, value);

    return value;
  }

  /**
   * Initializes all parameter types for a given target service class.
   */
  private initializeParams(type: Function, paramTypes: any[]): any[] {
    return paramTypes.map((paramType, index) => {
      const paramHandler = Container.handlers.find(handler => handler.object === type && handler.index === index);
      if (paramHandler) return paramHandler.value(this);

      if (paramType && paramType.name && !this.isTypePrimitive(paramType.name)) {
        return this.get(paramType);
      }

      return undefined;
    });
  }

  /**
   * Checks if given type is primitive (e.g. string, boolean, number, object).
   */
  private isTypePrimitive(param: string): boolean {
    return ['string', 'boolean', 'number', 'object'].indexOf(param.toLowerCase()) !== -1;
  }

  /**
   * Applies all registered handlers on a given target class.
   */
  private applyPropertyHandlers(target: Function, instance: { [key: string]: any }) {
    Container.handlers.forEach(handler => {
      if (typeof handler.index === 'number') return;
      if (handler.object.constructor !== target && !(target.prototype instanceof handler.object.constructor)) return;

      if (handler.propertyName) {
        instance[handler.propertyName] = handler.value(this);
      }
    });
  }
}
