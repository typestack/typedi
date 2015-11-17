import 'reflect-metadata';
import {Container} from './Container';

export function Service() {
    return function(target: Function) {
        const params = Reflect.getMetadata('design:paramtypes', target);
        Container.registerDefaultInitializationParameter(target, params);
    }
}
