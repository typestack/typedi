import { Service } from '../../src/index';
import { Bus } from './Bus';
import { Car } from './Car';

@Service()
export class Driver {
  constructor(private bus: Bus, private car: Car) {}

  driveBus() {
    this.bus.drive();
  }

  driveCar() {
    this.car.drive();
  }
}
