# TypeDI

[![Build Status](https://travis-ci.org/pleerock/typedi.svg?branch=master)](https://travis-ci.org/pleerock/typedi)
[![npm version](https://badge.fury.io/js/typedi.svg)](https://badge.fury.io/js/typedi)
[![Dependency Status](https://david-dm.org/pleerock/typedi.svg)](https://david-dm.org/pleerock/typedi)
[![Join the chat at https://gitter.im/pleerock/typedi](https://badges.gitter.im/pleerock/typedi.svg)](https://gitter.im/pleerock/typedi?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Simple yet powerful dependency injection tool for TypeScript.

## Installation


1. Install module:

    `npm install typedi --save`

2. You also need to install [reflect-metadata](https://www.npmjs.com/package/reflect-metadata) package.

    `npm install reflect-metadata --save`
    
    and import it somewhere in the global place of your app (for example in `app.ts`):
    
    `import "reflect-metadata";`

3. You may need to install node typings:

    `npm install @types/node --save`
    

4. Also make sure you are using TypeScript compiler version > **2.1** 
and you have enabled following settings in `tsconfig.json`:

```json
"emitDecoratorMetadata": true,
"experimentalDecorators": true,
```

## Usage

If you simply want to use a container:

```typescript
import {Container} from "typedi";

class SomeClass {

    someMethod() {
    }

}

let someClass = Container.get(SomeClass);
someClass.someMethod();
```

If you want to inject other classes into your service you can do:

```typescript
import {Container, Inject, Service} from "typedi";

@Service()
class BeanFactory {
    create() {
    }
}

@Service()
class SugarFactory {
    create() {
    }
}

@Service()
class WaterFactory {
    create() {
    }
}

@Service()
class CoffeeMaker {

    @Inject()
    beanFactory: BeanFactory;
    
    @Inject()
    sugarFactory: SugarFactory;
    
    @Inject()
    waterFactory: WaterFactory;

    make() {
        this.beanFactory.create();
        this.sugarFactory.create();
        this.waterFactory.create();
    }

}

let coffeeMaker = Container.get(CoffeeMaker);
coffeeMaker.make();
```

If you want to use constructor injection:

```typescript
import {Container, Service} from "typedi";

@Service()
class BeanFactory {
    create() {
    }
}

@Service()
class SugarFactory {
    create() {
    }
}

@Service()
class WaterFactory {
    create() {
    }
}

@Service()
class CoffeeMaker {

    constructor(private beanFactory: BeanFactory,
                private sugarFactory: SugarFactory,
                private waterFactory: WaterFactory) {}

    make() {
        this.beanFactory.create();
        this.sugarFactory.create();
        this.waterFactory.create();
    }

}

let coffeeMaker = Container.get(CoffeeMaker);
coffeeMaker.make();
```

> note: Your classes may not to have `@Service` decorator to use it with Container, however its recommended to add
`@Service` decorator to all classes you are using with container, because without `@Service` decorator applied
constructor injection may not work properly in your classes.

### Injecting third-party dependencies *(experimental)*

Also you can inject a modules that you want to `require`:

```typescript
import {Container, Service, Require} from "typedi";

@Service()
class CoffeeMaker {

    private logger: any; // you can use type if you have definition for this package

    constructor(@Require("logger") logger: any) {
        this.logger = logger; // the same if you do this.logger = require("logger")
    }

    make() {
        console.log(this.logger); // here you get console.logged logger package =)
    }
}

let coffeeMaker = Container.get(CoffeeMaker);
coffeeMaker.make();
```

### Named services

You can use a named services. In this case you can use interface-based services.

```typescript
import {Container, Service, Inject} from "typedi";

interface Factory {
    create(): void;
}

@Service("bean.factory")
class BeanFactory implements Factory {
    create() {
    }
}

@Service("sugar.factory")
class SugarFactory implements Factory {
    create() {
    }
}

@Service("water.factory")
class WaterFactory implements Factory {
    create() {
    }
}

@Service("coffee.maker")
class CoffeeMaker {

    beanFactory: Factory;
    sugarFactory: Factory;

    @Inject("water.factory")
    waterFactory: Factory;

    constructor(@Inject("bean.factory") beanFactory: BeanFactory,
                @Inject("sugar.factory") sugarFactory: SugarFactory) {
        this.beanFactory = beanFactory;
        this.sugarFactory = sugarFactory;
    }

    make() {
        this.beanFactory.create();
        this.sugarFactory.create();
        this.waterFactory.create();
    }

}

let coffeeMaker = Container.get<CoffeeMaker>("coffee.maker");
coffeeMaker.make();
```

### Services with token name

You can use a services with a `Token` instead of name or target class. 
In this case you can use type safe interface-based services.

```typescript
import {Container, Service, Inject, Token} from "typedi";

export interface Factory {
    create(): void;
}

export const FactoryService = new Token<Factory>(); 

@Service(FactoryService)
export class BeanFactory implements Factory {
    create() {
    }
}

@Service()
export class CoffeeMaker {
    
    private factory: Factory;

    constructor(@Inject(type => FactoryService) factory: Factory) {
        this.factory = factory;
    }

    make() {
        this.factory.create();
    }

}

let coffeeMaker = Container.get(CoffeeMaker);
coffeeMaker.make();

let factory = Container.get(FactoryService);
factory.create();
```

### Using factory function to create service

You can create your services with the container using factory functions.

This way, service instance will be created by calling your factory function instead of
instantiating a class directly.

```typescript
import {Container, Service} from "typedi";

function createCar() {
    return new Car("V8");
}

@Service({ factory: createCar })
class Car {
    constructor (public engineType: string) {
    }
}

// Getting service from the container.
// Service will be created by calling the specified factory function.
const car = Container.get(Car);

console.log(car.engineType); // > "V8"
```

### Using factory class to create service

You can also create your services using factory classes.

This way, service instance will be created by calling given factory service's method factory instead of
instantiating a class directly.

```typescript
import {Container, Service} from "typedi";

@Service()
class CarFactory {
    
    constructor(public logger: LoggerService) {
    }
    
    create() {
        return new Car("BMW", this.logger);
    }
    
}

@Service({ factory: [CarFactory, "create"] })
class Car {
    constructor(public model: string, public logger: LoggerInterface) {
    }
}
```

### Providing values to the container

If you are writing unit tests for you class, you may want to provide fakes to your classes. You can use `set` or
`provide` methods of the container:

```typescript
Container.set(CoffeeMaker, new FakeCoffeeMaker());

// or

Container.provide([
    { id: "bean.factory", value: new FakeBeanFactory() },
    { id: "sugar.factory", value: new FakeSugarFactory() },
    { id: "water.factory", value: new FakeWaterFactory() }
]);
```

### Problem with circular references

There is a known issue in language that it can't handle circular references. For example:

```typescript
// Car.ts
@Service()
export class Car {
    @Inject()
    engine: Engine;
}

// Engine.ts
@Service()
export class Engine {
    @Inject()
    car: Car;
}
```

This code will not work, because Engine has a reference to Car, and Car has a reference to Engine.
One of them will be undefined and it cause errors. To fix them you need to specify a type in a function this way:

```typescript
// Car.ts
@Service()
export class Car {
    @Inject(type => Engine)
    engine: Engine;
}

// Engine.ts
@Service()
export class Engine {
    @Inject(type => Car)
    car: Car;
}
```

And that's all. Same for injects for constructor injection.

### Inherited injections

Inherited injections are supported as well. In order to use them you must mark inherited class as a @Service.
For example:

```typescript
// Car.ts
@Service()
export abstract class Car {

    @Inject(type => Engine)
    engine: Engine;

}

// Engine.ts
@Service()
export class Bus extends Car {

    // you can call this.engine in this class
}
```

### Custom decorators

You can create your own decorators which will inject your given values for your service dependencies.
For example:

```typescript
// Logger.ts
export function Logger() {
    return function(object: Object, propertyName: string, index?: number) {
        const logger = new ConsoleLogger();
        Container.registerHandler({ object, propertyName, index, value: () => logger });
    };
}

// LoggerInterface.ts
export interface LoggerInterface {

    log(message: string): void;

}

// ConsoleLogger.ts
import {LoggerInterface} from "./LoggerInterface";

export class ConsoleLogger implements LoggerInterface {

    log(message: string) {
        console.log(message);
    }

}

// UserRepository.ts
@Service()
export class UserRepository {

    constructor(@Logger() private logger: LoggerInterface) {
    }

    save(user: User) {
        this.logger.log(`user ${user.firstName} ${user.secondName} has been saved.`);
    }

}
```

### Remove registered services or reset container state

If you need to remove registered service from container simply use `Container.remove(...)` method.
Also you can completely reset the container by calling `Container.reset()` method.
This will effectively remove all registered services from the container. 

## Samples

Take a look on samples in [./sample](https://github.com/pleerock/typedi/tree/master/sample) for more examples of
usages.
