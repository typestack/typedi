/// <reference path="../node_modules/reflect-metadata/reflect-metadata.d.ts" />
import 'reflect-metadata';
import {Container} from './Container';

export function Require(name: string) {
    return function(target: Function, key: string, index: number) {
        Container.registerRequireParam(target, index, name);
    }
}
