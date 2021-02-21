import 'reflect-metadata';
import { Container } from '../../../src/index';
import { Service } from '../../../src/decorators/service.decorator';
import { Inject } from '../../../src/decorators/inject.decorator';

describe('Github Issues', function () {
  beforeEach(() => Container.reset({ strategy: 'resetValue' }));

  it('#102 - handle @Inject()-ed values in inherited child classes', () => {
    @Service()
    class InjectedService {}

    @Service()
    class Base {
      public constructor(
        @Inject('config')
        public cfg: any,
        public injectedService: InjectedService
      ) {}
    }

    @Service()
    class Child extends Base {}

    const testconfig = { value: 'I AM A CONFIG OBJECT ' };
    Container.set({ id: 'config', value: testconfig});

    const baseService = Container.get(Base);
    const childService = Container.get(Child);

    expect(baseService).toBeInstanceOf(Base);
    expect(baseService.injectedService).toBeInstanceOf(InjectedService);
    expect(baseService.cfg).toEqual(testconfig);

    expect(childService).toBeInstanceOf(Child);
    expect(childService.injectedService).toBeInstanceOf(InjectedService);
    expect(childService.cfg).toEqual(testconfig);
  });
});
