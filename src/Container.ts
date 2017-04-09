import {ParamHandler, PropertyHandler} from "./Handlers";

/**
 * Special type that allows to use Function and to known its type as T.
 */
export type ConstructorFunction<T> = { new (...args: any[]): T };

/**
 * Service container.
 */
export class Container {

    // -------------------------------------------------------------------------
    // Private Static Properties
    // -------------------------------------------------------------------------

    private static instances: { name: string, type: Function, instance: Object }[] = [];
    private static paramHandlers: ParamHandler[] = [];
    private static propertyHandlers: PropertyHandler[] = [];
    private static registeredServices: { name: string, type: Function, params: any[], factory?: Function }[] = [];

    // -------------------------------------------------------------------------
    // Public Static Methods
    // -------------------------------------------------------------------------

    /**
     * Registers a new constructor parameter handler.
     */
    static registerParamHandler(paramHandler: ParamHandler) {
        this.paramHandlers.push(paramHandler);
    }

    /**
     * Registers a new class property handler.
     */
    static registerPropertyHandler(propertyHandler: PropertyHandler) {
        this.propertyHandlers.push(propertyHandler);
    }

    /**
     * Registers a new service.
     *
     * @param name Service name. Optional
     * @param type Service class
     * @param params Parameters to be sent to a class constructor or factory function on service initialization
     * @param factory Factory function to be called on service initialization
     */
    static registerService(name: string, type: Function, params?: any[], factory?: Function) {
        this.registeredServices.push({ name: name, type: type, params: params, factory: factory });
    }

    /**
     * Retrieves the service with the specific name or given type from the service container.
     * Optionally, parameters can be passed in case if instance is initialized in the container for the first time.
     */
    static get<T>(type: ConstructorFunction<T>, params?: any[]): T;
    static get<T>(name: string, params?: any[]): T;
    static get<T>(typeOrName: ConstructorFunction<T>|string, params?: any[]): T {

        // normalize parameters
        let type: Function, name: string;
        if (typeof typeOrName === "string") {
            name = <string> typeOrName;
        } else {
            type = <Function> typeOrName;
        }

        let factory: Function;

        // find if service was already registered
        const registeredService = this.findRegisteredService(name, type);
        if (registeredService) {
            if (!type)
                type = registeredService.type;
            if (!params)
                params = registeredService.params;
            factory = registeredService.factory;
        }

        // find if instance of this object already initialized in the container and return it if it is
        const instance = this.findInstance(name, type);
        if (instance)
            return <T> instance;

        // if named service was requested but service was not registered we throw exception
        if (!type && name)
            throw new Error(`Service named ${name} was not found, probably it was not registered`);

        // if params are given we need to go throw each of them and initialize them all properly
        if (params) {
            params = this.initializeParams(type, params);
            params.unshift(null);
        }

        let objectInstance: any;

        if (factory) {
            // Calling factory function if specified to create an instance.
            objectInstance = factory.apply(undefined, params);
        } else {
            // Calling class constructor to create an instance.
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

    // -------------------------------------------------------------------------
    // Private Static Methods
    // -------------------------------------------------------------------------

    private static applyPropertyHandlers(target: Function) {
        this.propertyHandlers
            .filter(propertyHandler => propertyHandler.target.constructor === target || target.prototype instanceof propertyHandler.target.constructor)
            .forEach(propertyHandler => {
                Object.defineProperty(propertyHandler.target, propertyHandler.key, {
                    enumerable: true,
                    writable: true,
                    configurable: true,
                    value: propertyHandler.getValue()
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

    private static findRegisteredService(name: string, type: Function) {
        if (name) {
            return this.findRegisteredServiceByName(name);
        } else if (type) {
            return this.findRegisteredServiceByType(type);
        }
    }

    private static findRegisteredServiceByType(type: Function) {
        return this.registeredServices.filter(service => !service.name).reduce((found, service) => {
            // console.log(service.type, "::", type);
            // console.log(type.prototype instanceof service.type);
            return service.type === type || type.prototype instanceof service.type ? service : found;
        }, undefined);
    }

    private static findRegisteredServiceByName(name: string) {
        return this.registeredServices.reduce((found, service) => {
            return service.name === name ? service : found;
        }, undefined);
    }

    private static findParamHandler(type: Function, index: number): ParamHandler {
        return this.paramHandlers.reduce((found, param) => {
            return param.type === type && param.index === index ? param : found;
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