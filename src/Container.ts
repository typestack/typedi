import {ServiceMetadata} from "./types/ServiceMetadata";
import {ObjectType} from "./types/ObjectType";
import {Handler} from "./types/Handler";
import {Token} from "./Token";
import {ServiceIdentifier} from "./types/ServiceIdentifier";
import {ContainerInstance} from "./ContainerInstance";

/**
 * Service container.
 */
export class Container {

    // -------------------------------------------------------------------------
    // Private Static Properties
    // -------------------------------------------------------------------------

    /**
     * Global container instance.
     */
    private static readonly globalInstance: ContainerInstance = new ContainerInstance(undefined);

    /**
     * Other containers created using Container.of method.
     */
    private static readonly instances: ContainerInstance[] = [];

    /**
     * All registered handlers.
     */
    static readonly handlers: Handler[] = [];

    // -------------------------------------------------------------------------
    // Public Static Methods
    // -------------------------------------------------------------------------

    /**
     * Gets a separate container instance for the given instance id.
     */
    static of(instanceId: any): ContainerInstance {
        if (instanceId === undefined)
            return this.globalInstance;

        let container = this.instances.find(instance => instance.id === instanceId);
        if (!container) {
            container = new ContainerInstance(instanceId);
            this.instances.push(container);
        }

        return container;
    }

    /**
     * Retrieves the service with given name or type from the service container.
     * Optionally, parameters can be passed in case if instance is initialized in the container for the first time.
     */
    static get<T>(type: ObjectType<T>): T;

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
    static get<T>(identifier: ServiceIdentifier): T {
        return this.globalInstance.get(identifier as any);
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
    static getMany<T>(id: string|Token<T>): T[] {
        return this.globalInstance.getMany(id as any);
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
    static set(identifierOrServiceMetadata: ServiceIdentifier|ServiceMetadata<any, any>|(ServiceMetadata<any, any>[]), value?: any): Container {
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
    static import(services: Function[]): Container {
        return this;
    }

}
