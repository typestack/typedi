import 'reflect-metadata';
import { Container } from '../../../src/index';
import { Service } from '../../../src/decorators/service.decorator';
import { Token } from '../../../src/token.class';

describe('github issues > #41 Token as service id in combination with factory', function () {
  beforeEach(() => Container.reset({ strategy: 'resetValue' }));

  it('should work properly', function () {
    interface SomeInterface {
      foo(): string;
    }
    const SomeInterfaceToken = new Token<SomeInterface>();

    @Service()
    class SomeInterfaceFactory {
      create() {
        return new SomeImplementation();
      }
    }

    @Service({
      id: SomeInterfaceToken,
      factory: [SomeInterfaceFactory, 'create'],
    })
    class SomeImplementation implements SomeInterface {
      foo() {
        return 'hello implementation';
      }
    }

    Container.set('moment', 'A');
    Container.set('jsonwebtoken', 'B');
    Container.set('cfg.auth.jwt', 'C');
    const someInterfaceImpl = Container.get(SomeInterfaceToken);
    expect(someInterfaceImpl.foo()).toBe('hello implementation');
  });
});
