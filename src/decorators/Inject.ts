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
    return function(target: any, propertyName: string, index?: number) {

        if (!typeOrName)
            typeOrName = () => (Reflect as any).getMetadata("design:type", target, propertyName);

        Container.registerHandler({
            target: target,
            propertyName: propertyName,
            index: index,
            getValue: () => Container.get(typeof typeOrName === "string" ? typeOrName : typeOrName() as any)
        });
    };
}
