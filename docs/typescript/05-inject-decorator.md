# The `@Inject` decorator

The `@Inject()` decorator is a **property and parameter decorator** used to resolve dependencies on a property of a class or a constructor parameter.
By default it infers the type of the property or argument and initializes an instance of the detected type, however, this behavior can be overwritten via
specifying a custom constructable type, `Token`, or named service as the first parameter.

## Property injection

This decorator is mandatory on properties where a class instance is desired (aka: without the decorator, the property will stay undefined). The type of the
property is automatically inferred so there is no need to define the desired value as the decorator parameter.

```ts
import 'reflect-metadata';
import { Container, Inject, Service } from 'typedi';

@Service()
class InjectedExampleClass {
  print() {
    console.log('I am alive!');
  }
}

@Service()
class ExampleClass {
  @Inject()
  withDecorator: InjectedExampleClass;

  withoutDecorator: InjectedExampleClass;
}

const instance = Container.get(ExampleClass);

/**
 * The `instance` variable is an ExampleClass instance with the `withDecorator`
 * property containing an InjectedExampleClass instance and `withoutDecorator`
 * property being undefined.
 */
console.log(instance);

instance.withDecorator.print();
// prints "I am alive!" (InjectedExampleClass.print function)
console.log(instance.withoutDecorator);
// logs undefined, as this property was not marked with an @Inject decorator
```

## Constructor Injection

The `@Inject` decorator is not required in constructor injection when a class is marked with the `@Service` decorator. TypeDI will automatically infer and
inject the correct class instances for every constructor argument. However, it can be used to overwrite the injected type.

```ts
import 'reflect-metadata';
import { Container, Inject, Service } from 'typedi';

@Service()
class InjectedExampleClass {
  print() {
    console.log('I am alive!');
  }
}

@Service()
class ExampleClass {
  constructor(
    @Inject()
    public withDecorator: InjectedExampleClass,
    public withoutDecorator: InjectedExampleClass
  ) {}
}

const instance = Container.get(ExampleClass);

/**
 * The `instance` variable is an ExampleClass instance with both the
 * `withDecorator` and `withoutDecorator` property containing an
 * InjectedExampleClass instance.
 */
console.log(instance);

instance.withDecorator.print();
// prints "I am alive!" (InjectedExampleClass.print function)
instance.withoutDecorator.print();
// prints "I am alive!" (InjectedExampleClass.print function)
```

## Explicitly requesting target type

By default, TypeDI will try to infer the type of property and arguments and inject the proper class instance. When this is possible
(eg: the property type is an interface) there is three-way to overwrite type of the injected value:

- via `@Inject(() => type)` where `type` is a constructable value (eg: a class definition)
- via `@Inject(myToken)` where `myToken` is an instance of `Token` class
- via `@Inject(serviceName)` where `serviceName` is a string which is already registered via `Container.set(serviceName, value)`

```ts
import 'reflect-metadata';
import { Container, Inject, Service } from 'typedi';

@Service()
class InjectedExampleClass {
  print() {
    console.log('I am alive!');
  }
}

@Service()
class BetterInjectedClass {
  print() {
    console.log('I am a different class!');
  }
}

@Service()
class ExampleClass {
  @Inject()
  inferredPropertyInjection: InjectedExampleClass;

  /**
   * We tell TypeDI that initialize the `BetterInjectedClass` class
   * regardless of what is the inferred type.
   */
  @Inject(() => BetterInjectedClass)
  explicitPropertyInjection: InjectedExampleClass;

  constructor(
    public inferredArgumentInjection: InjectedExampleClass,
    /**
     * We tell TypeDI that initialize the `BetterInjectedClass` class
     * regardless of what is the inferred type.
     */
    @Inject(() => BetterInjectedClass)
    public explicitArgumentInjection: InjectedExampleClass
  ) {}
}

/**
 * The `instance` variable is an ExampleClass instance with both the
 *  - `inferredPropertyInjection` and `inferredArgumentInjection` property
 *    containing an `InjectedExampleClass` instance
 *  - `explicitPropertyInjection` and `explicitArgumentInjection` property
 *    containing a `BetterInjectedClass` instance.
 */
const instance = Container.get(ExampleClass);

instance.inferredPropertyInjection.print();
// prints "I am alive!" (InjectedExampleClass.print function)
instance.explicitPropertyInjection.print();
// prints "I am a different class!" (BetterInjectedClass.print function)
instance.inferredArgumentInjection.print();
// prints "I am alive!" (InjectedExampleClass.print function)
instance.explicitArgumentInjection.print();
// prints "I am a different class!" (BetterInjectedClass.print function)
```
