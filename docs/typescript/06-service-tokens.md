# Service Tokens

Service tokens are unique identifiers what provides type-safe access to a value stored in a `Container`.

```ts
import 'reflect-metadata';
import { Container, Token } from 'typedi';

export const JWT_SECRET_TOKEN = new Token<string>('MY_SECRET');

Container.set(JWT_SECRET_TOKEN, 'wow-such-secure-much-encryption');

/**
 * Somewhere else in the application after the JWT_SECRET_TOKEN is
 * imported in can be used to request the secret from the Container.
 *
 * This value is type-safe also because the Token is typed.
 */
const JWT_SECRET = Container.get(JWT_SECRET_TOKEN);
```

## Injecting service tokens

They can be used with the `@Inject()` decorator to overwrite the inferred type of the property or argument.

```ts
import 'reflect-metadata';
import { Container, Token, Inject, Service } from 'typedi';

export const JWT_SECRET_TOKEN = new Token<string>('MY_SECRET');

Container.set(JWT_SECRET_TOKEN, 'wow-such-secure-much-encryption');

@Service()
class Example {
  @Inject(JWT_SECRET_TOKEN)
  myProp: string;
}

const instance = Container.get(Example);
// The instance.myProp property has the value assigned for the Token
```

## Tokens with same name

Two token **with the same name are different tokens**. The name is only used to help the developer identify the tokens
during debugging and development. (It's included in error the messages.)

```ts
import 'reflect-metadata';
import { Container, Token } from 'typedi';

const tokenA = new Token('TOKEN');
const tokenB = new Token('TOKEN');

Container.set(tokenA, 'value-A');
Container.set(tokenB, 'value-B');

const tokenValueA = Container.get(tokenA);
// tokenValueA is "value-A"
const tokenValueB = Container.get(tokenB);
// tokenValueB is "value-B"

console.log(tokenValueA === tokenValueB);
// returns false, as Tokens are always unique
```

### Difference between Token and string identifier

They both achieve the same goal, however, it's recommended to use `Tokens` as they are type-safe and cannot be mistyped,
while a mistyped string identifier will silently return `undefined` as value by default.
