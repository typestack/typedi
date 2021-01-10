# Inheritance

Inheritance is supported **for properties** when both the base and the extended class is marked with the `@Service()` decorator.
Classes which extend a class with decorated properties will receive the initialized class instances on those properties upon creation.

```ts
import 'reflect-metadata';
import { Container, Token, Inject, Service } from 'typedi';

@Service()
class InjectedClass {
  name: string = 'InjectedClass';
}

@Service()
class BaseClass {
  name: string = 'BaseClass';

  @Inject()
  injectedClass: InjectedClass;
}

@Service()
class ExtendedClass extends BaseClass {
  name: string = 'ExtendedClass';
}

const instance = Container.get(ExtendedClass);
// instance has the `name` property with "ExtendedClass" value (overwritten the base class)
// and the `injectedClass` property with the instance of the `InjectedClass` class

console.log(instance.injectedClass.name);
// logs "InjectedClass"
console.log(instance.name);
// logs "ExtendedClass"
```
