import 'reflect-metadata';
import { Container } from '../../../src/index';
import { Service } from '../../../src/decorators/service.decorator';
import { Token } from '../../../src/token.class';

describe("github issues > #48 Token service iDs in global container aren't inherited by scoped containers", function () {
  beforeEach(() => Container.reset({ strategy: 'resetValue' }));

  it('should work properly', function () {
    let poloCounter = 0;

    const FooServiceToken = new Token<FooService>();

    @Service({ id: FooServiceToken })
    class FooService implements FooService {
      public marco() {
        poloCounter++;
      }
    }

    const scopedContainer = Container.of('myScopredContainer');
    const rootInstance = Container.get(FooServiceToken);
    const scopedInstance = scopedContainer.get(FooServiceToken);

    rootInstance.marco();
    scopedInstance.marco();

    expect(poloCounter).toBe(2);
  });
});
