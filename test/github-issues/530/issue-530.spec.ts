import 'reflect-metadata';
import { Container } from '../../../src/index';
import { Service } from '../../../src/decorators/service.decorator';
import { Inject } from '../../../src/decorators/inject.decorator';
import { Token } from '../../../src/token.class';

describe('Github Issues', function () {
  beforeEach(() => Container.reset({ strategy: 'resetValue' }));

  it('#530 - inject should ignore array types', () => {
    const token = new Token('token');
    Container.set({ id: token, value: 'tokenValue' });

    @Service()
    class TestClass {}

    const classInstance = new TestClass();
    Container.set({ id: TestClass, value: classInstance });

    @Service()
    class Test {
      public injectedValue: string;
      public injectedClass: TestClass;
      public notInjectedArray;

      constructor(@Inject(token) injected: string, injectedClass: TestClass, notInjected?: string[]) {
        this.injectedValue = injected;
        this.injectedClass = injectedClass;
        this.notInjectedArray = notInjected;
      }
    }

    const resolvedClass = Container.get<Test>(Test);

    expect(resolvedClass.injectedClass).toBe(classInstance);
    expect(resolvedClass.notInjectedArray).toBe(undefined);
    expect(resolvedClass.injectedValue).toBe('tokenValue');
  });
});
