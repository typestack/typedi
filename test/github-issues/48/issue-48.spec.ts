import 'reflect-metadata';
import { Container } from '../../../src/Container';
import { Service } from '../../../src/decorators/Service';
import { Token } from '../../../src';

describe("github issues > #48 Token service iDs in global container aren't inherited by scoped containers", function () {
  beforeEach(() => Container.reset());

  it('should work properly', function () {
    let poloCounter = 0;

    interface FooService {
      marco(): void;
    }

    const FooServiceToken = new Token<FooService>();

    // @Service({ id: FooServiceToken, factory: () => new FooServiceI() }) <= Providing a factory does not work either
    @Service(FooServiceToken)
    class FooServiceI implements FooService {
      public marco() {
        poloCounter++;
      }
    }

    Container.get(FooServiceToken).marco();
    const scopedContainer = Container.of({});
    scopedContainer.get(FooServiceI).marco();
    scopedContainer.get(FooServiceToken).marco();
    expect(poloCounter).toBe(3);
  });
});
