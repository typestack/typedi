import {ServiceDescriptor} from "./types/ServiceDescriptor";
import {ConstructorFunction} from "./types/ConstructorFunction";
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
     * Registers a new constructor parameter handler.
     */
    static registerHandler(handler: Handler) {
        this.handlers.push(handler);
    }

    /**
     * Registers a new service.
     *
     * @param descriptor
     */
    static registerService<T, K extends keyof T>(descriptor: ServiceDescriptor<T, K>) {
        this.registeredServices.push(descriptor);
    }

    /**
     * Retrieves the service with the specific name or given type from the service container.
     * Optionally, parameters can be passed in case if instance is initialized in the container for the first time.
     */
    static get<T>(type: ConstructorFunction<T>, params?: any[]): T;
    static get<T>(name: string, params?: any[]): T;
    static get<T>(typeOrName: ConstructorFunction<T>|string, params?: any[]): T {

        // normalize parameters
        let type: Function;
        let name: string;
        let factory: Function|Array<any>;
        if (typeof typeOrName === "string") {
            name = <string> typeOrName;
        } else {
            type = <Function> typeOrName;
        }

        // find if service was already registered
        const serviceDescriptor = this.findRegisteredService(name, type);
        if (serviceDescriptor) {
            if (!type) {
                type = serviceDescriptor.type;
            }
            if (!params) {
                params = serviceDescriptor.params;
            }
            if (serviceDescriptor.factory) {
                factory = serviceDescriptor.factory;
            }
        }

        // find if instance of this object already initialized in the container and return it if it is
        const instance = this.findInstance(name, type);
        if (instance)
            return <T> instance;

        // if named service was requested but service was not registered we throw exception
        if (!type && name)
            throw new Error(`Service named ${name} was not found, probably it was not registered`);

        let objectInstance: any;

        // if params are given we need to go through each of them and initialize them all properly
        if (params) {
            params = this.initializeParams(type, params);
            if (!factory) {
                params.unshift(null);
            }
        }

        // if factory is set then use it to create service instance
        if (factory) {

            // filter out non-service parameters
            params = params ? params.filter(param => param !== undefined) : [];

            if (factory instanceof Array) { // special [Type, "method"] syntax to allow factory services
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
    static set(name: string, value: any): void;
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
     * Resets the container by removing all previously registered artifacts from it.
     */
    static reset () {
        this.instances = [];
        this.handlers = [];
        this.registeredServices = [];
    }

    // -------------------------------------------------------------------------
    // Private Static Methods
    // -------------------------------------------------------------------------

    private static applyPropertyHandlers(target: Function) {
        this.handlers
            .filter(handler => handler.target.constructor === target || target.prototype instanceof handler.target.constructor)
            .forEach(handler => {
                Object.defineProperty(handler.target, handler.propertyName, {
                    enumerable: true,
                    writable: true,
                    configurable: true,
                    value: handler.getValue()
                });
            });
    }

    private static findInstance(name: string, type: Function) {
        if (name) {
            return this.findInstanceByName(name);
        } else if (type) {
            return this.findInstanceByType(type);
        }
    }

    private static findInstanceByName(name: string) {
        return this.instances.reduce((found, typeInstance) => {
            return typeInstance.name === name ? typeInstance.instance : found;
        }, undefined);
    }

    private static findInstanceByType(type: Function) {
        return this.instances.filter(instance => !instance.name).reduce((found, typeInstance) => {
            return typeInstance.type === type ? typeInstance.instance : found;
        }, undefined);
    }

    private static findRegisteredService(name: string, type: Function): ServiceDescriptor<any, any> {
        if (name) {
            return this.findRegisteredServiceByName(name);
        } else if (type) {
            return this.findRegisteredServiceByType(type);
        }
    }

    private static findRegisteredServiceByType(type: Function): ServiceDescriptor<any, any> {
        return this.registeredServices.filter(service => !service.name).reduce((found, service) => {
            return service.type === type || type.prototype instanceof service.type ? service : found;
        }, undefined);
    }

    private static findRegisteredServiceByName(name: string): ServiceDescriptor<any, any> {
        return this.registeredServices.reduce((found, service) => {
            return service.name === name ? service : found;
        }, undefined);
    }

    private static findParamHandler(type: Function, index: number): Handler {
        return this.handlers.reduce((found, handler) => {
            return handler.target === type && handler.index === index ? handler : found;
        }, undefined);
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
