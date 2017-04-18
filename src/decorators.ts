import {Container} from "./Container";
import {ServiceDescriptor} from "./ServiceDescriptor";

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

/**
 * Injects a service into class property or into constructor parameter.
 */
export function Inject(type?: (type?: any) => Function): Function;
export function Inject(serviceName?: string): Function;
export function Inject(typeOrName?: ((type?: any) => Function)|string): Function {
    return function(target: any, key: string, index?: number) {

        if (!typeOrName)
            typeOrName = () => (<any> Reflect).getMetadata("design:type", target, key);

        if (index !== undefined) {
            Container.registerParamHandler({
                type: target,
                index: index,
                getValue: () => Container.get(typeof typeOrName === "string" ? typeOrName : typeOrName() as any)
            });
        } else {
            Container.registerPropertyHandler({
                target: target,
                key: key,
                getValue: () => Container.get(typeof typeOrName === "string" ? typeOrName : typeOrName() as any)
            });
        }
    };
}

/**
 * Makes a "require" npm package with the given name and injects its value.
 *
 * @experimental
 * @param name The name of the package to require
 */
export function Require(name: string) {
    return function(target: any, key: string, index?: number) {

        if (index !== undefined) {
            Container.registerParamHandler({
                type: target,
                index: index,
                getValue: () => require(name)
            });
        } else {
            Container.registerPropertyHandler({
                target: target,
                key: key,
                getValue: () => require(name)
            });
        }
    };
}
