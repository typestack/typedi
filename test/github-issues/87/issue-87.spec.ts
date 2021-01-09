import 'reflect-metadata';
import { Container } from '../../../src/container.class';
import { Service } from '../../../src/decorators/service.decorator';
import { ServiceNotFoundError } from '../../../src/error/service-not-found.error';

describe('Github Issues', function () {
  beforeEach(() => Container.reset());

  it('#87 - TypeDI should throw error if a dependency is not found', () => {
    @Service()
    class InjectedClassA {}

    /** This class is not decorated with @Service decorator. */
    class InjectedClassB {}

    @Service()
    class MyClass {
      constructor(private injectedClassA: InjectedClassA, private injectedClassB: InjectedClassB) {}
    }

    expect(() => {
      Container.get(MyClass);
    }).toThrowError(ServiceNotFoundError);
  });
});
