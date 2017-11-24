import {ObjectType} from "./ObjectType";
import {Token} from "../Token";

/**
 * Service options passed to the @Service() decorator.
 * Allows to specify service id and/or factory used to create this service.
 */
export interface ServiceOptions<T, K extends keyof T> {

    /**
     * Service scope.
     *
     * - "singleton" means container will create a single (global) instance of this class.
     * - "prototype" means you can have multiple instances the different classes under a single service id string or token.
     * - "request" - means you'll have different instances of the same class per user request. Implementation depends on http (or other) framework you are using.
     *
     * Default is "singleton".
     */
    scope?: "singleton"|"prototype"|"request";

    /**
     * Unique service id.
     */
    id?: string|Token<any>;

    /**
     * Factory used to produce this service.
     */
    factory?: [ObjectType<T>, K]|((...params: any[]) => any);

}