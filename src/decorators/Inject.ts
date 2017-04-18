import {Container} from "../Container";

/**
 * Injects a service into class property or into constructor parameter.
 */
export function Inject(type?: (type?: any) => Function): Function;

/**
 * Injects a service into class property or into constructor parameter.
 */
export function Inject(serviceName?: string): Function;

/**
 * Injects a service into class property or into constructor parameter.
 */
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
