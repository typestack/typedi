import 'reflect-metadata';
import { Container } from '../../../src/container.class';
import { Service } from '../../../src/decorators/service.decorator';

describe('Github Issues', function () {
  beforeEach(() => Container.reset());

  it('#157 - reset should not break transient services', () => {
    let creationCounter = 0;

    @Service({ transient: true })
    class TransientService {
      public constructor() {
        creationCounter++;
      }
    }

    Container.get(TransientService);
    Container.get(TransientService);

    expect(creationCounter).toBe(2);

    Container.reset();

    Container.get(TransientService);
    Container.get(TransientService);

    expect(creationCounter).toBe(4);
  });
});
