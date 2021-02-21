import { Constructable } from '../types/constructable.type';
import { ServiceIdentifier } from '../types/service-identifier.type';
import { EMPTY_VALUE } from '../empty.const';

/**
 * Service metadata is used to initialize service and store its state.
 */
export interface ServiceMetadata<Type = unknown> {
  /** Unique identifier of the referenced service. */
  id: ServiceIdentifier;

  /**
   * Class definition of the service what is used to initialize given service.
   * This property maybe null if the value of the service is set manually.
   * If ID is not set then this value is set as the service ID.
   */
  type: Constructable<Type> | null;

  /**
   * Indicates if this service must be global and same instance must be used across all containers.
   */
  global: boolean;

  /**
   * Indicates whether a new instance of this class must be created for each class injecting this class.
   * Global option is ignored when this option is used.
   */
  transient: boolean;

  /**
   * Indicates if a service requires async setup. When enabled TypeDI will call
   * the `instance.initialize()` function on the class instance. The service
   * initialization can be awaited via `Container.waitForServiceInitialization()`.
   */
  async: boolean;

  /**
   * This property either contains the Promise returned from the `instance.initialize()` call.
   */
  asyncInitializationPromise: undefined | Promise<unknown>;

  /**
   * The status of the async initialization.
   */
  asyncInitializationStatus: 'pending' | 'finished' | 'failed';

  /**
   * Allows to setup multiple instances of different classes under a single service ID.
   */
  multiple: boolean;

  /**
   * Indicates whether a new instance should be created as soon as the class is registered.
   * By default the registered classes are only instantiated when they are requested from the container.
   */
  eager?: boolean;

  /**
   * Factory function used to initialize this service.
   * Can be regular function ("createCar" for example),
   * or other service which produces this instance ([CarFactory, "createCar"] for example).
   */
  factory: [Constructable<unknown>, string] | CallableFunction | undefined;

  /**
   * Instance of the target value.
   */
  value: unknown | typeof EMPTY_VALUE;
}
