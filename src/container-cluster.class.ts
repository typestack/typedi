import { ContainerInstanceInterface } from './interfaces/container-instance.interface';
import { ServiceIdentifier } from './types/service-identifier.type';
import { ContainerIdentifier } from './types/container-identifier.type';
import { Handler } from './interfaces/handler.interface';
import { ServiceOptions } from './interfaces/service-options.interface';
import { Token } from './token.class';
import { ContainerInstance } from './container-instance.class';
import { ContainerClusterInterface } from './interfaces/container-cluster.interface';

class Empty {}

class ServiceNotFoundError extends Error {
  constructor(readonly error: unknown) {
    super();
  }

  static normalizeIdentifier(identifier: ServiceIdentifier): string {
    if (typeof identifier === 'string') {
      return identifier;
    } else if (identifier instanceof Token) {
      return `Token<${identifier.name || 'UNSET_NAME'}>`;
    } else if (identifier && (identifier.name || identifier.prototype?.name)) {
      return `MaybeConstructable<${identifier.name}>`;
    }
    return '';
  }
}

function poxyHandlers(): ProxyHandler<ContainerCluster> {
  return {
    get(target: ContainerCluster | any, property: string): any {
      if (property in target) return target[property];
      return target.clusterContainer[property];
    },
    set(target: ContainerCluster | any, property: string | symbol, value: any): boolean {
      if (property in target) {
        target[property] = value;
        return false;
      }
      target.clusterContainer[property] = value;
      return false;
    },
  };
}

export class ContainerCluster implements ContainerClusterInterface {
  static create(clusterContainer: ContainerInstance): ContainerCluster & ContainerInstance {
    const cluster = new ContainerCluster(clusterContainer) as ContainerCluster & ContainerInstance;
    return new Proxy(cluster, poxyHandlers()) as unknown as ContainerCluster & ContainerInstance;
  }

  private disposed: boolean = false;

  private readonly containers: ContainerInstanceInterface[];

  private constructor(readonly clusterContainer: ContainerInstance) {
    this.containers = [];
    this.containers.push(this.clusterContainer);
  }

  get id(): ContainerIdentifier {
    return this.clusterContainer.id;
  }

  is(container: ContainerInstance): boolean {
    return this.clusterContainer === container;
  }

  addContainer(container: ContainerInstanceInterface): void {
    this.containers.includes(container) || this.containers.push(container);
  }

  removeContainer(container: ContainerInstanceInterface): void {
    const index = this.containers.indexOf(container);
    if (index === -1) return;
    this.containers.splice(index, 1);
  }

  async dispose(): Promise<void> {
    this.disposed = true;
    await Promise.all(this.containers.map(i => i.dispose()));
  }

  get<T = unknown>(identifier: ServiceIdentifier<T>): T {
    let service: T | ServiceNotFoundError | Empty = new Empty();
    this.containers.find(i => {
      service = this.findService<T>(i, identifier);
      return !(service instanceof ServiceNotFoundError);
    });
    if (service instanceof ServiceNotFoundError) throw service.error;
    if (service instanceof Empty)
      throw new Error(
        `Service with "${ServiceNotFoundError.normalizeIdentifier(
          identifier
        )}" identifier was not found in the container. `
      );
    return service;
  }

  private findService<T = unknown>(
    container: ContainerInstanceInterface,
    identifier: ServiceIdentifier<T>
  ): T | ServiceNotFoundError {
    try {
      return container.get(identifier);
    } catch (error) {
      return new ServiceNotFoundError(error);
    }
  }

  getMany<T = unknown>(identifier: ServiceIdentifier<T>): T[] {
    return this.containers.flatMap(i => {
      if (i === this) return [];
      return i.getMany(identifier);
    });
  }

  has<T = unknown>(identifier: ServiceIdentifier<T>): boolean {
    return !!this.containers.find(i => i.has(identifier));
  }

  import(services: Function[]): ContainerInstanceInterface {
    if (this.disposed) {
      // TODO: Use custom error.
      throw new Error('Cannot use container after it has been disposed.');
    }
    return this;
  }

  of(containerId: ContainerIdentifier): ContainerInstanceInterface {
    return this.findOf(containerId) || this.createContainer(containerId);
  }

  findOf(containerId: ContainerIdentifier): ContainerInstanceInterface | undefined {
    return this.containers.find(i => {
      if (i === this) return undefined;
      return i.findOf(containerId);
    });
  }

  private createContainer(containerId: ContainerIdentifier): ContainerInstanceInterface {
    const res = new ContainerInstance(containerId);
    this.addContainer(res);
    return res;
  }

  registerHandler(handler: Handler): ContainerInstanceInterface {
    return this.clusterContainer.registerHandler(handler);
  }

  remove(identifierOrIdentifierArray: ServiceIdentifier | ServiceIdentifier[]): this {
    this.containers.forEach(i => i.remove(identifierOrIdentifierArray));
    return this;
  }

  reset(options: { strategy: 'resetValue' | 'resetServices' }): this {
    this.containers.forEach(i => i.reset(options));
    return this;
  }

  set<T = unknown>(serviceOptions: ServiceOptions<T>): this {
    this.clusterContainer.set(serviceOptions);
    return this;
  }
}
