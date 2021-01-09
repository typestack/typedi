import { Container } from '../container.class';
import { ContainerInstance } from '../container-instance.class';
import { Token } from '../token.class';
import { ServiceMetadata } from '../interfaces/service-metadata.interface.';
import { ServiceOptions } from '../interfaces/service-options.interface';
import { EMPTY_VALUE } from '../empty.const';
import { Constructable } from '../types/constructable.type';

export type ObjectType<T1> = { new (...args: any[]): T1 } | { service: T1 } | Token<T1>;

export function Service<R>(factory: () => R): { service: R };
export function Service<R, T1>(dependencies: [ObjectType<T1>], factory: (dependency1: T1) => R): { service: R };
export function Service<R, T1, T2>(
  dependencies: [ObjectType<T1>, ObjectType<T2>],
  factory: (dependency1: T1, dependency2: T2) => R
): { service: R };
export function Service<R, T1, T2, T3>(
  dependencies: [ObjectType<T1>, ObjectType<T2>, ObjectType<T3>],
  factory: (dependency1: T1, dependency2: T2, dependency3: T3) => R
): { service: R };
export function Service<R, T1, T2, T3, T4>(
  dependencies: [ObjectType<T1>, ObjectType<T2>, ObjectType<T3>, ObjectType<T4>],
  factory: (dependency1: T1, dependency2: T2, dependency3: T3, dependency4: T4) => R
): { service: R };
export function Service<R, T1, T2, T3, T4, T5>(
  dependencies: [ObjectType<T1>, ObjectType<T2>, ObjectType<T3>, ObjectType<T4>, ObjectType<T5>],
  factory: (dependency1: T1, dependency2: T2, dependency3: T3, dependency4: T4, dependency5: T5) => R
): { service: R };
export function Service<R, T1, T2, T3, T4, T5, T6>(
  dependencies: [ObjectType<T1>, ObjectType<T2>, ObjectType<T3>, ObjectType<T4>, ObjectType<T5>, ObjectType<T6>],
  factory: (dependency1: T1, dependency2: T2, dependency3: T3, dependency4: T4, dependency5: T5, dependency6: T6) => R
): { service: R };
export function Service<R, T1, T2, T3, T4, T5, T6, T7>(
  dependencies: [
    ObjectType<T1>,
    ObjectType<T2>,
    ObjectType<T3>,
    ObjectType<T4>,
    ObjectType<T5>,
    ObjectType<T6>,
    ObjectType<T7>
  ],
  factory: (
    dependency1: T1,
    dependency2: T2,
    dependency3: T3,
    dependency4: T4,
    dependency5: T5,
    dependency6: T6,
    dependency7: T7
  ) => R
): { service: R };
export function Service<R, T1, T2, T3, T4, T5, T6, T7, T8>(
  dependencies: [
    ObjectType<T1>,
    ObjectType<T2>,
    ObjectType<T3>,
    ObjectType<T4>,
    ObjectType<T5>,
    ObjectType<T6>,
    ObjectType<T7>,
    ObjectType<T8>
  ],
  factory: (
    dependency1: T1,
    dependency2: T2,
    dependency3: T3,
    dependency4: T4,
    dependency5: T5,
    dependency6: T6,
    dependency7: T7,
    dependency8: T8
  ) => R
): { service: R };
export function Service<R, T1, T2, T3, T4, T5, T6, T7, T8, T9>(
  dependencies: [
    ObjectType<T1>,
    ObjectType<T2>,
    ObjectType<T3>,
    ObjectType<T4>,
    ObjectType<T5>,
    ObjectType<T6>,
    ObjectType<T7>,
    ObjectType<T8>,
    ObjectType<T9>
  ],
  factory: (
    dependency1: T1,
    dependency2: T2,
    dependency3: T3,
    dependency4: T4,
    dependency5: T5,
    dependency6: T6,
    dependency7: T7,
    dependency8: T8,
    dependency9: T9
  ) => R
): { service: R };
export function Service<R, T1, T2, T3, T4, T5, T6, T7, T8, T9, T10>(
  dependencies: [
    ObjectType<T1>,
    ObjectType<T2>,
    ObjectType<T3>,
    ObjectType<T4>,
    ObjectType<T5>,
    ObjectType<T6>,
    ObjectType<T7>,
    ObjectType<T8>,
    ObjectType<T9>,
    ObjectType<T10>
  ],
  factory: (
    dependency1: T1,
    dependency2: T2,
    dependency3: T3,
    dependency4: T4,
    dependency5: T5,
    dependency6: T6,
    dependency7: T7,
    dependency8: T8,
    dependency9: T9,
    dependency10: T10
  ) => R
): { service: R };

/**
 * Marks class as a service that can be injected using Container.
 */
export function Service(): Function;

/**
 * Marks class as a service that can be injected using Container.
 */
export function Service(name: string): Function;

/**
 * Marks class as a service that can be injected using Container.
 */
export function Service(token: Token<any>): Function;

/**
 * Marks class as a service that can be injected using Container.
 */
export function Service<T, K extends keyof T>(options?: ServiceOptions<T>): Function;

/**
 * Marks class as a service that can be injected using container.
 */
export function Service<T, K extends keyof T>(
  optionsOrServiceName?: ServiceOptions<T> | Token<any> | string | any[] | (() => any),
  maybeFactory?: (...args: any[]) => any
): any {
  if (arguments.length === 2 || typeof optionsOrServiceName === 'function') {
    const serviceId = new Token<T>();
    const dependencies = arguments.length === 2 ? (optionsOrServiceName as any[]) : [];
    const factory = arguments.length === 2 ? maybeFactory : (optionsOrServiceName as Function);

    if (factory === undefined) {
      // TODO: This should never happen, but regardless, lets re-think this bit.
      throw Error('Ohh no.');
    }

    Container.set({
      id: serviceId,
      factory: [
        class DefaultFactory {
          create(container: ContainerInstance) {
            const params = dependencies.map(dependency => container.get(dependency));
            return factory(...params);
          }
        },
        'create',
      ],
      global: false,
      multiple: false,
      transient: false,
      value: EMPTY_VALUE,
    });

    return serviceId;
  } else {
    return function (target: Constructable<T>) {
      const service: ServiceMetadata<T> = {
        id: target,
        type: target,
        factory: undefined,
        multiple: false,
        global: false,
        transient: false,
        value: EMPTY_VALUE,
      };

      if (typeof optionsOrServiceName === 'string' || optionsOrServiceName instanceof Token) {
        service.id = optionsOrServiceName;
      } else if (optionsOrServiceName) {
        // ServiceOptions
        service.id = (optionsOrServiceName as ServiceOptions<T>).id || target;
        service.factory = (optionsOrServiceName as ServiceOptions<T>).factory || undefined;
        service.multiple = (optionsOrServiceName as ServiceOptions<T>).multiple || false;
        service.global = (optionsOrServiceName as ServiceOptions<T>).global || false;
        service.transient = (optionsOrServiceName as ServiceOptions<T>).transient || false;
      }

      Container.set(service);
    };
  }
}
