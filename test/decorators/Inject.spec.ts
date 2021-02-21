import 'reflect-metadata';
import { Container } from '../../src/index';
import { Service } from '../../src/decorators/service.decorator';
import { Inject } from '../../src/decorators/inject.decorator';
import { Token } from '../../src/token.class';
import { InjectMany } from '../../src/decorators/inject-many.decorator';

describe('Inject Decorator', function () {
  beforeEach(() => Container.reset({ strategy: 'resetValue' }));

  it('should inject service into class property', function () {
    @Service()
    class TestService {}
    @Service()
    class SecondTestService {
      @Inject()
      testService: TestService;
    }
    expect(Container.get(SecondTestService).testService).toBeInstanceOf(TestService);
  });

  it('should inject token service properly', function () {
    interface Test {}
    const ServiceToken = new Token<Test>();

    @Service({ id: ServiceToken })
    class TestService {}
    @Service()
    class SecondTestService {
      @Inject(ServiceToken)
      testService: Test;
    }
    expect(Container.get(SecondTestService).testService).toBeInstanceOf(TestService);
  });

  it('should inject named service into class property', function () {
    @Service({ id: 'mega.service' })
    class NamedService {}
    @Service()
    class SecondTestService {
      @Inject('mega.service')
      megaService: any;
    }
    expect(Container.get(SecondTestService).megaService).toBeInstanceOf(NamedService);
  });

  it('should inject service via constructor', function () {
    @Service()
    class TestService {}
    @Service()
    class SecondTestService {}
    @Service({ id: 'mega.service' })
    class NamedService {}
    @Service()
    class TestServiceWithParameters {
      constructor(
        public testClass: TestService,
        @Inject(type => SecondTestService) public secondTest: any,
        @Inject('mega.service') public megaService: any
      ) {}
    }
    expect(Container.get(TestServiceWithParameters).testClass).toBeInstanceOf(TestService);
    expect(Container.get(TestServiceWithParameters).secondTest).toBeInstanceOf(SecondTestService);
    expect(Container.get(TestServiceWithParameters).megaService).toBeInstanceOf(NamedService);
  });

  it("should inject service should work with 'many' instances", function () {
    interface Car {
      name: string;
    }
    @Service({ id: 'cars', multiple: true })
    class Bmw implements Car {
      name = 'BMW';
    }
    @Service({ id: 'cars', multiple: true })
    class Mercedes implements Car {
      name = 'Mercedes';
    }
    @Service({ id: 'cars', multiple: true })
    class Toyota implements Car {
      name = 'Toyota';
    }
    @Service()
    class TestServiceWithParameters {
      constructor(@InjectMany('cars') public cars: Car[]) {}
    }

    expect(Container.get(TestServiceWithParameters).cars).toHaveLength(3);

    const carNames = Container.get(TestServiceWithParameters).cars.map(car => car.name);
    expect(carNames).toContain('BMW');
    expect(carNames).toContain('Mercedes');
    expect(carNames).toContain('Toyota');
  });

  it('should work with empty decorator on constructor parameter', function () {
    @Service()
    class InjectedClass {}

    @Service()
    class TestService {
      constructor(@Inject() public myClass: InjectedClass) {}
    }

    const instance = Container.get(TestService);

    expect(instance).toBeInstanceOf(TestService);
    expect(instance.myClass).toBeInstanceOf(InjectedClass);
  });
});
