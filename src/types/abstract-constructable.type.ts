/**
 * Generic type for abstract class definitions.
 *
 * Explanation: This describes a newable Function with a prototype Which is
 * what an abstract class is - no constructor, just the prototype.
 */
export type AbstractConstructable<T> = NewableFunction & { prototype: T };
