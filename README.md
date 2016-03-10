# TypeDI

Dependency injection tool for Typescript.

## Installation


1. Install module:

    `npm install typedi --save`

2. Use [typings](https://github.com/typings/typings) to install all required definition dependencies.

    `typings install`

3. ES6 features are used, so you may want to install [es6-shim](https://github.com/paulmillr/es6-shim) too:

    `npm install es6-shim --save`

    if you are building nodejs app, you may want to `require("es6-shim");` in your app.
    or if you are building web app, you man want to add `<script src="path-to-shim/es6-shim.js">` on your page.

## Usage

If you simply want to use a container:

```typescript
import {Container} from "typedi/Container";

class SomeClass {

    someMethod() {
    }

}

let someClass = Container.get<SomeClass>(SomeClass);
someClass.someMethod();
```

If you want to inject other classes into your service you can do:

```typescript
import {Container} from "typedi/Container";
import {Inject} from "typedi/Decorators";

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

let coffeeMaker = Container.get<CoffeeMaker>(CoffeeMaker);
coffeeMaker.make();
```

If you want to use constructor injection:

```typescript
import {Container} from "typedi/Container";
import {Service} from "typedi/Decorators";

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

@Service()
class CoffeeMaker {

    private beanFactory: BeanFactory;
    private sugarFactory: SugarFactory;
    private waterFactory: WaterFactory;

    constructor(beanFactory: BeanFactory, sugarFactory: SugarFactory, waterFactory: WaterFactory) {
        this.beanFactory = beanFactory;
        this.sugarFactory = sugarFactory;
        this.waterFactory = waterFactory;
    }

    make() {
        this.beanFactory.create();
        this.sugarFactory.create();
        this.waterFactory.create();
    }

}

let coffeeMaker = Container.get<CoffeeMaker>(CoffeeMaker);
coffeeMaker.make();
```

> note: Your classes may not to have `@Service` decorator to use it with Container, however its recommended to add
`@Service` decorator to all classes you are using with container, especially if you class injects other
services

### Extra feature: Injecting third-party dependencies *(experemental)*

Also you can inject a modules that you want to `require`:

```typescript
import {Container} from "typedi/Container";
import {Service, Require} from "typedi/Decorators";

@Service()
class CoffeeMaker {

    private gulp: any; // you can use type if you have definition for this package

    constructor(@Require("gulp") gulp: any) {
        this.gulp = gulp; // the same if you do this.gulp = require("gulp")
    }

    make() {
        console.log(this.gulp); // here you get console.logged gulp package =)
    }
}

let coffeeMaker = Container.get<CoffeeMaker>(CoffeeMaker);
coffeeMaker.make();
```

### Named services

You can use a named services. In this case you can use interface-based services.

```typescript
import {Container} from "typedi/Container";
import {Service, Inject} from "typedi/Decorators";

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

### Providing values to the container

If you are writing unit tests for you class, you may want to provide fakes to your classes. You can use `set` or
`provide` methods of the container:

```typescript
Container.set(CoffeeMaker, new FakeCoffeeMaker());

// or alternatively:

Container.provide([
    { name: "bean.factory", type: BeanFactory, value: new FakeBeanFactory() },
    { name: "sugar.factory", type: SugarFactory, value: new FakeSugarFactory() },
    { name: "water.factory", type: WaterFactory, value: new FakeWaterFactory() }
]);
```

## Samples

Take a look on samples in [./sample](https://github.com/PLEEROCK/typedi/tree/master/sample) for more examples of
usages.
