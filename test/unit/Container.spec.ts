import "reflect-metadata";
import {Container} from "../../src/Container";
import {Service} from "../../src/decorators/Service";

describe("Container", function() {

    // -------------------------------------------------------------------------
    // Specifications
    // -------------------------------------------------------------------------

    beforeEach(() => {
        Container.reset();
    });

    it("should set a new class into the container", function() {
        class TestService {
            constructor(public name: string) {
            }
        }
        const testService = new TestService("this is test");
        Container.set(TestService, testService);
        Container.get(TestService).should.be.equal(testService);
        Container.get(TestService).name.should.be.equal("this is test");
    });

    it("should set named service", function() {
        class TestService {
            constructor(public name: string) {
            }
        }
        const firstService = new TestService("first");
        Container.set("first.service", firstService);

        const secondService = new TestService("second");
        Container.set("second.service", secondService);

        Container.get<TestService>("first.service").name.should.be.equal("first");
        Container.get<TestService>("second.service").name.should.be.equal("second");
    });

    it("should provide a list of values", function() {

        class TestService {
            constructor() {
            }
        }

        const testService = new TestService();
        const test1Service = new TestService();
        const test2Service = new TestService();

        Container.provide([
            { id: TestService, value: testService },
            { id: "test1-service", value: test1Service },
            { id: "test2-service", value: test2Service },
        ]);

        Container.get(TestService).should.be.equal(testService);
        Container.get<TestService>("test1-service").should.be.equal(test1Service);
        Container.get<TestService>("test2-service").should.be.equal(test2Service);

    });

    it("should have ability to pre-specify class initialization parameters", function() {

        @Service()
        class ExtraService {
            constructor(public luckyNumber: number, public message: string) {
            }
        }

        Container.registerHandler({
            target: ExtraService,
            index: 0,
            value: () => 777
        });

        Container.registerHandler({
            target: ExtraService,
            index: 1,
            value: () => "hello parameter"
        });

        Container.get(ExtraService).luckyNumber.should.be.equal(777);
        Container.get(ExtraService).message.should.be.equal("hello parameter");

    });

    it("should have ability to pre-specify initialized class properties", function() {

        function CustomInject(value: any) {
            return function(target: any, propertyName: string) {
                Container.registerHandler({
                    target: target,
                    propertyName: propertyName,
                    value: () => value
                });
            };
        }

        @Service()
        class ExtraService {

            @CustomInject(888)
            badNumber: number;

            @CustomInject("bye world")
            byeMessage: string;

        }

        Container.get(ExtraService).badNumber.should.be.equal(888);
        Container.get(ExtraService).byeMessage.should.be.equal("bye world");

    });

    it("should support container reset", () => {
        class TestService {
            constructor(public name: string = "frank") {
            }
        }
        const testService = new TestService("john");
        Container.set(TestService, testService);
        Container.get(TestService).should.be.equal(testService);
        Container.get(TestService).name.should.be.equal("john");
        Container.reset();
        Container.get(TestService).should.not.be.equal(testService);
        Container.get(TestService).name.should.be.equal("frank");
    });

    it("should support factory functions with dependencies", function() {

        @Service()
        class Engine {
            public serialNumber = "A-123";
        }

        class Car {
            constructor(public engine: Engine) {
            }
        }

        @Service()
        class CarFactory {

            constructor(private engine: Engine) {
            }

            createCar(): Car {
                return new Car(this.engine);
            }

        }

        Container.registerService({
            type: Car,
            factory: [CarFactory, "createCar"]
        });

        Container.get(Car).engine.serialNumber.should.be.equal("A-123");

    });

});
