# TypeDI

[![Build Status](https://travis-ci.org/typestack/typedi.svg?branch=master)](https://travis-ci.org/typestack/typedi)
[![npm version](https://badge.fury.io/js/typedi.svg)](https://badge.fury.io/js/typedi)
[![Dependency Status](https://david-dm.org/typestack/typedi.svg)](https://david-dm.org/typestack/typedi)
[![Join the chat at https://gitter.im/typestack/typedi](https://badges.gitter.im/typestack/typedi.svg)](https://gitter.im/typestack/typedi?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

TypeDI is a [dependency injection](https://en.wikipedia.org/wiki/Dependency_injection) tool for JavaScript and TypeScript.
Using TypeDI you can build well-structured and easily tested applications.

* [Usage with JavaScript](#usage-with-javascript)
* [Usage with TypeScript](#usage-with-typescript)

## Usage with JavaScript

Install the module:

`npm install typedi --save`

Now you can use TypeDI.
The most simple usage example is:

```javascript
class SomeClass {

    someMethod() {
    }

}

var Container = require("typedi").Container;
var someClass = Container.get(SomeClass);
someClass.someMethod();
```

Then you can call `Container.get(SomeClass)` from anywhere in your application
 and you'll always have the same instance of `SomeClass`.

In your class's constructor you always recieve as a last argument a container which you can use to get other dependencies.

```javascript
class BeanFactory {
    create() {
    }
}

class SugarFactory {
    create() {
    }
}

class WaterFactory {
    create() {
    }
}

class CoffeeMaker {

    constructor(container) {
        this.beanFactory = container.get(BeanFactory);
        this.beanFactory = container.get(SugarFactory);
        this.beanFactory = container.get(WaterFactory);
    }

    make() {
        this.beanFactory.create();
        this.sugarFactory.create();
        this.waterFactory.create();
    }

}

var Container = require("typedi").Container;
var coffeeMaker = Container.get(CoffeeMaker);
coffeeMaker.make();
```

With TypeDI you can use a named services. Example:

```typescript
var Container = require("typedi").Container;

class BeanFactory implements Factory {
    create() {
    }
}

class SugarFactory implements Factory {
    create() {
    }
}

class WaterFactory implements Factory {
    create() {
    }
}

class CoffeeMaker {

    beanFactory: Factory;
    sugarFactory: Factory;
    waterFactory: Factory;

    constructor(container) {
        this.beanFactory = container.get("bean.factory");
        this.sugarFactory = container.get("sugar.factory");
        this.waterFactory = container.get("water.factory");
    }

    make() {
        this.beanFactory.create();
        this.sugarFactory.create();
        this.waterFactory.create();
    }

}

Container.set("bean.factory", new BeanFactory(Container));
Container.set("sugar.factory", new SugarFactory(Container));
Container.set("water.factory", new WaterFactory(Container));
Container.set("coffee.maker", new CoffeeMaker(Container));

var coffeeMaker = Container.get("coffee.maker");
coffeeMaker.make();
```

This feature especially useful if you want to store (and inject later on) some settings or configuration options.
For example:

```typescript
var Container = require("typedi").Container;

// somewhere in your global app parameters
Container.set("authorization-token", "RVT9rVjSVN");

class UserRepository {

    constructor(container) {
        this.authorizationToken = container.get("authorization-token");
    }

}
```

When you write tests you can easily provide your own "fake" dependencies to classes you are testing using `set` method:

```typescript
Container.set(CoffeeMaker, new FakeCoffeeMaker());

// or for named services

Container.set([
    { id: "bean.factory", value: new FakeBeanFactory() },
    { id: "sugar.factory", value: new FakeSugarFactory() },
    { id: "water.factory", value: new FakeWaterFactory() }
]);
```

## Usage with TypeScript

1. Install module:

    `npm install typedi --save`

2. Install [reflect-metadata](https://www.npmjs.com/package/reflect-metadata) package:

    `npm install reflect-metadata --save`

    and import it somewhere in the global place of your app before any service declaration or import (for example in `app.ts`):

    `import "reflect-metadata";`

3. You may need to install node typings:

    `npm install @types/node --save`


4. Enabled following settings in `tsconfig.json`:

```json
"emitDecoratorMetadata": true,
"experimentalDecorators": true,
```

Now you can use TypeDI.
The most simple usage example is:

```typescript
import "reflect-metadata";
import {Service, Container} from "typedi";

@Service()
class SomeClass {

    someMethod() {
    }

}

let someClass = Container.get(SomeClass);
someClass.someMethod();
```

Then you can call `Container.get(SomeClass)` from anywhere in your application
 and you'll always have the same instance of `SomeClass`.

You can use **property injection** and inject services into your class using `@Inject` decorator:

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

You can also use a constructor injection:

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

With TypeDI you can use a named services. Example:

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

This feature especially useful if you want to store (and inject later on) some settings or configuration options.
For example:

```typescript
import {Container, Service, Inject} from "typedi";

// somewhere in your global app parameters
Container.set("authorization-token", "RVT9rVjSVN");

@Service()
class UserRepository {

    @Inject("authorization-token")
    authorizationToken: string;

}
```

When you write tests you can easily provide your own "fake" dependencies to classes you are testing using `set` method:
`provide` methods of the container:

```typescript
Container.set(CoffeeMaker, new FakeCoffeeMaker());

// or for named services

Container.set([
    { id: "bean.factory", value: new FakeBeanFactory() },
    { id: "sugar.factory", value: new FakeSugarFactory() },
    { id: "water.factory", value: new FakeWaterFactory() }
]);
```

## TypeScript Advanced Usage Examples

* [Services with token name](#services-with-token-name) 
* [Using factory function to create service](#using-factory-function-to-create-service) 
* [Using factory class to create service](#using-factory-class-to-create-service)
* [Problem with circular references](#problem-with-circular-references) 
* [Inherited injections](#inherited-injections) 
* [Custom decorators](#custom-decorators) 
* [Using service groups](#using-service-groups) 
* [Using multiple containers and scoped containers](#using-multiple-containers-and-scoped-containers) 
* [Remove registered services or reset container state](#remove-registered-services-or-reset-container-state) 

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

let factory = Container.get(FactoryService); // factory is instance of Factory
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

And that's all. Same for constructor injections.

### Inherited injections

Inherited injections are supported as well. In order to use them you must mark inherited class as a @Service.
For example:

```typescript
// Car.ts
@Service()
export abstract class Car {

    @Inject()
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
        Container.registerHandler({ object, propertyName, index, value: containerInstance => logger });
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

### Using service groups

You can group multiple services into single group tagged with service id or token.
For example:

```typescript
// Factory.ts
export interface Factory {
    create(): any;
}

// FactoryToken.ts
export const FactoryToken = new Token<Factory>("factories");

// BeanFactory.ts
@Service({ id: FactoryToken, multiple: true })
export class BeanFactory implements Factory {

    create() {
        console.log("bean created");
    }

}

// SugarFactory.ts
@Service({ id: FactoryToken, multiple: true })
export class SugarFactory implements Factory {

    create() {
        console.log("sugar created");
    }

}

// WaterFactory.ts
@Service({ id: FactoryToken, multiple: true })
export class WaterFactory implements Factory {

    create() {
        console.log("water created");
    }

}

// app.ts
// now you can get all factories in a single array 
const factories = Container.getMany(FactoryToken); // factories is Factory[]
factories.forEach(factory => factory.create());
``` 

### Using multiple containers and scoped containers

By default all services are stored in the global service container,
and this global service container holds all unique instances of each service you have.

If you want your services to behave and store data inside differently,
based on some user context (http request for example) - 
you can use different containers for different contexts. 
For example:

```typescript
// QuestionController.ts
@Service()
export class QuestionController {

    constructor(protected questionRepository: QuestionRepository) {
    }

    save() {
        this.questionRepository.save();
    }
}

// QuestionRepository.ts
@Service()
export class QuestionRepository {

    save() {
    }

}

// app.ts
const request1 = { param: "question1" };
const controller1 = Container.of(request1).get(QuestionController);
controller1.save("Timber");
Container.reset(request1);

const request2 = { param: "question2" };
const controller2 = Container.of(request2).get(QuestionController);
controller2.save("");
Container.reset(request2);
```

In this example `controller1` and `controller2` are completely different instances,
and `QuestionRepository` used in those controllers are different instances as well.

`Container.reset` removes container with the given context identifier.
If you want your services to be completely global and not be container-specific, 
you can mark them as global:

```typescript
@Service({ global: true })
export class QuestionUtils {
  
}
```

And this global service will be the same instance across all containers.

### Remove registered services or reset container state

If you need to remove registered service from container simply use `Container.remove(...)` method.
Also you can completely reset the container by calling `Container.reset()` method.
This will effectively remove all registered services from the container.

## Troubleshooting

### Use TypeDI with routing-controllers and/or TypeORM

In order to use typedi with routing-controllers and/or typeorm, it's **necessary** to tell these libs to use the typedi container.
Otherwise you may face [this kind of issue](https://github.com/pleerock/typedi/issues/4).

```Typescript
import {useContainer as routingUseContainer} from "routing-controllers";
import {useContainer as ormUseContainer} from "typeorm";
import {Container} from "typedi";

routingUseContainer(Container);
ormUseContainer(Container);
```

## Samples

Take a look on samples in [./sample](https://github.com/pleerock/typedi/tree/master/sample) for examples of usage.
