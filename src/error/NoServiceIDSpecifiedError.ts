import {ServiceIdentifier} from "../types/ServiceIdentifier";
import {Token} from "../Token";

/**
 * Thrown when provider.id was not specified.
 */
export class NoServiceIDSpecifiedError extends Error {
    name = "NoServiceIDSpecifiedError";

    constructor() {
        super();

        this.message = `A service without ID was added in a Container.provide([...]).` +
            `You must set the ID when you add a service using the object way.`;

        Object.setPrototypeOf(this, NoServiceIDSpecifiedError.prototype);
    }

}
