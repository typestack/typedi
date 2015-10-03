# TypeDI

Dependency injection tool for Typescript.

## Usage

If you simply want to use a container:

```typescript
class SomeClass {

    someMethod() {
    }

}

let someClass = Container.get(SomeClass);
someClass.someMethod();
```

If you want to inject other classes into your service you can do:

```typescript
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

let coffeeMaker = Container.get(CoffeeMaker);
coffeeMaker.make();
```

If you want to use constructor injection:

```typescript

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

@Resolve()
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

let coffeeMaker = Container.get(CoffeeMaker);
coffeeMaker.make();
```

That's should be enough to use a proper dependency injection.
Also you can inject a modules that you want to `require`:

```typescript
class SomeClass {
    someMethod() {
    }
}

@Resolve()
class CoffeeMaker {

    private someClass: SomeClass;
    private gulp: any; // you can use type if you have definition for this package

    constructor(someClass: SomeClass, @Require('gulp') gulp: any) {
        this.someClass = someClass;
        this.gulp = gulp; // the same if you do this.gulp = require('gulp')
    }

    make() {
        this.someClass.someMethod();
        console.log(this.gulp); // here you get console.logged gulp package =)
    }
}

let coffeeMaker = Container.get(CoffeeMaker);
coffeeMaker.make();
```

Take a look on samples in `./sample` for more examples of usages.

## Todos

* cover with tests