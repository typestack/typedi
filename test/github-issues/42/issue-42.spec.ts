import 'reflect-metadata';
import { Container } from '../../../src/Container';
import { Service } from '../../../src/decorators/Service';
import { Inject } from '../../../src/decorators/Inject';

describe('github issues > #42 Exception not thrown on missing binding', function () {
  beforeEach(() => Container.reset());

  it('should work properly', function () {
    interface Factory {
      create(): void;
    }

    @Service()
    class CoffeeMaker {
      @Inject() // This is an incorrect usage of typedi because Factory is an interface
      private factory: Factory;

      make() {
        this.factory.create();
      }
    }

    expect(() => {
      Container.get(CoffeeMaker);
    }).toThrowError(Error);
  });
});
