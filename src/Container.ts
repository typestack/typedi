import {ServiceMetadata} from "./types/ServiceMetadata";
import {ObjectType} from "./types/ObjectType";
import {Handler} from "./types/Handler";
import {Token} from "./Token";
import {ServiceIdentifier} from "./types/ServiceIdentifier";
import {ServiceNotFoundError} from "./error/ServiceNotFoundError";
import {MissingProvidedServiceTypeError} from "./error/MissingProvidedServiceTypeError";

/**
 * Service container.
 */
export class Container {

    // -------------------------------------------------------------------------
    // Private Static Properties
    // -------------------------------------------------------------------------

    /**
     * All registered services.
     */
    private static services: ServiceMetadata<any, any>[] = [];

    /**
     * All registered handlers.
     */
    private static handlers: Handler[] = [];

    // -------------------------------------------------------------------------
    // Public Static Methods
    // -------------------------------------------------------------------------

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
        return this.getServiceValue(identifier, undefined, this.findService(identifier));
    }

    /**
     * Gets all instances registered in the container of the given service identifier.
     * Used to get services in "prototype" scope.
     */
    static getMany<T>(id: string): T[];

    /**
     * Gets all instances registered in the container of the given service identifier.
     * Used to get services in "prototype" scope.
     */
    static getMany<T>(id: Token<T>): T[];

    /**
     * Gets all instances registered in the container of the given service identifier.
     * Used to get services in "prototype" scope.
     */
    static getMany<T>(id: string|Token<T>): T[] {
        return this.filterServices(id).map(service => this.getServiceValue(id, undefined, service));
    }

    /**
     * Gets a request-based service instance.
     * Used to get services from the "request" scope.
     */
    static getFromRequest<T>(request: any, type: ObjectType<T>): T;

    /**
     * Gets a request-based service instance.
     * Used to get services from the "request" scope.
     */
    static getFromRequest<T>(request: any, id: string): T;

    /**
     * Gets a request-based service instance.
     * Used to get services from the "request" scope.
     */
    static getFromRequest<T>(request: any, id: Token<T>): T;

    /**
     * Gets a request-based service instance.
     * Used to get services from the "request" scope.
     */
    static getFromRequest<T>(request: any, identifier: ServiceIdentifier): T {
        return this.getServiceValue(identifier, request, this.findService(identifier));
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
        if (identifierOrServiceMetadata instanceof Array) {
            identifierOrServiceMetadata.forEach((v: any) => this.set(v));
            return this;
        }
        if (typeof identifierOrServiceMetadata === "string" || identifierOrServiceMetadata instanceof Token) {
            return this.set({ id: identifierOrServiceMetadata, value: value });
        }
        if (identifierOrServiceMetadata instanceof Function) {
            return this.set({ type: identifierOrServiceMetadata, id: identifierOrServiceMetadata, value: value });
        }

        // const newService: ServiceMetadata<any, any> = arguments.length === 1 && typeof identifierOrServiceMetadata === "object"  && !(identifierOrServiceMetadata instanceof Token) ? identifierOrServiceMetadata : undefined;
        const newService: ServiceMetadata<any, any> = identifierOrServiceMetadata;
        if (newService.scope === "prototype") {
            this.services.push(newService);

        } else {
            const service = this.findService(newService.id);
            if (service) {
                Object.assign(service, newService);
            } else {
                this.services.push(newService);
            }
        }

        return this;
    }

    /**
     * Removes services with a given service identifiers (tokens or types).
     */
    static remove(...ids: ServiceIdentifier[]): Container {
        ids.forEach(id => {
            this.filterServices(id).forEach(service => {
                this.services.splice(this.services.indexOf(service), 1);
            });
        });
        return this;
    }

    /**
     * Removes services with a given service identifiers (tokens or types).

    static removeFromRequest(request: any, ...ids: ServiceIdentifier[]): Container {
        ids.forEach(id => {
            this.filterServices(id).forEach(service => {
                if (service.scope === "request" && service.value instanceof Array) {
                    const requestValue = service.value.find(value => value.request === request);
                    if (requestValue)
                        this.services.splice(this.services.indexOf(service), 1);
                }
            });
        });
        return this;
    } */

    /**
     * Completely resets the container by removing all previously registered services and handlers from it.
     */
    static reset(): Container {
        this.handlers = [];
        this.services = [];
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

    // -------------------------------------------------------------------------
    // Private Static Methods
    // -------------------------------------------------------------------------

    /**
     * Filters registered service in the with a given service identifier.
     */
    private static filterServices(identifier: ServiceIdentifier): ServiceMetadata<any, any>[] {
        return this.services.filter(service => {
            if (service.id)
                return service.id === identifier;

            if (service.type && identifier instanceof Function)
                return service.type === identifier || identifier.prototype instanceof service.type;

            return false;
        });
    }

    /**
     * Finds registered service in the with a given service identifier.
     */
    private static findService(identifier: ServiceIdentifier): ServiceMetadata<any, any>|undefined {
        return this.services.find(service => {
            if (service.id)
                return service.id === identifier;

            if (service.type && identifier instanceof Function)
                return service.type === identifier || identifier.prototype instanceof service.type;

            return false;
        });
    }

    /**
     * Initializes all parameter types for a given target service class.
     */
    private static initializeParams(type: Function, request: any, paramTypes: any[]): any[] {
        return paramTypes.map((paramType, index) => {
            const paramHandler = this.handlers.find(handler => handler.object === type && handler.index === index);
            if (paramHandler)
                return paramHandler.value();

            if (paramType && paramType.name && !this.isTypePrimitive(paramType.name)) {
                if (request) {
                    return Container.getFromRequest(request, paramType);

                } else {
                    return Container.get(paramType);
                }
            }

            return undefined;
        });
    }

    /**
     * Checks if given type is primitive (e.g. string, boolean, number, object).
     */
    private static isTypePrimitive(param: string): boolean {
        return ["string", "boolean", "number", "object"].indexOf(param.toLowerCase()) !== -1;
    }

    /**
     * Applies all registered handlers on a given target class.
     */
    private static applyPropertyHandlers(target: Function) {
        this.handlers.forEach(handler => {
            if (handler.index) return;
            if (handler.object.constructor !== target && !(target.prototype instanceof handler.object.constructor))
                return;

            Object.defineProperty(handler.object, handler.propertyName, {
                enumerable: true,
                writable: true,
                configurable: true,
                value: handler.value()
            });
        });
    }

    /**
     * Gets service value.
     */
    private static getServiceValue(identifier: ServiceIdentifier, request: any, service: ServiceMetadata<any, any>|undefined): any {

        // find if instance of this object already initialized in the container and return it if it is
        if (service && service.value !== null && service.value !== undefined) {
            if (request) {
                if (service.value) {
                    const requestValue = service.value.find((value: { request: any, value: any }) => value.request === request);
                    if (requestValue !== null && requestValue !== undefined)
                        return requestValue.value;
                }

            } else {
                return service.value;
            }
        }

        // if named service was requested and its instance was not found plus there is not type to know what to initialize,
        // this means service was not pre-registered and we throw an exception
        if ((!service || !service.type) &&
            (!service || !service.factory) &&
            (typeof identifier === "string" || identifier instanceof Token))
            throw new ServiceNotFoundError(identifier);

        // at this point we either have type in service registered, either identifier is a target type
        let type = undefined;
        if (service && service.type) {
            type = service.type;

        } else if (service && service.id instanceof Function) {
            type = service.id;

        } else if (identifier instanceof Function) {
            type = identifier;
        }

        // if service was not found then create a new one and register it
        if (!service) {
            if (!type)
                throw new MissingProvidedServiceTypeError(identifier);

            service = { type: type };
            this.services.push(service);
        }

        // setup constructor parameters for a newly initialized service
        const paramTypes = type && Reflect && (Reflect as any).getMetadata ? (Reflect as any).getMetadata("design:paramtypes", type) : undefined;
        let params: any[] = paramTypes ? this.initializeParams(type, request, paramTypes) : [];

        // if factory is set then use it to create service instance
        let value: any;
        if (service.factory) {

            // filter out non-service parameters from created service constructor
            // non-service parameters can be, lets say Car(name: string, isNew: boolean, engine: Engine)
            // where name and isNew are non-service parameters and engine is a service parameter
            params = params.filter(param => param !== undefined);

            if (service.factory instanceof Array) {
                // use special [Type, "create"] syntax to allow factory services
                // in this case Type instance will be obtained from Container and its method "create" will be called
                if (request) {
                    value = (this.getFromRequest(request, service.factory[0]) as any)[service.factory[1]](...params);

                } else {
                    value = (this.get(service.factory[0]) as any)[service.factory[1]](...params);
                }

            } else { // regular factory function
                value = service.factory(...params);
            }

        } else {  // otherwise simply create a new object instance
            if (!type)
                throw new MissingProvidedServiceTypeError(identifier);

            params.unshift(null);
            value = new (type.bind.apply(type, params))();
        }

        if (request) {
            if (!service.value)
                service.value = [];
            service.value.push({ request: request, value: value });

        } else {
            service.value = value;
        }

        if (type)
            this.applyPropertyHandlers(type);

        return value;
    }

}
