# Getting started without TypeScript

It's possible to use TypeDI without TypesScript, however some of the functionality is limited or not available.
These differences are listed below in the [Limitations][limitations-sections] section.

## Installation

To start using TypeDI with JavaScript install it via NPM:

```bash
npm install typedi
```

## Basic usage

The most basic usage is to request an instance of a class definition. TypeDI will check if an instance of the class has
been created before and return the cached version or it will create a new instance, cache and return it.

```js
import { Container } from 'typedi';

class ExampleClass {
  print() {
    console.log('I am alive!');
  }
}

/** Request an instance of ExampleClass from TypeDI. */
const classInstance = Container.get(ExampleClass);

/** We received an instance of ExampleClass and ready to work with it. */
classInstance.print();
```

For more advanced usage examples and patterns please read the [next page][basic-usage-page].

## Limitations

_To be written..._

[limitations-sections]: #limitations
[basic-usage-page]: ./02-basic-usage.md
