import "reflect-metadata";
import {ParamHandler, PropertyHandler} from "./Handlers";

export class Container {

    // -------------------------------------------------------------------------
    // Static Properties
    // -------------------------------------------------------------------------

    private static instances: { name: string, type: Function, instance: Object }[] = [];
    private static paramHandlers: ParamHandler[] = [];
    private static propertyHandlers: PropertyHandler[] = [];
    private static registeredServices: { name: string, type: Function, params: any[] }[] = [];

    // -------------------------------------------------------------------------
    // Public Static Methods
    // -------------------------------------------------------------------------

    static registerParamHandler(paramHandler: ParamHandler) {
        this.paramHandlers.push(paramHandler);
    }

    static registerPropertyHandler(propertyHandler: PropertyHandler) {
        this.propertyHandlers.push(propertyHandler);
    }

    static registerService(name: string, type: Function, params?: any[]) {
        this.registeredServices.push({ name: name, type: type, params: params });
    }

    static get<T>(type: Function, params?: any[]): T;
    static get<T>(name: string, params?: any[]): T;
    static get<T>(typeOrName: Function|string, params?: any[]): T {
        let type: Function,
            name: string,
            registeredService: { name: string, type: Function, params: any[] },
            instance: T;

        if (typeof typeOrName === 'string') {
            name = <string> typeOrName;
        } else {
            type = <Function> typeOrName;
        }

        if (name) {
            registeredService = this.findRegisteredServiceByName(name);
        } else if (type) {
            registeredService = this.findRegisteredServiceByType(type);
        }

        if (registeredService) {
            if (!type)
                type = registeredService.type;
            if (!params)
                params = registeredService.params;
        }

        if (!type && name)
            throw new Error('Service named "' + name + '" was not found, probably it was not registered');

        if (name) {
            instance = <T> this.findInstanceByName(name);
        } else if (type) {
            instance = <T> this.findInstanceByType(type);
        }
        if (instance)
            return instance;

        if (params) {
            params = this.mapParams(type, params);
            params.unshift(null);
        }

        var objectInstance = new (type.bind.apply(type, params))();
        this.applyPropertyHandlers(type);
        this.instances.push({ name: name, type: type, instance: objectInstance });
        return objectInstance;
    }

    static set(type: Function, value: any): void;
    static set(name: string, type: Function, value: any): void;
    static set(nameOrType: string|Function, typeOrValue: Function|any, value?: any) {

        let name: string, type: Function;
        if (arguments.length === 3) {
            name = <string> nameOrType;
            type = <Function> typeOrValue;
        } else {
            type = <Function> nameOrType;
            value = typeOrValue;
        }

        this.instances.push({ name: name, type: type, instance: value });
    }

    static provide(values: { name?: string, type: Function, value: any }[]) {
        values.forEach(v => this.set(v.name, v.type, v.value));
    }

    // -------------------------------------------------------------------------
    // Private Static Methods
    // -------------------------------------------------------------------------

    private static applyPropertyHandlers(target: Function) {
        this.propertyHandlers
            .filter(propertyHandler => propertyHandler.target.constructor === target)
            .forEach(propertyHandler => {
                Object.defineProperty(propertyHandler.target, propertyHandler.key, {
                    enumerable: true,
                    writable: true,
                    configurable: true,
                    value: propertyHandler.getValue()
                });
            });
    }

    private static findInstanceByName(name: string): Object {
        return this.instances.reduce((found, typeInstance) => {
            return typeInstance.name === name ? typeInstance.instance : found
        }, undefined);
    }

    private static findInstanceByType(type: Function): Object {
        return this.instances.reduce((found, typeInstance) => {
            return typeInstance.type === type ? typeInstance.instance : found
        }, undefined);
    }

    private static findRegisteredServiceByType(type: Function) {
        return this.registeredServices.reduce((found, service) => {
            return service.type === type ? service : found;
        }, undefined);
    }

    private static findRegisteredServiceByName(name: string) {
        return this.registeredServices.reduce((found, service) => {
            return service.name === name ? service : found;
        }, undefined);
    }

    private static findParamHandler(type: Function, index: number): ParamHandler {
        return this.paramHandlers.reduce((found, param) => {
            return param.type === type && param.index === index ? param : found
        }, undefined);
    }

    private static mapParams(type: Function, params: any[]): any[] {
        return params.map((param, key) => {
            let paramHandler = this.findParamHandler(type, key);
            if (paramHandler)
                return paramHandler.getValue();

            if (this.isParamValid(param))
                return Container.get(param);

            return undefined;
        });
    }

    private static isParamValid(param: any): boolean {
        const ignoredTypes = ['string', 'boolean', 'number', 'object'];
        if (param && param.name && ignoredTypes.indexOf(param.name.toLowerCase()) !== -1)
            return false;

        return true;
    }

}