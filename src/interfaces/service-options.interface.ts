import { Constructable } from '../types/constructable.type';
import { ServiceIdentifier } from '../types/service-identifier.type';

/**
 * Service options passed to the @Service() decorator.
 * Allows to specify service id and/or factory used to create this service.
 */
export interface ServiceOptions<Type = unknown> {
  /**
   * Unique service id.
   */
  id?: ServiceIdentifier;

  /**
   * Class definition of the service what is used to initialize given service.
   * This property maybe null if the value of the service is set manually.
   * If id is not set then it serves as service id.
   */
  type?: Constructable<Type> | null;

  /**
   * Indicates if this service must be global and same instance must be used across all containers.
   */
  global?: boolean;

  /**
   * Indicates whether a new instance of this class must be created for each class injecting this class.
   * Global option is ignored when this option is used.
   */
  transient?: boolean;

  /**
   * Allows to setup multiple instances the different classes under a single service id string or token.
   */
  multiple?: boolean;

  /**
   * Indicates whether a new instance should be created as soon as the class is registered.
   * By default the registered classes are only instantiated when they are requested from the container.
   */
  eager?: boolean;

  /**
   * Factory used to produce this service.
   */
  factory?: [Constructable<unknown>, string] | CallableFunction | undefined;

  /**
   * Instance of the target class.
   */
  value?: unknown | Symbol;
}
