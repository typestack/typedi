import 'reflect-metadata';
import { Container } from '../../../src/index';
import { Service } from '../../../src/decorators/service.decorator';
import { Inject } from '../../../src/decorators/inject.decorator';

describe('Github Issues', function () {
  beforeEach(() => Container.reset({ strategy: 'resetValue' }));

  it('#112 - maximum call stack size error with circular dependencies', () => {
    @Service()
    class ClassA {
      @Inject(() => ClassB)
      classB: unknown;
    }

    @Service()
    class ClassB {
      @Inject(() => ClassA)
      classA: unknown;
    }

    const scopedContainer = Container.of('scoped');
    /** Retrieve the classes from the root container. */
    const rootClassA = Container.get(ClassA);
    const rootClassB = Container.get(ClassB);
    /** Retrieve the class instances from the cloned container. */
    const scopedClassA = scopedContainer.get(ClassA);
    const scopedClassB = scopedContainer.get(ClassB);

    /** Values should be properly resolved in the root. */
    expect(rootClassA).toBeInstanceOf(ClassA);
    expect(rootClassA.classB).toBeInstanceOf(ClassB);
    expect(rootClassB).toBeInstanceOf(ClassB);
    expect(rootClassB.classA).toBeInstanceOf(ClassA);
    expect(rootClassA).toStrictEqual(rootClassB.classA);
    expect(rootClassB).toStrictEqual(rootClassA.classB);

    /** Values should be properly resolved in the scoped. */
    expect(scopedClassA).toBeInstanceOf(ClassA);
    expect(scopedClassA.classB).toBeInstanceOf(ClassB);
    expect(scopedClassB).toBeInstanceOf(ClassB);
    expect(scopedClassB.classA).toBeInstanceOf(ClassA);
    expect(scopedClassA).toStrictEqual(scopedClassB.classA);
    expect(scopedClassB).toStrictEqual(scopedClassA.classB);

    /** Two container should not share the exact same instances. */
    expect(rootClassA).not.toStrictEqual(scopedClassA);
    expect(rootClassB).not.toStrictEqual(scopedClassB);
  });
});
