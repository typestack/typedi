import { ContainerRegistry } from './container-registry.class';
import { ServiceNotFoundError } from './error/service-not-found.error';
import { CannotInstantiateValueError } from './error/cannot-instantiate-value.error';
import { Token } from './token.class';
import { Constructable } from './types/constructable.type';
import { ServiceIdentifier } from './types/service-identifier.type';
import { ServiceMetadata } from './interfaces/service-metadata.interface';
import { ServiceOptions } from './interfaces/service-options.interface';
import { EMPTY_VALUE } from './empty.const';
import { ContainerIdentifier } from './types/container-identifier.type';
import { ContainerScope } from './types/container-scope.type';
import { GenericTypeWrapper, TypeWrapper } from './types/type-wrapper.type';
import { InjectedFactory } from './types/inject-identifier.type';
import { isInjectedFactory } from './utils/is-inject-identifier.util';
import { resolveToTypeWrapper } from './utils/resolve-to-type-wrapper.util';
import { Disposable } from './types/disposable.type';

// todo: make const
export enum ServiceIdentifierLocation {
  Local = 'local',
  Parent = 'parent',
  None = 'none'
}

interface ManyServicesMetadata {
  tokens: Token<unknown>[];
  scope: ContainerScope;
}

/**
 * TypeDI can have multiple containers.
 * One container is ContainerInstance.
 */
export class ContainerInstance implements Disposable {
  /** Container instance id. */
  public readonly id!: ContainerIdentifier;

  /** Metadata for all registered services in this container. */
  private metadataMap: Map<ServiceIdentifier, ServiceMetadata<unknown>> = new Map();

  /**
   * Services registered with 'multiple: true' are saved as simple services
   * with a generated token and the mapping between the original ID and the
   * generated one is stored here. This is handled like this to allow simplifying
   * the inner workings of the service instance.
   */
  private multiServiceIds: Map<ServiceIdentifier, ManyServicesMetadata> = new Map();

  /**
   * Indicates if the container has been disposed or not.
   * Any function call should fail when called after being disposed.
   *
   * NOTE: Currently not in use
   */
  public disposed: boolean = false;

  /**
   * The default global container. By default services are registered into this
   * container when registered via `Container.set()` or `@Service` decorator.
   */
  public static defaultContainer = new ContainerInstance("default");

  protected constructor (id: ContainerIdentifier, public parent?: ContainerInstance) {
    this.id = id;
  }

  /**
   * Checks if the service with given name or type is registered service container.
   * Optionally, parameters can be passed in case if instance is initialized in the container for the first time.
   * 
   * If recursive mode is enabled, the symbol is not available locally, and we have a parent,
   * we tell the parent to search its tree recursively too.
   * If the container tree is substantial, this operation may affect performance.
   */
  public has<T = unknown>(identifier: ServiceIdentifier<T>, recursive = true): boolean {
    this.throwIfDisposed();

    const location = this.getIdentifierLocation(identifier);
    return location === ServiceIdentifierLocation.Local || location === ServiceIdentifierLocation.Parent;
  }

  /**
   * Return the location of the given identifier.
   * If recursive mode is enabled, the symbol is not available locally, and we have a parent,
   * we tell the parent to search its tree recursively too.
   * If the container tree is substantial, this operation may affect performance.
   */
  protected getIdentifierLocation<T = unknown>(identifier: ServiceIdentifier<T>): ServiceIdentifierLocation {
    this.throwIfDisposed();

    if (this.metadataMap.has(identifier) || this.multiServiceIds.has(identifier)) {
      return ServiceIdentifierLocation.Local;
    }

    // If we have a parent container, see if that has the identifier.
    // todo: should we always use true here?
    if (this.parent && this.parent.has(identifier, true)) {
      return ServiceIdentifierLocation.Parent;
    }

    return ServiceIdentifierLocation.None;
  }

  public get<T = unknown>(identifier: ServiceIdentifier<T>, recursive?: boolean): T {
    const response = this.getOrNull<T>(identifier, recursive);

    if (response === null) {
      throw new ServiceNotFoundError(identifier);
    }

    return response as T;
  }

  /** Resolve the metadata for the given identifier.  Returns null if no metadata could be found. */
  protected resolveMetadata<T = unknown> (identifier: ServiceIdentifier<T>, recursive: boolean): readonly [ServiceMetadata<T>, ServiceIdentifierLocation] | null {
    this.throwIfDisposed();

    /** 
     * Firstly, ascertain the location of the identifier.
     * If it is located on the parent, we shall yield to the parent's .get.
     */
    const location = this.getIdentifierLocation(identifier);

    switch (location) {
      case ServiceIdentifierLocation.None:
        return null;
      case ServiceIdentifierLocation.Local:
        return [this.metadataMap.get(identifier) as ServiceMetadata<T>, location];
      case ServiceIdentifierLocation.Parent:
        /** Don't perform any parent lookups if we're not recursively scanning the tree. */
        if (recursive) {
          /**
           * Unpack the possibly-resolved metadata object from the parent.
           * We don't directly return the parent's resolveMetadata call here as that would
           * return "ServiceIdentifierLocation.Local" if it was resolved on the parent.
           */
          const possibleResolution = this.parent?.resolveMetadata<T>(identifier, true);

          return possibleResolution ? [possibleResolution[0], ServiceIdentifierLocation.Parent] : null;
        }

        return null;
    }
  }

  /**
   * Retrieves the service with given name or type from the service container.
   * Optionally, parameters can be passed in case if instance is initialized in the container for the first time.
   * 
   * To preserve compatibility with TypeDI, recursive is set to false by default.
   */
  public getOrNull<T = unknown>(identifier: ServiceIdentifier<T>, recursive = false): T | null {
    this.throwIfDisposed();

    const maybeResolvedMetadata = this.resolveMetadata(identifier, true);

    if (maybeResolvedMetadata === null) {
      return null;
    }

    /** 
     * At this point, we have narrowed the location of the identifier
     * down to ServiceIdentifierLocation.Local.
     * Therefore, the symbol exists locally.
     * 
     * To preserve compatibility with TypeDI, if the identifier exists on
     * the parent but not locally, we still treat it as if it were resolved locally.
     */
    const [baseMetadata, location] = maybeResolvedMetadata;
    const isUpstreamMetadata = location === ServiceIdentifierLocation.Parent;

    /**
     * To preserve compatibility with TypeDI, if the identifier metadata was loaded
     * from the parent, we then import it into this container.
     * The objects are also cloned to prevent mutations from affecting this instance.
     * <https://github.com/typestack/typedi/blob/8da3ef286299bca6bd7ddf4082268f422f700630/src/container-instance.class.ts#L94>
     */
    if (isUpstreamMetadata) {
      const value = baseMetadata.scope === 'singleton' ? baseMetadata.value : EMPTY_VALUE;

      const newServiceMetadata: ServiceMetadata<T> = {
        ...baseMetadata,
        /**
         * If the service is a singleton, we'll import its value directly into this container.
         * Otherwise, we set the value to the well-known placeholder.
         */
        value
      };

      /**
       * If the service is a singleton, return it directly from the global container.
       * We can safely assume it exists there.
       */
      if (newServiceMetadata.scope === 'singleton') {
        return ContainerInstance.defaultContainer.getOrNull(identifier, recursive);
      }

      /**
       * If it's not a singleton, import it into the current container,
       * and then recursively call .getOrNull which takes the local path
       * instead of dealing with upstream metadata.
       */
      const newServiceID = this.set(newServiceMetadata, [...baseMetadata.dependencies]);
      return this.getOrNull(newServiceID, recursive) as T;
    }
    
    let metadata = baseMetadata;

    /** Firstly, we shall check if the service is a singleton.  If it is, load it from the global registry. */
    if (baseMetadata?.scope === 'singleton') {
      metadata = ContainerInstance.defaultContainer.metadataMap.get(identifier) as ServiceMetadata<T>;
    }

    /** This should never happen as multi services are masked with custom token in Container.set. */
    if (metadata && metadata.multiple === true) {
      throw new Error(`Cannot resolve multiple values for ${identifier.toString()} service!`);
    }

    /** Otherwise it's returned from the current / parent container. */
    if (metadata) {
      return this.getServiceValue(metadata);
    }

    return null;
  }

  /**
   * Gets all instances registered in the container of the given service identifier.
   * Used when service defined with multiple: true flag.
   * If none can be found, an error is thrown.
   */
  public getMany<T = unknown>(identifier: ServiceIdentifier<T>, recursive?: boolean): T[] {
    const response = this.getManyOrNull(identifier, recursive);

    if (response === null) {
      throw new ServiceNotFoundError(identifier);
    }

    return response;
  }

  /**
   * Gets all instances registered in the container of the given service identifier.
   * Used when service defined with multiple: true flag.
   * If none can be found, `null` is returned.
   */
  public getManyOrNull<T = unknown>(identifier: ServiceIdentifier<T>, recursive = true): T[] | null {
    this.throwIfDisposed();

    let idMap: ManyServicesMetadata | void = undefined;

    if (!this.multiServiceIds.has(identifier)) {
      /** If this container has no knowledge of the identifier, then we check the parent (if we have one). */
      if (recursive && this.parent && this.parent.multiServiceIds.has(identifier)) {
        /** It looks like it does! Let's use that instead. */
        idMap = this.parent.multiServiceIds.get(identifier) as ManyServicesMetadata;
      }
    } else {
      idMap = this.multiServiceIds.get(identifier);
    }

    /** If no IDs could be found, return null. */
    if (!idMap) {
      return null;
    }

    /**
     * If the service is registered as a singleton, we load it from the global container.
     * Otherwise, the local registry is used.
     */
    const subject = idMap.scope === 'singleton' ? 
      (generatedId: Token<unknown>) => ContainerInstance.defaultContainer.get<T>(generatedId) :
      (generatedId: Token<unknown>) => this.get<T>(generatedId, recursive);

    return idMap.tokens.map(subject);
  }

  /**
   * Add a service to the container using the provided options, along with
   * a pre-wrapped list of dependencies.
   */
  public set<T = unknown>(serviceOptions: Omit<ServiceOptions<T>, 'dependencies'>, precompiledDependencies: TypeWrapper[]): ServiceIdentifier;

  /**
   * Add a service to the container using the provided options, containing
   * all information about the new service including its dependencies.
   */
  public set<T = unknown>(serviceOptions: ServiceOptions<T>): ServiceIdentifier;
  public set<T = unknown>(serviceOptions: ServiceOptions<T> | Omit<ServiceOptions<T>, 'dependencies'>, precompiledDependencies?: TypeWrapper[]): ServiceIdentifier {
    this.throwIfDisposed();

    /**
     * If the service is marked as singleton, we set it in the default container.
     * (And avoid an infinite loop via checking if we are in the default container or not.)
     */
    if ((serviceOptions as any)['scope'] === 'singleton' && ContainerInstance.defaultContainer !== this) {
      /**
       * 1. The (as any) cast above is for performance: why bother putting the arguments
       * together if we can very quickly determine if the argument is of type object?
       * If we did this return below, we'd be wasting a newly-constructed object, PLUS
       * a few function calls to helpers like resolveToTypeWrapper.
       * 
       * 2. Below, we trick TypeScript into thinking we're using the 1st overload here.
       * However, we haven't actually checked the types of each argument.
       * This is, of course, left to ContainerInstance#set.
       */
      // todo: should we really be binding to defaultContainer here?
      return ContainerInstance.defaultContainer.set(serviceOptions as Omit<ServiceOptions<T>, 'dependencies'>, precompiledDependencies as TypeWrapper[]);
    }

    /**
     * The dependencies of the object are either delivered in a pre-compiled list of TypeWrapper objects (from @Service),
     * or from the dependencies list of the service options object, which must then be compiled to a list of type wrappers.
     */
    const dependencies: TypeWrapper[] = 
      precompiledDependencies ?? (serviceOptions as ServiceOptions<NewableFunction>)?.dependencies?.map(resolveToTypeWrapper) ?? [];

    const newMetadata: ServiceMetadata<T> = {
      /**
       * Typescript cannot understand that if ID doesn't exists then type must exists based on the
       * typing so we need to explicitly cast this to a `ServiceIdentifier`
       */
      id: ((serviceOptions as any).id || (serviceOptions as any).type) as ServiceIdentifier,
      type: null,
      factory: undefined,
      value: EMPTY_VALUE,
      multiple: false,
      eager: false,
      scope: 'container',

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      /** @ts-ignore TypeScript is actually broken here. We've told it dependencies is of type TypeWrapper[], but it still doesn't like it? */
      dependencies: dependencies as unknown as TypeWrapper[],
      
      /** We allow overriding the above options via the received config object. */
      ...serviceOptions,
    };

    /** If the incoming metadata is marked as multiple we mask the ID and continue saving as single value. */
    if (newMetadata.multiple) {
      const maskedToken = new Token(`MultiMaskToken-${newMetadata.id.toString()}`);
      const existingMultiGroup = this.multiServiceIds.get(newMetadata.id);

      if (existingMultiGroup) {
        existingMultiGroup.tokens.push(maskedToken);
      } else {
        this.multiServiceIds.set(newMetadata.id, { scope: newMetadata.scope, tokens: [maskedToken] });
      }

      /**
       * We mask the original metadata with this generated ID, mark the service
       * as  and continue multiple: false and continue. Marking it as
       * non-multiple is important otherwise Container.get would refuse to
       * resolve the value.
       */
      newMetadata.id = maskedToken;
      newMetadata.multiple = false;
    }

    // todo: sort this out
    // I've removed the legacy "extend service if it already exists"
    // behaviour for now.
    const existingMetadata = this.metadataMap.get(newMetadata.id);

    {
      /** This service hasn't been registered yet, so we register it. */
      this.metadataMap.set(newMetadata.id, newMetadata);
    }

    /**
     * If the service is eager, we need to create an instance immediately except
     * when the service is also marked as transient. In that case we ignore
     * the eager flag to prevent creating a service what cannot be disposed later.
     */
    if (newMetadata.eager && newMetadata.scope !== 'transient') {
      this.get(newMetadata.id);
    }

    return newMetadata.id;
  }

  /**
   * Removes services with a given service identifiers.
   */
  public remove(identifierOrIdentifierArray: ServiceIdentifier | ServiceIdentifier[]): this {
    this.throwIfDisposed();
    if (Array.isArray(identifierOrIdentifierArray)) {
      identifierOrIdentifierArray.forEach(id => this.remove(id));
    } else {
      const serviceMetadata = this.metadataMap.get(identifierOrIdentifierArray);

      if (serviceMetadata) {
        this.disposeServiceInstance(serviceMetadata);
        this.metadataMap.delete(identifierOrIdentifierArray);
      }
    }

    return this;
  }

  /**
   * Gets a separate container instance for the given instance id.
   * Optionally, a parent can be passed, which will act as an upstream resolver for the container.
   */
  public static of(containerId: ContainerIdentifier = 'default', parent = ContainerInstance.defaultContainer): ContainerInstance {
    if (containerId === 'default') {
      return this.defaultContainer;
    }

    // todo: test parent= default arg

    let container: ContainerInstance;

    if (ContainerRegistry.hasContainer(containerId)) {
      container = ContainerRegistry.getContainer(containerId);
    } else {
      /**
       * This is deprecated functionality, for now we create the container if it's doesn't exists.
       * This will be reworked when container inheritance is reworked.
       */
      container = new ContainerInstance(containerId, parent);

      // todo: move this into ContainerInstance ctor
      ContainerRegistry.registerContainer(container);
    }

    return container;
  }

  public of(containerId?: ContainerIdentifier): ContainerInstance {
    this.throwIfDisposed();

    // Todo: make this get the constructor at runtime to aid
    // extension of the class.
    return ContainerInstance.of(containerId);
  }

  /**
   * Create a registry with the specified ID, with this instance as its parent.
   */
  public ofChild (containerId?: ContainerIdentifier) {
    return ContainerInstance.of(containerId, this);
  }

  /**
   * Completely resets the container by removing all previously registered services from it.
   */
  public reset(options: { strategy: 'resetValue' | 'resetServices' } = { strategy: 'resetValue' }): this {
    this.throwIfDisposed();

    switch (options.strategy) {
      case 'resetValue':
        this.metadataMap.forEach(service => this.disposeServiceInstance(service));
        break;
      case 'resetServices':
        this.metadataMap.forEach(service => this.disposeServiceInstance(service));
        this.metadataMap.clear();
        this.multiServiceIds.clear();
        break;
      default:
        throw new Error('Received invalid reset strategy.');
    }
    return this;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  public async dispose(): Promise<void> {
    this.reset({ strategy: 'resetServices' });

    /** We mark the container as disposed, forbidding any further interaction with it. */
    this.disposed = true;
  }

  private throwIfDisposed() {
    if (this.disposed) {
      // TODO: Use custom error.
      throw new Error('Cannot use container after it has been disposed.');
    }
  }

  /**
   * Gets the value belonging to passed in `ServiceMetadata` instance.
   *
   * - if `serviceMetadata.value` is already set it is immediately returned
   * - otherwise the requested type is resolved to the value saved to `serviceMetadata.value` and returned
   */
  private getServiceValue(serviceMetadata: ServiceMetadata<unknown>): any {
    let value: unknown = EMPTY_VALUE;

    /**
     * The "serviceMetadata.factory" property lookup is inlined into a variable here
     * as its value will never change, and it reduces the final size of the bundle.
     */
    const { factory: factoryMeta } = serviceMetadata;

    /**
     * If the service value has been set to anything prior to this call we return that value.
     * NOTE: This part builds on the assumption that transient dependencies has no value set ever.
     */
    if (serviceMetadata.value !== EMPTY_VALUE) {
      return serviceMetadata.value;
    }

    /** If both factory and type is missing, we cannot resolve the requested ID. */
    if (!factoryMeta && !serviceMetadata.type) {
      throw new CannotInstantiateValueError(serviceMetadata.id);
    }

    /**
     * If a factory is defined it takes priority over creating an instance via `new`.
     * The return value of the factory is not checked, we believe by design that the user knows what he/she is doing.
     */
    if (factoryMeta) {
      /**
       * If we received the factory in the [Constructable<Factory>, "functionName"] format, we need to create the
       * factory first and then call the specified function on it.
       */
      if (Array.isArray(factoryMeta)) {
        const [factoryServiceId, factoryServiceMethod] = factoryMeta;

        /** Try to get the factory from TypeDI first, if failed, fall back to simply initiating the class. */
        const factoryInstance = this.getOrNull<any>(factoryServiceId) ?? new factoryServiceId();
        value = factoryInstance[factoryServiceMethod](this, serviceMetadata.id);
      } else {
        /** If only a simple function was provided we simply call it. */
        value = factoryMeta(this, serviceMetadata.id);
      }
    }

    /**
     * If no factory was provided and only then, we create the instance from the type if it was set.
     */
    if (!factoryMeta && serviceMetadata.type) {
      const constructableTargetType: Constructable<unknown> = serviceMetadata.type;
      const parameters = this.getConstructorParameters(serviceMetadata);
      value = new constructableTargetType(...parameters);
    }

    /** If this is not a transient service, and we resolved something, then we set it as the value. */
    if (serviceMetadata.scope !== 'transient' && value !== EMPTY_VALUE) {
      serviceMetadata.value = value;
    }

    if (value === EMPTY_VALUE) {
      /** This branch should never execute, but better to be safe than sorry. */
      throw new CannotInstantiateValueError(serviceMetadata.id);
    }

    return value;
  }

  private getConstructorParameters<T> ({ dependencies }: ServiceMetadata<T>): unknown[] {
    /** 
     * Firstly, check if the metadata declares any dependencies.
     */
    if (dependencies.length === 0) {
      return [];
    }

    /**
     * We do not type-check the identifiers array here as we are the only ones
     * aware of the reflective key.
     * Therefore, it can be safely assumed that if the key is present, the correct
     * data will also be present.
     */
    return dependencies.map(wrapper => this.resolveTypeWrapper(wrapper));
  }

  private runInjectedFactory (factory: InjectedFactory): unknown {
    const returnedValue = factory.get(this);

    if (returnedValue !== null && typeof returnedValue === 'object' && isInjectedFactory(returnedValue)) {
      return this.runInjectedFactory(factory);
    }

    return returnedValue;
  }

  private resolveTypeWrapper (wrapper: TypeWrapper) {
    if (wrapper.isFactory) {
      return this.runInjectedFactory(wrapper.factory);
    }
  
    /**
     * Reminder: The type wrapper is either resolvable to:
     *   1. An eager type containing the id of the service, or...
     *   2. A lazy type containing a function that must be called to resolve the id.
     * 
     * Therefore, if the eager type does not exist, the lazy type should.
     */
    const resolved = wrapper.eagerType ?? (wrapper as GenericTypeWrapper).lazyType?.();

    if (resolved == null) {
      throw new Error('The type could not be resolved.');
    }

    /**
     * We also need to search the graph recursively.
     * This is in-line with prior behaviour, ensuring that services
     * from upstream containers can be resolved correctly.
     */
    return this.get(resolved, true);
  }

  /**
   * Checks if the given service metadata contains a destroyable service instance and destroys it in place. If the service
   * contains a callable function named `destroy` it is called but not awaited and the return value is ignored..
   *
   * @param serviceMetadata the service metadata containing the instance to destroy
   * @param force when true the service will be always destroyed even if it's cannot be re-created
   */
  private disposeServiceInstance(serviceMetadata: ServiceMetadata, force = false) {
    this.throwIfDisposed();

    /** We reset value only if we can re-create it (aka type or factory exists). */
    const shouldResetValue = force || !!serviceMetadata.type || !!serviceMetadata.factory;

    if (shouldResetValue) {
      /** If we wound a function named destroy we call it without any params. */
      if (typeof (serviceMetadata?.value as Record<string, unknown>)['dispose'] === 'function') {
        try {
          (serviceMetadata.value as { dispose: CallableFunction }).dispose();
        } catch (error) {
          /** We simply ignore the errors from the destroy function. */
        }
      }

      serviceMetadata.value = EMPTY_VALUE;
    }
  }

  /** Iterate over each service in the container. */
  public [Symbol.iterator](): Iterable<[ServiceIdentifier, ServiceMetadata<unknown>]> {
    return this.metadataMap.entries();
  }
}
