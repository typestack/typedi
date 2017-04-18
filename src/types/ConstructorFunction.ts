/**
 * Special type that allows to use Function and to known its type as T.
 */
export type ConstructorFunction<T> = { new (...args: any[]): T };
