/**
 * Special type allows to use Function and get known its type as T.
 */
export type ObjectType<T> = { new (...args: any[]): T };

export type AbstractObjectType<T> = { prototype: T };