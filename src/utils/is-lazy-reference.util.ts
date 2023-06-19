import { LAZY_REFERENCE } from "../type-stamps.const";
import { LazyReference } from "../types/lazy-reference.type";

export function isLazyReference (x: object): x is LazyReference<any> {
    return (x as any)[LAZY_REFERENCE] === true;
}
