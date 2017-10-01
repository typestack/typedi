import {Container} from "../Container";
import {Token} from "../Token";

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
export function Inject(token: Token<any>): Function;

/**
 * Injects a service into a class property or constructor parameter.
 */
export function Inject(typeOrName?: ((type?: any) => Function)|string|Token<any>): Function {
    return function(target: Object, propertyName: string, index?: number) {

        if (!typeOrName)
            typeOrName = () => (Reflect as any).getMetadata("design:type", target, propertyName);

        Container.registerHandler({
            object: target,
            propertyName: propertyName,
            index: index,
            value: () => {
                let identifier: any;
                if (typeof typeOrName === "string") {
                    identifier = typeOrName;

                } else if (typeOrName instanceof Token) {
                    identifier = typeOrName;

                } else {
                    identifier = typeOrName();
                }
                return Container.get<any>(identifier);
            }
        });
    };
}

/**
 * Injects a service into a class property or constructor parameter.
 */
export function InjectTagged(tokenOrName?: string|Token<any>): Function {
    return function(target: Object, propertyName: string, index?: number) {

        if (!tokenOrName)
            throw new Error("@InjectTagged must be called with a tag as argument");

        Container.registerHandler({
            object: target,
            propertyName: propertyName,
            index: index,
            value: () => {
                return Container.getAllByTag<any>(tokenOrName) || [];
            }
        });
    };
}
