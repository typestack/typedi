import {Container} from "../Container";

/**
 * Makes a "require" npm package with the given name and injects its value.
 *
 * @param name The name of the package to require
 * @experimental
 */
export function Require(name: string) {
    return function(target: Object, propertyName: string, index?: number) {
        Container.registerHandler({
            object: target,
            propertyName: propertyName,
            index: index,
            value: () => require(name)
        });
    };
}
