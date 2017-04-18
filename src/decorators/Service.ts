import {ServiceDescriptor} from "../types/ServiceDescriptor";
import {Container} from "../Container";

/**
 * Marks class as a service that can be injected using container.
 */
export function Service(): Function;

/**
 * Marks class as a service that can be injected using container.
 */
export function Service(name: string): Function;

/**
 * Marks class as a service that can be injected using container.
 */
export function Service<T, K extends keyof T>(options?: ServiceDescriptor<T, K>): Function;

/**
 * Marks class as a service that can be injected using container.
 */
export function Service<T, K extends keyof T>(optionsOrServiceName?: ServiceDescriptor<T, K>|string): Function {
    return function(target: Function) {
        const options: ServiceDescriptor<T, K> = optionsOrServiceName instanceof Object ? optionsOrServiceName : {};
        if (typeof optionsOrServiceName === "string")
            options.name = optionsOrServiceName;

        if (!options.type) {
            options.type = target;
        }
        if (!options.params) {
            // if (options.factory) {
            //     @todo: get parameters from factory function
            // } else {
            options.params = (<any> Reflect).getMetadata("design:paramtypes", target);
            // }
        }
        Container.registerService(options);
    };
}
