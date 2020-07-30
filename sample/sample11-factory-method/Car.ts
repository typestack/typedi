import { Service } from '../../src/decorators/Service';
import { carFactory } from './carFactory';

@Service({ factory: carFactory })
export class Car {
  constructor(public name: string, public engineName: string, public wheelCount: number) {}
}
