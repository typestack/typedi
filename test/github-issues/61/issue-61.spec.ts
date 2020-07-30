import 'reflect-metadata';
import { Container } from '../../../src/Container';
import { Service } from '../../../src/decorators/Service';

describe('github issues > #61 Scoped container creates new instance of service every time', function () {
  beforeEach(() => Container.reset());

  it('should work properly', function () {
    @Service()
    class Car {
      public serial = Math.random();
    }

    const fooContainer = Container.of('foo');
    const barContainer = Container.of('bar');

    const car1Serial = Container.get(Car).serial;
    const car2Serial = Container.get(Car).serial;

    const fooCar1Serial = fooContainer.get(Car).serial;
    const fooCar2Serial = fooContainer.get(Car).serial;

    const barCar1Serial = barContainer.get(Car).serial;
    const barCar2Serial = barContainer.get(Car).serial;

    expect(car1Serial).toEqual(car2Serial);
    expect(fooCar1Serial).toEqual(fooCar2Serial);
    expect(barCar1Serial).toEqual(barCar2Serial);

    expect(car1Serial).not.toEqual(fooCar1Serial);
    expect(car1Serial).not.toEqual(barCar1Serial);
    expect(fooCar1Serial).not.toEqual(barCar1Serial);

    expect(Container.of({}).get(Car).serial === Container.of({}).get(Car).serial).toBe(false);
  });
});
