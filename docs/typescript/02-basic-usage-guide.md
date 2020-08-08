# Basic Usage

> **IMPORTANT NOTE:**  
> Don't forget to **annotate your classes with the `@Service` decorator**! Both the ones being injected and those which
> requests the dependencies should be annotated.

## Registering dependencies

There are three ways to register your dependencies:

- annotating a class with the `@Service()` decorator ([documentation](./04-service-decorator.md))
- registering a value with a `Token`
- registering a value with a string identifier

The `Token` and string identifier can be used to register other values than classes. Both tokens and string indentifiers
can register any type of value including primitive values except `undefined`. They must be set on the container with the
`Container.set()` function before they can be requested via `Container.get()`.

```ts
import 'reflect-metadata';
import { Container, Inject, Service, Token } from 'typedi';

const myToken = new Token('SECRET_VALUE_KEY');

Container.set(myToken, 'my-secret-value');
Container.set('my-config-key', 'value-for-config-key');
Container.set('default-pagination', 30);

// somewhere else in your application
const tokenValue = Container.get(myToken);
const configValue = Container.get('my-config-key');
const defaultPagination = Container.get('default-pagination');
```

_For detailed documentation about `@Service` decorator please read the [@Service decorator](./04-service-decorator.md) page._

## Injecting dependencies

There are three ways to inject your dependencies:

- automatic class constructor parameter injection
- annotating class properties with the `@Inject()` decorator
- directly using `Container.get()` to request an instance of a class, `Token` or string identifier

### Constructor argument injection

Any class which has been marked with the `@Service()` decorator will have it's constructor properties automatically
injected with the correct dependency.

**TypeDI inserts the container instance** which was used to resolve the dependencies **as the last parameter in the constructor**.

```ts
import 'reflect-metadata';
import { Container, Inject, Service } from 'typedi';

@Service()
class InjectedClass {}

@Service()
class ExampleClass {
  constructor(public injectedClass: InjectedClass) {}
}

const instance = Container.get(ExampleClass);

console.log(instance.injectedClass instanceof InjectedClass);
// prints true as TypeDI assigned the instance of InjectedClass to the property
```

### Property injection

Any property which has been marked with the `@Inject` decorator will be automatically assigned the instance of the class
when the parent class is initialized by TypeDI.

```ts
import 'reflect-metadata';
import { Container, Inject, Service } from 'typedi';

@Service()
class InjectedClass {}

@Service()
class ExampleClass {
  @Inject()
  injectedClass: InjectedClass;
}

const instance = Container.get(ExampleClass);

console.log(instance.injectedClass instanceof InjectedClass);
// prints true as the instance of InjectedClass has been assigned to the `injectedClass` property by TypeDI
```

_For detailed documentation about `@Inject` decorator please read the [@Inject decorator](./05-inject-decorator.md) page._

### Using `Container.get()`

The `Container.get()` function can be used directly to request an instance of the target type. TypeDI will resolve and
initialize all dependency on the target class. `Container.get()` can be used to request:

- a constructable value (class definition) which will return the class instance
- a `Token` which will return the value registered for that `Token`
- a string which will return the value registered with that name

```ts
import 'reflect-metadata';
import { Container, Inject, Service, Token } from 'typedi';

const myToken = new Token('SECRET_VALUE_KEY');

@Service()
class InjectedClass {}

@Service()
class ExampleClass {
  @Inject()
  injectedClass: InjectedClass;
}

/** Tokens must be explicity set in the Container with the desired value. */
Container.set(myToken, 'my-secret-value');
/** String identifier must be explicity set in the Container with the desired value. */
Container.set('my-dependency-name-A', InjectedClass);
Container.set('my-dependency-name-B', 'primitive-value');

const injectedClassInstance = Container.get(ExampleClass);
// a class without dependencies can be required
const exampleClassInstance = Container.get(ExampleClass);
// a class with dependencies can be required and dependencies will be resolved
const tokenValue = Container.get(myToken);
// tokenValue will be 'my-secret-value'
const stringIdentifierValueA = Container.get('my-dependency-name-A');
// stringIdentifierValueA will be instance of InjectedClass
const stringIdentifierValueB = Container.get('my-dependency-name-B');
// stringIdentifierValueB will be 'primitive-value'
```

_For detailed documentation about `Token` class please read the [Service Tokens](./06-service-tokens.md) page._

## Singleton vs transient classes

Every registered service by default is a singleton. Meaning repeated calls to `Container.get(MyClass)` will return the
same instance. If this is not the desired behaviour a class can be marked as `transient` via the `@Service()` decorator.

```ts
import 'reflect-metadata';
import { Container, Inject, Service } from 'typedi';

@Service({ transient: true })
class ExampleTransientClass {
  constructor() {
    console.log('I am being created!');
    // this line will be printed twice
  }
}

const instanceA = Container.get(ExampleTransientClass);
const instanceB = Container.get(ExampleTransientClass);

console.log(instanceA !== instanceB);
// prints true
```
