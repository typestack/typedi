# Getting started without TypeScript

It's possible to use TypeDI without TypesScript, however some of the functionality is limited or not available.
These differences are listed below in the [Limitations][limitations-sections] section.

## Installation

To start using TypeDI with JavaScript install the required packages via NPM:

```bash
npm install typedi reflect-metadata
```

## Basic usage

The most basic usage is to request an instance of a class definition. TypeDI will check if an instance of the class has
been created before and return the cached version or it will create a new instance, cache and return it.

```js
import 'reflect-metadata';
import { Container } from 'typedi';

class ExampleClass {
  print() {
    console.log('I am alive!');
  }
}

/** Register this class to the TypeDI container */
Container.set({ id: ExampleClass, type: ExampleClass });

/** Request an instance of ExampleClass from TypeDI. */
const classInstance = Container.get(ExampleClass);

/** We received an instance of ExampleClass and ready to work with it. */
classInstance.print();
```

For more advanced usage examples and patterns please read the [next page][basic-usage-page].

## Limitations

When registering your dependencies with the `Container.set()` method, there are three options available that must be set. Either one of the following are allowed: `type`, `factory`, or `value` but not more than one.

- `Container.set({ id: ExampleClass, type: ExampleClass});`
- `Container.set({ id: ExampleClass, value: new ExampleClass});`
- `Container.set({ id: ExampleClass, factory: ExampleClass});`

To get started quickly, it is recommend to use `type` due to the fact that using `value` will instantiate the class before it's registered to the TypeDI Container. Using `type` will also assure that the TypeDI Container is injected to the constructor.

[limitations-sections]: #limitations
[basic-usage-page]: ./02-basic-usage.md
