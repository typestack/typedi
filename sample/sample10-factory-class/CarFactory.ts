import { Service } from '../../src/decorators/Service';
import { Engine } from './Engine';
import { Wheel } from './Wheel';
import { Car } from './Car';

@Service()
export class CarFactory {
  constructor(private engine: Engine, private wheel: Wheel) {}

  create() {
    return new Car('BMW', this.engine.model, this.wheel.count);
  }
}
