/// <reference path="../node_modules/reflect-metadata/reflect-metadata.d.ts" />
import 'reflect-metadata';
import {Container} from './Container';

export function Resolve() {
    return function(target: Function) {
        var params = Reflect.getMetadata('design:paramtypes', target);
        Container.get(target, params);
    }
}
