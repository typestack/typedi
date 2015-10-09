import 'reflect-metadata';
import {Container} from './Container';

export function Require(name: string) {
    return function(target: Function, key: string, index: number) {

        Container.registerCustomParamHandler({
            type: target,
            index: index,
            getValue: function() {
                return require(name);
            }
        });
    }
}
