import { Token } from '../token.class';

export type TokenInfer<T> = T extends Token<infer U> ? U : never;
