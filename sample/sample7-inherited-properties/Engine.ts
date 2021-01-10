import { Car } from './Car';
import { Inject } from '../../src/decorators/Inject';
import { Service } from '../../src/decorators/Service';

@Service()
export class Engine {
  @Inject(type => Car)
  car: Car;

  get model() {
    return '[' + this.car.year + '] v6';
  }
}
