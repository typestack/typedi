import 'reflect-metadata';
import { Container } from '../src/index';
import { Service } from '../src/decorators/service.decorator';

describe('Eager loading of services', function () {
  beforeEach(() => Container.reset({ strategy: 'resetValue' }));

  describe('Container API', () => {
    it('should be able to set eager and lazy service with Container API', () => {
      let callOrder = 1;

      class MyService {
        public createdAt = callOrder++;
      }

      Container.set({ id: 'eager-service', type: MyService, eager: true });
      Container.set({ id: 'lazy-service', type: MyService, eager: false });

      const timeStampBeforeRequests = callOrder++;

      const eagerService = Container.get<MyService>('eager-service');
      const lazyService = Container.get<MyService>('lazy-service');

      /** Both should resolve to an instance of the service. */
      expect(eagerService).toBeInstanceOf(MyService);
      expect(lazyService).toBeInstanceOf(MyService);

      /** Eager service should have a lower creation order number than the reference timestamp. */
      /** Lazy service should have a higher creation order number than the reference timestamp. */
      expect(eagerService.createdAt).toBe(1);
      expect(timeStampBeforeRequests).toBe(2);
      expect(lazyService.createdAt).toBe(3);
    });
  });

  describe('@Service decorator', () => {
    it('should be able to set eager and lazy service with @Service decorator', () => {
      let callOrder = 1;

      @Service({ eager: true })
      class MyEagerService {
        public createdAt = callOrder++;
      }

      @Service({ eager: false })
      class MyLazyService {
        public createdAt = callOrder++;
      }

      const timeStampBeforeRequests = callOrder++;

      const eagerService = Container.get(MyEagerService);
      const lazyService = Container.get(MyLazyService);

      /** Both should resolve to an instance of the service. */
      expect(eagerService).toBeInstanceOf(MyEagerService);
      expect(lazyService).toBeInstanceOf(MyLazyService);

      /** Eager service should have a lower creation order number than the reference timestamp. */
      /** Lazy service should have a higher creation order number than the reference timestamp. */
      expect(eagerService.createdAt).toBe(1);
      expect(timeStampBeforeRequests).toBe(2);
      expect(lazyService.createdAt).toBe(3);
    });
  });
});
