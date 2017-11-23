import { ServiceIdentifier } from "../types/ServiceIdentifier";
import { Token } from "../Token";
import { Provider } from "../types/Providers";

/**
 * Thrown when provider is not a type of Provider
 */
export class ProviderUnknown extends Error {
    name = "ProviderUnknown";

    constructor(provider: Provider) {
        super();

        const identifier = provider.id;
        if (typeof identifier === "string") {
            this.message = `Service "${identifier}" must be provided by a class, factory, value or existing service.`;
        } else if (identifier instanceof Token && identifier.name) {
            this.message = `Service "${identifier.name}" must be provided by a class, factory, value or existing service.`;
        } else {
            this.message = `Service "${identifier}" must be provided by a class, factory, value or existing service.`;
        }

        Object.setPrototypeOf(this, ProviderUnknown.prototype);
    }

}
