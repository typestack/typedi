import { Service } from '../../src/decorators/Service';
import { CarFactory } from './CarFactory';

@Service({ factory: [CarFactory, 'create'] })
export class Car {
  constructor(public name: string, public engineName: string, public wheelCount: number) {}
}
