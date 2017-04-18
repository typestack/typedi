import {ServiceDescriptor} from "../types/ServiceDescriptor";
import {Container} from "../Container";
import {ServiceOptions} from "../types/ServiceOptions";

/**
 * Marks class as a service that can be injected using Container.
 */
export function Service(): Function;

/**
 * Marks class as a service that can be injected using Container.
 */
export function Service(name: string): Function;

/**
 * Marks class as a service that can be injected using Container.
 */
export function Service<T, K extends keyof T>(options?: ServiceOptions<T, K>): Function;

/**
 * Marks class as a service that can be injected using container.
 */
export function Service<T, K extends keyof T>(optionsOrServiceName?: ServiceOptions<T, K>|string): Function {
    return function(target: Function) {

        const options: ServiceDescriptor<T, K> = {
            type: target,
            params: (Reflect as any).getMetadata("design:paramtypes", target)
        };

        if (typeof optionsOrServiceName === "string") {
            options.name = optionsOrServiceName;

        } else if (optionsOrServiceName) {
            options.name = optionsOrServiceName.name;
            options.factory = optionsOrServiceName.factory;
        }

        Container.registerService(options);
    };
}
