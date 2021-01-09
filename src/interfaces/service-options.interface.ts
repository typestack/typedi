import { Constructable } from '../types/constructable.type';
import { Token } from '../token.class';

/**
 * Service options passed to the @Service() decorator.
 * Allows to specify service id and/or factory used to create this service.
 */
export interface ServiceOptions<T, K extends keyof T> {
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
   * Unique service id.
   */
  id?: string | Token<any>;

  /**
   * Factory used to produce this service.
   */
  factory?: [Constructable<T>, K] | ((...params: any[]) => any);
}
