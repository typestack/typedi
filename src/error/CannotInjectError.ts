/**
 * Thrown when DI cannot inject value into property decorated by @Inject decorator.
 */
export class CannotInjectError extends Error {
    name = "ServiceNotFoundError";

    constructor(target: Object, propertyName: string) {
        super(
            `Cannot inject value into "${target.constructor.name}.${propertyName}". ` +
            `Please make sure you setup reflect-metadata properly and you don't use interfaces without service tokens as injection value.`
        );
        Object.setPrototypeOf(this, CannotInjectError.prototype);
    }

}