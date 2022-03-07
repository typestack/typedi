# Documentation

## Typescript Usage

With TypeDI you can use a named services. Example:

```typescript
import { Container, Service, Inject } from 'typedi';

interface Factory {
  create(): void;
}

@Service({ id: 'bean.factory' })
class BeanFactory implements Factory {
  create() {}
}

@Service({ id: 'sugar.factory' })
class SugarFactory implements Factory {
  create() {}
}

@Service({ id: 'water.factory' })
class WaterFactory implements Factory {
  create() {}
}

@Service({ id: 'coffee.maker' })
class CoffeeMaker {
  beanFactory: Factory;
  sugarFactory: Factory;

  @Inject('water.factory')
  waterFactory: Factory;

  constructor(@Inject('bean.factory') beanFactory: BeanFactory, @Inject('sugar.factory') sugarFactory: SugarFactory) {
    this.beanFactory = beanFactory;
    this.sugarFactory = sugarFactory;
  }

  make() {
    this.beanFactory.create();
    this.sugarFactory.create();
    this.waterFactory.create();
  }
}

let coffeeMaker = Container.get<CoffeeMaker>('coffee.maker');
coffeeMaker.make();
```

This feature especially useful if you want to store (and inject later on) some settings or configuration options.
For example:

```typescript
import { Container, Service, Inject } from 'typedi';

// somewhere in your global app parameters
Container.set('authorization-token', 'RVT9rVjSVN');

@Service()
class UserRepository {
  @Inject('authorization-token')
  authorizationToken: string;
}
```

When you write tests you can easily provide your own "fake" dependencies to classes you are testing using `set` method:
`provide` methods of the container:

```typescript
Container.set(CoffeeMaker, new FakeCoffeeMaker());

// or for named services

Container.set([
  { id: 'bean.factory', value: new FakeBeanFactory() },
  { id: 'sugar.factory', value: new FakeSugarFactory() },
  { id: 'water.factory', value: new FakeWaterFactory() },
]);
```

## TypeScript Advanced Usage Examples

- [Using factory function to create service](#using-factory-function-to-create-service)
- [Using factory class to create service](#using-factory-class-to-create-service)
- [Problem with circular references](#problem-with-circular-references)
- [Custom decorators](#custom-decorators)
- [Using service groups](#using-service-groups)
- [Using multiple containers and scoped containers](#using-multiple-containers-and-scoped-containers)
- [Remove registered services or reset container state](#remove-registered-services-or-reset-container-state)

### Using factory function to create service

You can create your services with the container using factory functions.

This way, service instance will be created by calling your factory function instead of
instantiating a class directly.

```typescript
import { Container, Service } from 'typedi';

function createCar() {
  return new Car('V8');
}

@Service({ factory: createCar })
class Car {
  constructor(public engineType: string) {}
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
import { Container, Service } from 'typedi';

@Service()
class CarFactory {
  constructor(public logger: LoggerService) {}

  create() {
    return new Car('BMW', this.logger);
  }
}

@Service({ factory: [CarFactory, 'create'] })
class Car {
  constructor(public model: string, public logger: LoggerInterface) {}
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

And that's all. This does **NOT** work for constructor injections.

### Custom decorators

You can create your own decorators which will inject your given values for your service dependencies.
For example:

```typescript
// Logger.ts
export function Logger() {
  return function (object: Object, propertyName: string, index?: number) {
    const logger = new ConsoleLogger();
    Container.registerHandler({ object, propertyName, index, value: containerInstance => logger });
  };
}

// LoggerInterface.ts
export interface LoggerInterface {
  log(message: string): void;
}

// ConsoleLogger.ts
import { LoggerInterface } from './LoggerInterface';

export class ConsoleLogger implements LoggerInterface {
  log(message: string) {
    console.log(message);
  }
}

// UserRepository.ts
@Service()
export class UserRepository {
  constructor(@Logger() private logger: LoggerInterface) {}

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
export const FactoryToken = new Token<Factory>('factories');

// BeanFactory.ts
@Service({ id: FactoryToken, multiple: true })
export class BeanFactory implements Factory {
  create() {
    console.log('bean created');
  }
}

// SugarFactory.ts
@Service({ id: FactoryToken, multiple: true })
export class SugarFactory implements Factory {
  create() {
    console.log('sugar created');
  }
}

// WaterFactory.ts
@Service({ id: FactoryToken, multiple: true })
export class WaterFactory implements Factory {
  create() {
    console.log('water created');
  }
}

// app.ts
// now you can get all factories in a single array
Container.import([BeanFactory, SugarFactory, WaterFactory]);
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
  constructor(protected questionRepository: QuestionRepository) {}

  save() {
    this.questionRepository.save();
  }
}

// QuestionRepository.ts
@Service()
export class QuestionRepository {
  save() {}
}

// app.ts
const request1 = { param: 'question1' };
const controller1 = Container.of(request1).get(QuestionController);
controller1.save('Timber');
Container.reset(request1);

const request2 = { param: 'question2' };
const controller2 = Container.of(request2).get(QuestionController);
controller2.save('');
Container.reset(request2);
```

In this example `controller1` and `controller2` are completely different instances,
and `QuestionRepository` used in those controllers are different instances as well.

`Container.reset` removes container with the given context identifier.
If you want your services to be completely global and not be container-specific,
you can mark them as global:

```typescript
@Service({ global: true })
export class QuestionUtils {}
```

And this global service will be the same instance across all containers.

TypeDI also supports a function dependency injection. Here is how it looks like:

```javascript
export const PostRepository = Service(() => ({
  getName() {
    return 'hello from post repository';
  },
}));

export const PostManager = Service(() => ({
  getId() {
    return 'some post id';
  },
}));

export class PostQueryBuilder {
  build() {
    return 'SUPER * QUERY';
  }
}

export const PostController = Service(
  [PostManager, PostRepository, PostQueryBuilder],
  (manager, repository, queryBuilder) => {
    return {
      id: manager.getId(),
      name: repository.getName(),
      query: queryBuilder.build(),
    };
  }
);

const postController = Container.get(PostController);
console.log(postController);
```

### Remove registered services or reset container state

If you need to remove registered service from container simply use `Container.remove(...)` method.
Also you can completely reset the container by calling `Container.reset()` method.
This will effectively remove all registered services from the container.
