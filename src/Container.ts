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
     * Registers a new handler.
     */
    static registerHandler(handler: Handler) {
        this.handlers.push(handler);
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

        // find if service already was registered
        let service = this.findService(identifier);

        // find if instance of this object already initialized in the container and return it if it is
        if (service && service.value !== null && service.value !== undefined)
            return service.value as T;

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
        let params: any[] = paramTypes ? this.initializeParams(type, paramTypes) : [];

        // if factory is set then use it to create service instance
        if (service.factory) {

            // filter out non-service parameters from created service constructor
            // non-service parameters can be, lets say Car(name: string, isNew: boolean, engine: Engine)
            // where name and isNew are non-service parameters and engine is a service parameter
            params = params.filter(param => param !== undefined);

            if (service.factory instanceof Array) {
                // use special [Type, "create"] syntax to allow factory services
                // in this case Type instance will be obtained from Container and its method "create" will be called
                service.value = (this.get(service.factory[0]) as any)[service.factory[1]](...params);

            } else { // regular factory function
                service.value = service.factory(...params);
            }

        } else {  // otherwise simply create a new object instance
            if (!type)
                throw new MissingProvidedServiceTypeError(identifier);

            params.unshift(null);
            service.value = new (type.bind.apply(type, params))();
        }

        if (type)
            this.applyPropertyHandlers(type);
        return service.value as T;
    }

    static getAllByTag<T>(tag: string|Token<T>): Array<T> {
        return this.services
          .filter(service => service.tags && service.tags.find(availableTag => availableTag === tag))
          .map(service => this.get(service.type) as T)
          ;
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
        const service = this.findService(newService.id);
        if (service) {
            Object.assign(service, newService);
        } else {
            this.services.push(newService);
        }

        return this;
    }

    /**
     * Removes services with a given service identifiers (tokens or types).
     */
    static remove(...ids: ServiceIdentifier[]) {
        ids.forEach(id => {
            const service = this.findService(id);
            if (service)
                this.services.splice(this.services.indexOf(service), 1);
        });
    }

    /**
     * Completely resets the container by removing all previously registered services and handlers from it.
     */
    static reset() {
        this.handlers = [];
        this.services = [];
    }

    // -------------------------------------------------------------------------
    // Private Static Methods
    // -------------------------------------------------------------------------

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
    private static initializeParams(type: Function, paramTypes: any[]): any[] {
        return paramTypes.map((paramType, index) => {
            const paramHandler = this.handlers.find(handler => handler.object === type && handler.index === index);
            if (paramHandler)
                return paramHandler.value();

            if (paramType && paramType.name && !this.isTypePrimitive(paramType.name))
                return Container.get(paramType);

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
}
