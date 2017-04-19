import {ServiceDescriptor} from "./types/ServiceDescriptor";
import {ObjectType} from "./types/ObjectType";
import {Handler} from "./types/Handler";

/**
 * Service container.
 */
export class Container {

    // -------------------------------------------------------------------------
    // Private Static Properties
    // -------------------------------------------------------------------------

    private static instances: { name: string, type: Function, instance: Object }[] = [];
    private static handlers: Handler[] = [];
    private static registeredServices: ServiceDescriptor<any, any>[] = [];

    // -------------------------------------------------------------------------
    // Public Static Methods
    // -------------------------------------------------------------------------

    /**
     * Registers a new handler.
     */
    static registerHandler(handler: Handler) {
        this.handlers.push(handler);
    }

    /**
     * Registers a new service.
     */
    static registerService<T, K extends keyof T>(descriptor: ServiceDescriptor<T, K>) {
        this.registeredServices.push(descriptor);
    }

    /**
     * Retrieves the service with given name or type from the service container.
     * Optionally, parameters can be passed in case if instance is initialized in the container for the first time.
     */
    static get<T>(type: ObjectType<T>, params?: any[]): T;

    /**
     * Retrieves the service with given name or type from the service container.
     * Optionally, parameters can be passed in case if instance is initialized in the container for the first time.
     */
    static get<T>(name: string, params?: any[]): T;

    /**
     * Retrieves the service with given name or type from the service container.
     * Optionally, parameters can be passed in case if instance is initialized in the container for the first time.
     */
    static get<T>(identifier: ObjectType<T>|string, params?: any[]): T {

        // normalize parameters
        let type: Function;
        let name: string;
        let factory: Function|Array<any>;

        if (typeof identifier === "string") {
            name = identifier;
        } else {
            type = identifier as Function;
        }

        // find if service was already registered
        const serviceDescriptor = this.findRegisteredService(identifier);
        if (serviceDescriptor) {
            if (!type)
                type = serviceDescriptor.type;

            if (!params)
                params = serviceDescriptor.params;

            if (serviceDescriptor.factory)
                factory = serviceDescriptor.factory;
        }

        // find if instance of this object already initialized in the container and return it if it is
        const instance = this.findInstance(identifier);
        if (instance)
            return instance.instance as T;

        // if instance was not found and named service was requested, this means service was not registered and we throw exception
        if (identifier === "string")
            throw new Error(`Service named "${identifier}" was not found, probably it was not registered`);

        // if params are given we need to go through each of them and initialize them all properly
        if (params) {
            params = this.initializeParams(identifier as Function, params);
            if (!factory) {
                params.unshift(null);
            }
        }

        // now we create service instance and
        let objectInstance: any;

        // if factory is set then use it to create service instance
        if (factory) {

            // filter out non-service parameters from created service constructor
            // non-service parameters can be, lets say Car(name: string, isNew: boolean, engine: Engine)
            // where name and isNew are non-service parameters and engine is a service parameter
            params = params ? params.filter(param => param !== undefined) : [];

            if (factory instanceof Array) {
                // use special [Type, "create"] syntax to allow factory services
                // in this case Type instance will be obtained from Container and its method "create" will be called
                objectInstance = (this.get(factory[0]) as any)[factory[1]](...params);

            } else { // regular factory function
                objectInstance = factory(...params);
            }

        } else {

            // otherwise simply create a new object instance
            objectInstance = new (type.bind.apply(type, params))();
        }

        this.instances.push({ name: name, type: type, instance: objectInstance });
        this.applyPropertyHandlers(type);
        return objectInstance;
    }

    /**
     * Sets a value for the given type or service name in the container.
     */
    static set(type: Function, value: any): void;

    /**
     * Sets a value for the given type or service name in the container.
     */
    static set(name: string, value: any): void;

    /**
     * Sets a value for the given type or service name in the container.
     */
    static set(nameOrType: string|Function, typeOrValue: Function|any) {

        if (typeof nameOrType === "string") {
            this.instances.push({
                name: nameOrType,
                type: undefined,
                instance: typeOrValue
            });
        } else {
            this.instances.push({
                name: undefined,
                type: <Function> nameOrType,
                instance: typeOrValue
            });
        }
    }

    /**
     * Provides a set of values to be saved in the container.
     */
    static provide(values: { name?: string, type?: Function, value: any }[]) {
        values.forEach(v => {
            if (v.name) {
                this.set(v.name, v.value);
            } else {
                this.set(v.type, v.value);
            }
        });
    }

    /**
     * Completely resets the container by removing all previously registered services and handlers from it.
     */
    static reset() {
        this.instances = [];
        this.handlers = [];
        this.registeredServices = [];
    }

    static remove(...services: Function[]) {
        services.forEach(service => {
            this.set(service, undefined);
        });
    }

    // -------------------------------------------------------------------------
    // Private Static Methods
    // -------------------------------------------------------------------------

    private static findInstance(identifier: string|Function) {
        if (typeof identifier === "string") {
            return this.instances.find(instance => instance.name === identifier);

        } else if (identifier) {
            return this.instances.find(instance => instance.type === identifier);
        }
    }

    private static findRegisteredService(identifier: string|Function): ServiceDescriptor<any, any> {
        if (typeof identifier === "string") {
            return this.registeredServices.find(service => service.name === identifier);

        } else {
            return this.registeredServices.find(service => {
                return service.type === identifier || identifier.prototype instanceof service.type;
            });
        }
    }

    private static findParamHandler(type: Function, index: number): Handler {
        return this.handlers.find(handler => handler.target === type && handler.index === index);
    }

    private static applyPropertyHandlers(target: Function) {
        this.handlers.forEach(handler => {
            if (handler.target.constructor !== target && !(target.prototype instanceof handler.target.constructor))
                return;

            Object.defineProperty(handler.target, handler.propertyName, {
                enumerable: true,
                writable: true,
                configurable: true,
                value: handler.getValue()
            });
        });
    }

    private static initializeParams(type: Function, params: any[]): any[] {
        return params.map((param, index) => {
            const paramHandler = Container.findParamHandler(type, index);
            if (paramHandler)
                return paramHandler.getValue();

            if (param && param.name && !this.isTypeSimple(param.name))
                return Container.get(param);

            return undefined;
        });
    }

    private static isTypeSimple(param: string): boolean {
        return ["string", "boolean", "number", "object"].indexOf(param.toLowerCase()) !== -1;
    }

}
