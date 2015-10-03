import 'reflect-metadata';
import {Container} from './Container';

export function Resolve() {
    return function(target: Function) {
        var params = Reflect.getMetadata('design:paramtypes', target);
        Container.get(target, params);
    }
}
