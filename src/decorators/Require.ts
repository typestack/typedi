import {Container} from "../Container";

/**
 * Makes a "require" npm package with the given name and injects its value.
 *
 * @experimental
 * @param name The name of the package to require
 */
export function Require(name: string) {
    return function(target: any, propertyName: string, index?: number) {
        Container.registerHandler({
            target: target,
            propertyName: propertyName,
            index: index,
            getValue: () => require(name)
        });
    };
}
