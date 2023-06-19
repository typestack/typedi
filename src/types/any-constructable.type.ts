import { AbstractConstructable } from "./abstract-constructable.type";
import { Constructable } from "./constructable.type";

/**
 * A type matching any form of constructable.
 */
export type AnyConstructable<T = unknown> =
    | Constructable<T>
    | AbstractConstructable<T>;
