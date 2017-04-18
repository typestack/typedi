import {Container} from "../Container";

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
