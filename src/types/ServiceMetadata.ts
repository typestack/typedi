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
     * Indicates if this service must be global and same instance must be used across all containers.
     */
    global?: boolean;

    /**
     * Allows to setup multiple instances the different classes under a single service id string or token.
     */
    multiple?: boolean;

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
