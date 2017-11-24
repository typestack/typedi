import {ObjectType} from "./ObjectType";
import {Token} from "../Token";

/**
 * Service metadata is used to initialize service and store its state.
 */
export interface ServiceMetadata<T, K extends keyof T> {

    /**
     * Class type of the registering service.
     * Can be omitted only if instance is set.
     * If id is not set then it serves as service id.
     */
    type?: Function;

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
     * Service unique identifier.
     */
    id?: Token<any>|string|Function;

    /**
     * Factory function used to initialize this service.
     * Can be regular function ("createCar" for example),
     * or other service which produces this instance ([CarFactory, "createCar"] for example).
     */
    factory?: [ObjectType<T>, K]|((...params: any[]) => any);

    /**
     * Instance of the target class.
     */
    value?: any;

}
