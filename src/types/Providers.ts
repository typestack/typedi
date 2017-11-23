import {ObjectType} from "./ObjectType";
import {ServiceIdentifier} from "./ServiceIdentifier";

/**
 * Type that reflect all of providers
 */
export type Provider = ClassProvider | ExistingProvider | FactoryProvider | ValueProvider;

/**
 * All providers must contain an ID
 */
export interface ProviderByID {
    id: ServiceIdentifier;
}

/**
 * Use a class as service.
 * It's similiar to add directly the class.
 * Container.provide([TestService]) === Container.Provider([{id: TestService, class: TestService}])
 */
export interface ClassProvider extends ProviderByID {
    class: ObjectType<any>;
}

/**
 * Use a factory to create your service.
 * Defining the deps property, you can override the services required 
 * by the constructor (if the ID is a function/class).
 */
export interface FactoryProvider extends ProviderByID {
    factory: [ObjectType<any>, any]|((...params: any[]) => any);
    deps?: ServiceIdentifier[];
}

/**
 * Use an already defined service
 */
export interface ExistingProvider extends ProviderByID {
    existing: ServiceIdentifier;
}

/**
 * Use whatever value (number, string, object, etc.)
 */
export interface ValueProvider extends ProviderByID {
    value: any;
}

/**
 * Is the provider a ValueProvider?
 */
export function isValueProvider(provider: Provider): provider is ValueProvider {
    return "value" in provider;
}


/**
 * Is the provider a ClassProvider?
 */
export function isClassProvider(provider: Provider): provider is ClassProvider {
    return "class" in provider;
}

/**
 * Is the provider a FactoryProvider?
 */
export function isFactoryProvider(provider: Provider): provider is FactoryProvider {
    return "factory" in provider;
}

/**
 * Is the provider a ExistingProvider?
 */
export function isExistingProvider(provider: Provider): provider is ExistingProvider {
    return "existing" in provider;
}
