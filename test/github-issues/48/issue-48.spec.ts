import 'reflect-metadata';
import { Container } from '../../../src/container.class';
import { Service } from '../../../src/decorators/service.decorator';
import { Token } from '../../../src/token.class';

describe("github issues > #48 Token service iDs in global container aren't inherited by scoped containers", function () {
  beforeEach(() => Container.reset());

  it('should work properly', function () {
    let poloCounter = 0;

    const FooServiceToken = new Token<FooService>();

    @Service(FooServiceToken)
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
