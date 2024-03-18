import { Token } from '../token.class';

export type TokenInferMany<T> = T extends Token<infer U> ? U[] : never;
