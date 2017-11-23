/**
 * Thrown when service is registered without type.
 */
export class MissingProvidedServiceTypeError extends Error {
    name = "ServiceNotFoundError";

    constructor(identifier: any) {
        super(`Cannot determine a class of the requesting service "${identifier}"`);
        Object.setPrototypeOf(this, MissingProvidedServiceTypeError.prototype);
    }

}