import 'reflect-metadata';
import { Container } from '../../../src/container.class';
import { Service } from '../../../src/decorators/service.decorator';
import { Inject } from '../../../src/decorators/inject.decorator';
import { CannotInjectValueError } from '../../../src/error/cannot-inject-value.error';

describe('github issues > #42 Exception not thrown on missing binding', function () {
  beforeEach(() => Container.reset());

  it('should work properly', function () {
    interface Factory {
      create(): void;
    }

    expect(() => {
      @Service()
      class CoffeeMaker {
        @Inject() // This is an incorrect usage of TypeDI because Factory is an interface
        private factory: Factory;

        make() {
          this.factory.create();
        }
      }
      // We doesn't even need to call `Container.get(CoffeeMaker);`, TypeDI will detect this error, while
      // the JS code is parsed and decorators are executed.
    }).toThrowError(CannotInjectValueError);
  });
});
