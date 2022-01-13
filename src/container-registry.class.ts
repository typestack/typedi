import { ContainerInstance } from './container-instance.class';
import { ContainerIdentifier } from './types/container-identifier.type';

/**
 * The container registry is responsible for holding the default and every
 * created container instance for later access.
 *
 * _Note: This class is for internal use and it's API may break in minor or
 * patch releases without warning._
 */
export class ContainerRegistry {
  /**
   * The list of all known container. Created containers are automatically added
   * to this list. Two container cannot be registered with the same ID.
   *
   * This map doesn't contains the default container.
   */
  private static readonly containerMap: Map<ContainerIdentifier, ContainerInstance> = new Map();

  /**
   * The default global container. By default services are registered into this
   * container when registered via `Container.set()` or `@Service` decorator.
   */
  public static readonly defaultContainer: ContainerInstance = new ContainerInstance('default');

  /**
   * Registers the given container instance or throws an error.
   *
   * _Note: This function is auto-called when a Container instance is created,
   * it doesn't need to be called manually!_
   *
   * @param container the container to add to the registry
   */
  public static registerContainer(container: ContainerInstance): void {
    if (container instanceof ContainerInstance === false) {
      // TODO: Create custom error for this.
      throw new Error('Only ContainerInstance instances can be registered.');
    }

    /** If we already set the default container (in index) then no-one else can register a default. */
    if (!!ContainerRegistry.defaultContainer && container.id === 'default') {
      // TODO: Create custom error for this.
      throw new Error('You cannot register a container with the "default" ID.');
    }

    if (ContainerRegistry.containerMap.has(container.id)) {
      // TODO: Create custom error for this.
      throw new Error('Cannot register container with same ID.');
    }

    ContainerRegistry.containerMap.set(container.id, container);
  }

  /**
   * Returns true if a container exists with the given ID or false otherwise.
   *
   * @param container the ID of the container
   */
  public static hasContainer(id: ContainerIdentifier): boolean {
    return ContainerRegistry.containerMap.has(id);
  }

  /**
   * Returns the container for requested ID or throws an error if no container
   * is registered with the given ID.
   *
   * @param container the ID of the container
   */
  public static getContainer(id: ContainerIdentifier): ContainerInstance {
    const registeredContainer = this.containerMap.get(id);

    if (registeredContainer === undefined) {
      // TODO: Create custom error for this.
      throw new Error('No container is registered with the given ID.');
    }

    return registeredContainer;
  }

  /**
   * Removes the given container from the registry and disposes all services
   * registered only in this container.
   *
   * This function throws an error if no
   *   - container exists with the given ID
   *   - any of the registered services threw an error during it's disposal
   *
   * @param container the container to remove from the registry
   */
  public static async removeContainer(container: ContainerInstance): Promise<void> {
    const registeredContainer = ContainerRegistry.containerMap.get(container.id);

    if (registeredContainer === undefined) {
      // TODO: Create custom error for this.
      throw new Error('No container is registered with the given ID.');
    }

    /** We remove the container first. */
    ContainerRegistry.containerMap.delete(container.id);

    /** We dispose all registered classes in the container. */
    await registeredContainer.dispose();
  }
}
