import 'reflect-metadata';
import { Container } from '../../../src/index';
import { Service } from '../../../src/decorators/service.decorator';
import { Inject } from '../../../src/decorators/inject.decorator';

describe('github issues > #40 Constructor inject not working', function () {
  beforeEach(() => Container.reset({ strategy: 'resetValue' }));

  it('should work properly', function () {
    @Service({ id: 'AccessTokenService' })
    class AccessTokenService {
      constructor(
        @Inject('moment') public moment: any,
        @Inject('jsonwebtoken') public jsonwebtoken: any,
        @Inject('cfg.auth.jwt') public jwt: any
      ) {}
    }

    Container.set({ id: 'moment', value: 'A' });
    Container.set({ id: 'jsonwebtoken', value: 'B' });
    Container.set({ id: 'cfg.auth.jwt', value: 'C' });
    const accessTokenService = Container.get<AccessTokenService>('AccessTokenService');

    expect(accessTokenService.moment).not.toBeUndefined();
    expect(accessTokenService.jsonwebtoken).not.toBeUndefined();
    expect(accessTokenService.jwt).not.toBeUndefined();

    expect(accessTokenService.moment).toBe('A');
    expect(accessTokenService.jsonwebtoken).toBe('B');
    expect(accessTokenService.jwt).toBe('C');
  });
});
