import {Container, ServiceOptions } from "..";


/**
 * A decorator to tell the container that this class should instantiated.
 */
export function Injectable<T, K extends keyof T>(provider: Function, options?: ServiceOptions<T, K>) {
  return (target: Function) => {
    Container.set({
      id: provider,
      type: target,
      global: true,
      transient: false,
      ...options,
    });
  };
}