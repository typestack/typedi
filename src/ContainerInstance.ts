import {ServiceMetadata} from "./types/ServiceMetadata";
import {ObjectType} from "./types/ObjectType";
import {Token} from "./Token";
import {ServiceIdentifier} from "./types/ServiceIdentifier";
import {ServiceNotFoundError} from "./error/ServiceNotFoundError";
import {MissingProvidedServiceTypeError} from "./error/MissingProvidedServiceTypeError";
import {Container} from "./Container";

/**
 * TypeDI can have multiple containers.
 * One container is ContainerInstance.
 */
export class ContainerInstance {

    // -------------------------------------------------------------------------
    // Public Properties
    // -------------------------------------------------------------------------

    /**
     * Container instance id.
     */
    id: any;

    // -------------------------------------------------------------------------
    // Private Properties
    // -------------------------------------------------------------------------

    /**
     * All registered services.
     */
    private services: ServiceMetadata<any, any>[] = [];

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    constructor(id: any) {
        this.id = id;
    }

    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------

    /**
     * Checks if the service with given name or type is registered service container.
     * Optionally, parameters can be passed in case if instance is initialized in the container for the first time.
     */
    has<T>(type: ObjectType<T>): boolean;

    /**
     * Checks if the service with given name or type is registered service container.
     * Optionally, parameters can be passed in case if instance is initialized in the container for the first time.
     */
    has<T>(id: string): boolean;

    /**
     * Checks if the service with given name or type is registered service container.
     * Optionally, parameters can be passed in case if instance is initialized in the container for the first time.
     */
    has<T>(id: Token<T>): boolean;

    /**
     * Checks if the service with given name or type is registered service container.
     * Optionally, parameters can be passed in case if instance is initialized in the container for the first time.
     */
    has<T>(identifier: ServiceIdentifier): boolean {
        return !!this.findService(identifier);
    }

    /**
     * Retrieves the service with given name or type from the service container.
     * Optionally, parameters can be passed in case if instance is initialized in the container for the first time.
     */
    get<T>(type: ObjectType<T>): T;

    /**
     * Retrieves the service with given name or type from the service container.
     * Optionally, parameters can be passed in case if instance is initialized in the container for the first time.
     */
    get<T>(id: string): T;

    /**
     * Retrieves the service with given name or type from the service container.
     * Optionally, parameters can be passed in case if instance is initialized in the container for the first time.
     */
    get<T>(id: Token<T>): T;

    /**
     * Retrieves the service with given name or type from the service container.
     * Optionally, parameters can be passed in case if instance is initialized in the container for the first time.
     */
    get<T>(identifier: ServiceIdentifier): T {
        let service = this.findService(identifier);

        // in the case if service was not found registered we search in the global container for this service
        if (!service) {
            const globalService = Container.of(undefined).findService(identifier);
            if (globalService && globalService.global === true)
                service = globalService;
        }

        return this.getServiceValue(identifier, service);
    }

    /**
     * Gets all instances registered in the container of the given service identifier.
     * Used when service defined with multiple: true flag.
     */
    getMany<T>(id: string): T[];

    /**
     * Gets all instances registered in the container of the given service identifier.
     * Used when service defined with multiple: true flag.
     */
    getMany<T>(id: Token<T>): T[];

    /**
     * Gets all instances registered in the container of the given service identifier.
     * Used when service defined with multiple: true flag.
     */
    getMany<T>(id: string|Token<T>): T[] {
        return this.filterServices(id).map(service => this.getServiceValue(id, service));
    }

    /**
     * Sets a value for the given type or service name in the container.
     */
    set<T, K extends keyof T>(service: ServiceMetadata<T, K>): this;

    /**
     * Sets a value for the given type or service name in the container.
     */
    set(type: Function, value: any): this;

    /**
     * Sets a value for the given type or service name in the container.
     */
    set(name: string, value: any): this;

    /**
     * Sets a value for the given type or service name in the container.
     */
    set(token: Token<any>, value: any): this;

    /**
     * Sets a value for the given type or service name in the container.
     */
    set<T, K extends keyof T>(values: ServiceMetadata<T, K>[]): this;

    /**
     * Sets a value for the given type or service name in the container.
     */
    set(identifierOrServiceMetadata: ServiceIdentifier|ServiceMetadata<any, any>|(ServiceMetadata<any, any>[]), value?: any): this {
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
        if (service && service.multiple !== true) {
            Object.assign(service, newService);
        } else {
            this.services.push(newService);
        }

        return this;
    }

    /**
     * Removes services with a given service identifiers (tokens or types).
     */
    remove(...ids: ServiceIdentifier[]): this {
        ids.forEach(id => {
            this.filterServices(id).forEach(service => {
                this.services.splice(this.services.indexOf(service), 1);
            });
        });
        return this;
    }

    /**
     * Completely resets the container by removing all previously registered services from it.
     */
    reset(): this {
        this.services = [];
        return this;
    }

    // -------------------------------------------------------------------------
    // Private Methods
    // -------------------------------------------------------------------------

    /**
     * Filters registered service in the with a given service identifier.
     */
    private filterServices(identifier: ServiceIdentifier): ServiceMetadata<any, any>[] {
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
    private findService(identifier: ServiceIdentifier): ServiceMetadata<any, any>|undefined {
        return this.services.find(service => {
            if (service.id)
                return service.id === identifier;

            if (service.type && identifier instanceof Function)
                return service.type === identifier || identifier.prototype instanceof service.type;

            return false;
        });
    }

    /**
     * Gets service value.
     */
    private getServiceValue(identifier: ServiceIdentifier, service: ServiceMetadata<any, any>|undefined): any {

        // find if instance of this object already initialized in the container and return it if it is
        if (service && service.value !== null && service.value !== undefined)
            return service.value;

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

            // if there are no constructor parameters in the class then pass a container instance into it
            // this allows us to support javascript where we don't have decorators and emitted metadata about dependencies
            // need to be injected, and user can use provided container to get instances he needs
            if (params.length === 1)
                params.push(this);

            service.value = new (type.bind.apply(type, params))();
        }

        if (type)
            this.applyPropertyHandlers(type, service.value);

        return service.value;
    }

    /**
     * Initializes all parameter types for a given target service class.
     */
    private initializeParams(type: Function, paramTypes: any[]): any[] {
        return paramTypes.map((paramType, index) => {
            const paramHandler = Container.handlers.find(handler => handler.object === type && handler.index === index);
            if (paramHandler)
                return paramHandler.value(this);

            if (paramType && paramType.name && !this.isTypePrimitive(paramType.name)) {
                return this.get(paramType);
            }

            return undefined;
        });
    }

    /**
     * Checks if given type is primitive (e.g. string, boolean, number, object).
     */
    private isTypePrimitive(param: string): boolean {
        return ["string", "boolean", "number", "object"].indexOf(param.toLowerCase()) !== -1;
    }

    /**
     * Applies all registered handlers on a given target class.
     */
    private applyPropertyHandlers(target: Function, instance: { [key: string]: any }) {
        Container.handlers.forEach(handler => {
            if (typeof handler.index === "number") return;
            if (handler.object.constructor !== target && !(target.prototype instanceof handler.object.constructor))
                return;

            instance[handler.propertyName] = handler.value(this);
        });
    }

}
