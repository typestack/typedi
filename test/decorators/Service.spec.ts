import 'reflect-metadata';
import { Container } from '../../src/Container';
import { Service } from '../../src/decorators/Service';

describe('Service Decorator', function () {
  beforeEach(() => Container.reset());

  it('should register class in the container, and its instance should be retrievable', function () {
    @Service()
    class TestService {}
    @Service('super.service')
    class NamedService {}
    expect(Container.get(TestService)).toBeInstanceOf(TestService);
    expect(Container.get(TestService)).not.toBeInstanceOf(NamedService);
  });

  it('should register class in the container with given name, and its instance should be retrievable', function () {
    @Service()
    class TestService {}
    @Service('super.service')
    class NamedService {}
    expect(Container.get('super.service')).toBeInstanceOf(NamedService);
    expect(Container.get('super.service')).not.toBeInstanceOf(TestService);
  });

  it('should register class in the container, and its parameter dependencies should be properly initialized', function () {
    @Service()
    class TestService {}
    @Service()
    class SecondTestService {}
    @Service()
    class TestServiceWithParameters {
      constructor(public testClass: TestService, public secondTest: SecondTestService) {}
    }
    expect(Container.get(TestServiceWithParameters)).toBeInstanceOf(TestServiceWithParameters);
    expect(Container.get(TestServiceWithParameters).testClass).toBeInstanceOf(TestService);
    expect(Container.get(TestServiceWithParameters).secondTest).toBeInstanceOf(SecondTestService);
  });

  it('should support factory functions', function () {
    class Engine {
      constructor(public serialNumber: string) {}
    }

    function createCar() {
      return new Car('BMW', new Engine('A-123'));
    }

    @Service({ factory: createCar })
    class Car {
      constructor(public name: string, public engine: Engine) {}
    }

    expect(Container.get(Car).name).toBe('BMW');
    expect(Container.get(Car).engine.serialNumber).toBe('A-123');
  });

  it('should support factory classes', function () {
    @Service()
    class Engine {
      public serialNumber = 'A-123';
    }

    @Service()
    class CarFactory {
      constructor(public engine: Engine) {}

      createCar() {
        return new Car('BMW', this.engine);
      }
    }

    @Service({ factory: [CarFactory, 'createCar'] })
    class Car {
      name: string;
      constructor(name: string, public engine: Engine) {
        this.name = name;
      }
    }

    expect(Container.get(Car).name).toBe('BMW');
    expect(Container.get(Car).engine.serialNumber).toBe('A-123');
  });

  it('should support factory function with arguments', function () {
    @Service()
    class Engine {
      public type = 'V8';
    }

    @Service()
    class CarFactory {
      createCar(engine: Engine) {
        engine.type = 'V6';
        return new Car(engine);
      }
    }

    @Service({ factory: [CarFactory, 'createCar'] })
    class Car {
      constructor(public engine: Engine) {}
    }

    expect(Container.get(Car).engine.type).toBe('V6');
  });

  it('should support transient services', function () {
    @Service()
    class Car {
      public serial = Math.random();
    }

    @Service({ transient: true })
    class Engine {
      public serial = Math.random();
    }

    const car1Serial = Container.get(Car).serial;
    const car2Serial = Container.get(Car).serial;
    const car3Serial = Container.get(Car).serial;

    const engine1Serial = Container.get(Engine).serial;
    const engine2Serial = Container.get(Engine).serial;
    const engine3Serial = Container.get(Engine).serial;

    expect(car1Serial).toBe(car2Serial);
    expect(car1Serial).toBe(car3Serial);

    expect(engine1Serial).not.toBe(engine2Serial);
    expect(engine2Serial).not.toBe(engine3Serial);
    expect(engine3Serial).not.toBe(engine1Serial);
  });

  it('should support global services', function () {
    @Service()
    class Engine {
      public name = 'sporty';
    }

    @Service({ global: true })
    class Car {
      public name = 'SportCar';
    }

    const globalContainer = Container;
    const scopedContainer = Container.of('enigma');

    expect(globalContainer.get(Car).name).toBe('SportCar');
    expect(scopedContainer.get(Car).name).toBe('SportCar');

    expect(globalContainer.get(Engine).name).toBe('sporty');
    expect(scopedContainer.get(Engine).name).toBe('sporty');

    globalContainer.get(Car).name = 'MyCar';
    globalContainer.get(Engine).name = 'regular';

    expect(globalContainer.get(Car).name).toBe('MyCar');
    expect(scopedContainer.get(Car).name).toBe('MyCar');

    expect(globalContainer.get(Engine).name).toBe('regular');
    expect(scopedContainer.get(Engine).name).toBe('sporty');
  });
});
