import 'reflect-metadata';
import { Container } from '../../src/Container';
import { Service } from '../../src/decorators/Service';
import { Inject } from '../../src/decorators/Inject';
import { Token } from '../../src/Token';
import { InjectMany } from '../../src/decorators/InjectMany';

describe('Inject Decorator', function () {
  beforeEach(() => Container.reset());

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

    @Service(ServiceToken)
    class TestService {}
    @Service()
    class SecondTestService {
      @Inject(ServiceToken)
      testService: Test;
    }
    expect(Container.get(SecondTestService).testService).toBeInstanceOf(TestService);
  });

  it('should inject named service into class property', function () {
    @Service('mega.service')
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
    @Service('mega.service')
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
});
