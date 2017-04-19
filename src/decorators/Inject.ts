import {Container} from "../Container";

/**
 * Injects a service into a class property or constructor parameter.
 */
export function Inject(type?: (type?: any) => Function): Function;

/**
 * Injects a service into a class property or constructor parameter.
 */
export function Inject(serviceName?: string): Function;

/**
 * Injects a service into a class property or constructor parameter.
 */
export function Inject(typeOrName?: ((type?: any) => Function)|string): Function {
    return function(target: Object, propertyName: string, index?: number) {

        if (!typeOrName)
            typeOrName = () => (Reflect as any).getMetadata("design:type", target, propertyName);

        Container.registerHandler({
            object: target,
            propertyName: propertyName,
            index: index,
            value: () => Container.get<any>(typeof typeOrName === "string" ? typeOrName : typeOrName() as any)
        });
    };
}
