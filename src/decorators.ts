
import {Container} from "./Container";
import {ServiceDescriptor} from "./ServiceDescriptor";


/**
 * Marks class as a service that can be injected using container.
 *
 * @param descriptor
 */
export function Service(descriptor: ServiceDescriptor = {}) {
    return function(target: Function) {
        if (!descriptor.type) {
            descriptor.type = target;
        }
        if (!descriptor.params) {
            if (descriptor.factory) {
                // @todo: get parameters from factory function
            } else {
                descriptor.params = (<any> Reflect).getMetadata("design:paramtypes", target);
            }
        }
        Container.registerService(descriptor);
    };
}

export function Factory() {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
      // @todo: maybe we still need it...
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
