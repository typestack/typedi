import { Container } from '../Container';
import { Token } from '../Token';
import { CannotInjectError } from '../error/CannotInjectError';

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
export function Inject(typeOrName?: ((type?: any) => Function) | string | Token<any>): Function {
  return function (target: Object, propertyName: string, index?: number) {
    if (!typeOrName) typeOrName = () => (Reflect as any).getMetadata('design:type', target, propertyName);

    Container.registerHandler({
      object: target,
      propertyName: propertyName,
      index: index,
      value: containerInstance => {
        let identifier: any;
        if (typeof typeOrName === 'string') {
          identifier = typeOrName;
        } else if (typeOrName instanceof Token) {
          identifier = typeOrName;
        } else {
          identifier = typeOrName();
        }

        if (identifier === Object) throw new CannotInjectError(target, propertyName);

        return containerInstance.get<any>(identifier);
      },
    });
  };
}
