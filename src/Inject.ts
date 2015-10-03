import 'reflect-metadata';
import {Container} from "./Container";

export function Inject(type?: Function) {
    return function(target: any, key: string) {
        if (!type) {
            type = Reflect.getMetadata('design:type', target, key);
        }
        Object.defineProperty(target, key, {
            enumerable: true,
            writable: true,
            configurable: true,
            value: Container.get(type)
        });
    }
}