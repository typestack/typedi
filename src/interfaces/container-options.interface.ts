export interface ContainerOptions {
  /**
   * Controls the behavior when a service is already registered with the same ID. The following values are allowed:
   *
   *   - `throw` - a `ContainerCannotBeCreatedError` error is raised
   *   - `overwrite` - the previous container is disposed and a new one is created
   *   - `returnExisting` - returns the existing container or raises a `ContainerCannotBeCreatedError` error if the
   *      specified options differ from the options of the existing container
   *
   * The default value is `returnExisting`.
   */
  onConflict: 'throw' | 'overwrite' | 'returnExisting';

  /**
   * Controls the behavior when a requested type doesn't exists in the current container. The following values are allowed:
   *
   *   - `allowLookup` - the parent container will be checked for the dependency
   *   - `localOnly` - a `ServiceNotFoundError` error is raised
   *
   * The default value is `allowLookup`.
   */
  lookupStrategy: 'allowLookup' | 'localOnly';

  /**
   * Enables the lookup for global (singleton) services before checking in the current container. By default every
   * type is first checked in the default container to return singleton services. This check bypasses the lookup strategy,
   * set in the container so if this behavior is not desired it can be disabled via this flag.
   *
   * The default value is `true`.
   */
  allowSingletonLookup: boolean;

  /**
   * Controls how the child container inherits the service definitions from it's parent. The following values are allowed:
   *
   *  - `none` - no metadata is inherited
   *  - `definitionOnly` - only metadata is inherited, a new instance will be created for each class
   *    - eager classes created as soon as the container is created
   *    - non-eager classes are created the first time they are requested
   *  - `definitionWithValues` - both metadata and service instances are inherited
   *    - when parent class is disposed the instances in this container are preserved
   *    - if a service is registered but not created yet, it will be shared when created between the two container
   *    - newly registered services won't be shared between the two container
   *
   * The default value is `none`.
   */
  inheritanceStrategy: 'none' | 'definitionOnly' | 'definitionWithValues';
}
