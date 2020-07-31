import 'reflect-metadata';
import { Container } from '../../../src/Container';
import { Service } from '../../../src/decorators/Service';
import { Inject } from '../../../src/decorators/Inject';

describe('github issues > #102 inheritance', () => {
  beforeEach(() => Container.reset());

  it('child class should receive dependency defined in parent', () => {
    @Service()
    class Bla {}

    @Service()
    class Base {
      constructor(
        @Inject('config')
        public cfg: any,
        public bla: Bla
      ) {}
    }

    @Service()
    class Child extends Base {}

    Container.set('config', 'value');

    const base = Container.get(Base);
    const child = Container.get(Child);

    expect(base.cfg).toBe('value');
    expect(base.bla).toBeInstanceOf(Bla);

    expect(child.cfg).toBe('value');
    expect(child.bla).toBeInstanceOf(Bla);
  });
});
