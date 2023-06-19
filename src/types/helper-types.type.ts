/**
 * From TTarget, make only keys in TKeys required, with the rest being optional.
 */
export type PartialPick<TTarget, TKeys extends keyof TTarget> =
    Partial<TTarget> & Pick<TTarget, TKeys>;