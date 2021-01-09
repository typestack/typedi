import 'reflect-metadata';
import { Container } from '../../../src/container.class';
import { Service } from '../../../src/decorators/service.decorator';

describe('Github Issues', function () {
  beforeEach(() => Container.reset());

  it('#151 - should be able to define type when setting service', () => {
    /**
     * Note: This is more like a behavioral test the use-case showcased below
     * should be always possible, even if the API changes.
     */
    @Service()
    class AuthService {
      isAuthorized() {
        return 'nope';
      }
    }

    @Service()
    class DataService {
      constructor(public authService: AuthService) {}
    }
    @Service()
    class FakeDataService {
      constructor(public authService: AuthService) {}
    }

    Container.set({ id: DataService, type: FakeDataService });

    const instance = Container.get<FakeDataService>(DataService as any);

    expect(instance).toBeInstanceOf(FakeDataService);
    expect(instance.authService).toBeInstanceOf(AuthService);
    expect(instance.authService.isAuthorized()).toBe('nope');
  });
});
