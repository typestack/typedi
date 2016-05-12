import {Container} from "./Container";

/**
 * Marks class as a service that can be injected using container.
 *
 * @param name Optional service name can be specified. If service name is specified then this service can only be
 *              retrieved by a service name. If no service name is specified then service can be retrieved by its type
 */
export function Service(name?: string) {
    return function(target: Function) {
        const params = (<any> Reflect).getMetadata("design:paramtypes", target);
        Container.registerService(name, target, params);
    };
}

/**
 * Injects a service into class property or into constructor parameter.
 */
export function Inject(type?: Function): Function;
export function Inject(serviceName?: string): Function;
export function Inject(typeOrName?: Function|string): Function {
    return function(target: any, key: string, index?: number) {

        if (!typeOrName)
            typeOrName = (<any> Reflect).getMetadata("design:type", target, key);

        if (index !== undefined) {
            Container.registerParamHandler({
                type: target,
                index: index,
                getValue: () => Container.get(<any> typeOrName)
            });
        } else {
            Container.registerPropertyHandler({
                target: target,
                key: key,
                getValue: () => Container.get(<any> typeOrName)
            });
        }
    };
}

/**
 * Makes a "require" npm package with the given name and injects its value.
 * NOTE: experimental.
 *
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
