import { Inject } from '../../src/decorators/Inject';
import { Driver } from './Driver';
import { Engine } from './Engine';

export abstract class Car {
  @Inject()
  driver: Driver;

  @Inject()
  engine: Engine;

  year = 2016;

  abstract drive(): void;
}
