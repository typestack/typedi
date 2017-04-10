import "es6-shim";
import "reflect-metadata";
import {Container} from "../../src/Container";
import {Service} from "../../src/decorators";

describe("Container", function() {

    function CustomInject(value: any) {
        return function(target: any, key: string) {
            Container.registerPropertyHandler({
                target: target,
                key: key,
                getValue: () => value
            });
        };
    }

    class TestService {
        name: string;
        constructor(name?: string) {
            if (name)
                this.name = name;
        }
    }

    @Service()
    class ExtraService {

        @CustomInject(888)
        badNumber: number;

        @CustomInject("buy world")
        byeMessage: string;

        constructor(public luckyNumber: number, public message: string) {
        }
    }

    // -------------------------------------------------------------------------
    // Specifications
    // -------------------------------------------------------------------------

    it("should set a new class into the container", function() {
        const testService = new TestService();
        testService.name = "this is test";
        Container.set(TestService, testService);
        Container.get(TestService).should.be.equal(testService);
        Container.get(TestService).name.should.be.equal("this is test");
    });

    it("should set named service", function() {
        const firstService = new TestService();
        firstService.name = "first";
        Container.set("first.service", firstService);

        const secondService = new TestService();
        secondService.name = "second";
        Container.set("second.service", secondService);

        Container.get<TestService>("first.service").name.should.be.equal("first");
        Container.get<TestService>("second.service").name.should.be.equal("second");
    });

    it("should provide a list of values", function() {
        const testService = new TestService("Hello test");
        const test1Service = new TestService("Test first");
        const test2Service = new TestService("Test second");

        Container.provide([
            { type: TestService, value: testService },
            { name: "test1-service", type: TestService, value: test1Service },
            { name: "test2-service", type: TestService, value: test2Service },
        ]);

        Container.get(TestService).should.be.equal(testService);
        Container.get<TestService>("test1-service").should.be.equal(test1Service);
        Container.get<TestService>("test2-service").should.be.equal(test2Service);
    });

    it("should have ability to pre-specify class initialization parameters", function() {
        Container.registerParamHandler({
            type: ExtraService,
            index: 0,
            getValue: () => 777
        });
        Container.registerParamHandler({
            type: ExtraService,
            index: 1,
            getValue: () => "hello parameter"
        });

        Container.get(ExtraService).luckyNumber.should.be.equal(777);
        Container.get(ExtraService).message.should.be.equal("hello parameter");
    });

    it("should have ability to pre-specify initialized class properties", function() {
        Container.get(ExtraService).badNumber.should.be.equal(888);
        Container.get(ExtraService).byeMessage.should.be.equal("buy world");
    });

    it("should support basic factory functions", function() {

        class Bus {
            public color = "Yellow";
        }

        function createBus() {
            return new Bus();
        }

        Container.registerService(undefined, Bus, undefined, createBus);

        Container.get(Bus).color.should.be.equal("Yellow");

    });

    it("should support factory functions with dependencies", function() {

        class Engine {
            public serialNumber: "A-123";
        }

        class Car {
            constructor (private engine: Engine) {
            }
            getEngineSerialNumber () {
                return this.engine.serialNumber;
            }
        }

        function createCar (engine: Engine) {
            return new Car(engine);
        }

        // @todo: how do we tell container that `createCar()` needs an instance of `Engine`?
        Container.registerService(undefined, Car, undefined, createCar);

        Container.get(Car).getEngineSerialNumber().should.be.equal("A-123");

    });

});
