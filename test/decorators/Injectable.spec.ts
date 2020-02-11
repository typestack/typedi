import "reflect-metadata";
import { Container } from "../../src/Container";
import { Injectable } from "../../src/decorators/Injectable";

describe("Injectable Decorator", function () {

    beforeEach(() => Container.reset());

    it("should register class in the container, and its instance should be retrievable through abstract class", function () {
        abstract class ITestClass {
            abstract test(): Promise<number>;
        }

        @Injectable(ITestClass)
        class TestClass implements ITestClass {
            constructor() { }
            test() {
                return Promise.resolve(100);
            }
        }
        Container.get(ITestClass).should.be.instanceOf(TestClass);

    });

});
