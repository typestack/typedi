# Getting Started

TypeDI is a [dependency injection](https://en.wikipedia.org/wiki/Dependency_injection) library for TypeScript and JavaScript.

## Installation

> Note: This installation guide is for usage with TypeScript, if you wish to use TypeDI without Typescript
> please read the [getting started guide][getting-started-js] for JavaScript.

To start using TypeDI install the required packages via NPM:

```bash
npm install typedi reflect-metadata
```

Import the `reflect-metadata` package at the **first line** of your application:

```ts
import 'reflect-metadata';

// Your other imports and initialization code
// comes here after you imported the reflect-metadata package!
```

As the last step, you need to enable emitting decorator metadata in your Typescript config. Add these two lines to your `tsconfig.json` file under the `compilerOptions` key:

```json
"emitDecoratorMetadata": true,
"experimentalDecorators": true,
```

Now you are ready to use TypeDI with Typescript!

## Basic Usage

The most basic usage is to request an instance of a class definition. TypeDI will check if an instance of the class has
been created before and return the cached version or it will create a new instance, cache, and return it.

```ts
import { Container, Service } from 'typedi';

@Service()
class ExampleInjectedService {
  printMessage() {
    console.log('I am alive!');
  }
}

@Service()
class ExampleService {
  constructor(
    // because we annotated ExampleInjectedService with the @Service()
    // decorator TypeDI will automatically inject an instance of
    // ExampleInjectedService here when the ExampleService class is requested
    // from TypeDI.
    public injectedService: ExampleInjectedService
  ) {}
}

const serviceInstance = Container.get(ExampleService);
// we request an instance of ExampleService from TypeDI

serviceInstance.injectedService.printMessage();
// logs "I am alive!" to the console
```

[getting-started-js]: ../javascript/01-getting-started.md
