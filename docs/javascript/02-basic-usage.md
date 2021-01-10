# Usage without TypeScript

> **NOTE:** This page is a direct copy of the old documentation. It will be reworked.

In your class's constructor you always receive as a last argument a container which you can use to get other dependencies.

```javascript
class BeanFactory {
  create() {}
}

class SugarFactory {
  create() {}
}

class WaterFactory {
  create() {}
}

class CoffeeMaker {
  constructor(container) {
    this.beanFactory = container.get(BeanFactory);
    this.sugarFactory = container.get(SugarFactory);
    this.waterFactory = container.get(WaterFactory);
  }

  make() {
    this.beanFactory.create();
    this.sugarFactory.create();
    this.waterFactory.create();
  }
}

var Container = require('typedi').Container;
var coffeeMaker = Container.get(CoffeeMaker);
coffeeMaker.make();
```

With TypeDI you can use a named services. Example:

```javascript
var Container = require('typedi').Container;

class BeanFactory implements Factory {
  create() {}
}

class SugarFactory implements Factory {
  create() {}
}

class WaterFactory implements Factory {
  create() {}
}

class CoffeeMaker {
  beanFactory: Factory;
  sugarFactory: Factory;
  waterFactory: Factory;

  constructor(container) {
    this.beanFactory = container.get('bean.factory');
    this.sugarFactory = container.get('sugar.factory');
    this.waterFactory = container.get('water.factory');
  }

  make() {
    this.beanFactory.create();
    this.sugarFactory.create();
    this.waterFactory.create();
  }
}

Container.set('bean.factory', new BeanFactory(Container));
Container.set('sugar.factory', new SugarFactory(Container));
Container.set('water.factory', new WaterFactory(Container));
Container.set('coffee.maker', new CoffeeMaker(Container));

var coffeeMaker = Container.get('coffee.maker');
coffeeMaker.make();
```

This feature especially useful if you want to store (and inject later on) some settings or configuration options.
For example:

```javascript
var Container = require('typedi').Container;

// somewhere in your global app parameters
Container.set('authorization-token', 'RVT9rVjSVN');

class UserRepository {
  constructor(container) {
    this.authorizationToken = container.get('authorization-token');
  }
}
```

When you write tests you can easily provide your own "fake" dependencies to classes you are testing using `set` method:

```javascript
Container.set(CoffeeMaker, new FakeCoffeeMaker());

// or for named services

Container.set([
  { id: 'bean.factory', value: new FakeBeanFactory() },
  { id: 'sugar.factory', value: new FakeSugarFactory() },
  { id: 'water.factory', value: new FakeWaterFactory() },
]);
```

TypeDI also supports a function dependency injection. Here is how it looks like:

```javascript
var Service = require('typedi').Service;
var Container = require('typedi').Container;

var PostRepository = Service(() => ({
  getName() {
    return 'hello from post repository';
  },
}));

var PostManager = Service(() => ({
  getId() {
    return 'some post id';
  },
}));

class PostQueryBuilder {
  build() {
    return 'SUPER * QUERY';
  }
}

var PostController = Service([PostManager, PostRepository, PostQueryBuilder], (manager, repository, queryBuilder) => {
  return {
    id: manager.getId(),
    name: repository.getName(),
    query: queryBuilder.build(),
  };
});

var postController = Container.get(PostController);
console.log(postController);
```
