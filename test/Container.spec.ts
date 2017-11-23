import "reflect-metadata";
import "chai";
import {Container} from "../src/Container";
import {Service} from "../src/decorators/Service";
import {Token} from "../src/Token";
import {expect} from "chai";
import {ServiceNotFoundError} from "../src/error/ServiceNotFoundError";

describe("Container", function() {

    beforeEach(() => Container.reset());

    describe("get", () => {

        it("should be able to get a boolean", () => {
            const booleanTrue = "boolean.true";
            const booleanFalse = "boolean.false";
            Container.set(booleanTrue, true);
            Container.set(booleanFalse, false);

            Container.get(booleanTrue).should.be.true;
            Container.get(booleanFalse).should.be.false;
        });

        it("should be able to get an empty string", () => {
            const emptyString = "emptyString";
            Container.set(emptyString, "");

            Container.get(emptyString).should.be.eq("");
        });

        it("should be able to get the 0 number", () => {
            const zero = "zero";
            Container.set(zero, 0);

            Container.get(zero).should.be.eq(0);
        });

    });

    describe("set", function() {

        it("should be able to set a class into the container", function() {
            class TestService {
                constructor(public name: string) {
                }
            }
            const testService = new TestService("this is test");
            Container.set(TestService, testService);
            Container.get(TestService).should.be.equal(testService);
            Container.get(TestService).name.should.be.equal("this is test");
        });

        it("should be able to set a named service", function() {
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

        it("should be able to set a tokenized service", function() {
            class TestService {
                constructor(public name: string) {
                }
            }
            const FirstTestToken = new Token<TestService>();
            const SecondTestToken = new Token<TestService>();

            const firstService = new TestService("first");
            Container.set(FirstTestToken, firstService);

            const secondService = new TestService("second");
            Container.set(SecondTestToken, secondService);

            Container.get(FirstTestToken).name.should.be.equal("first");
            Container.get(SecondTestToken).name.should.be.equal("second");
        });

        it("should override previous value if service is written second time", function() {
            class TestService {
                constructor(public name: string) {
                }
            }
            const TestToken = new Token<TestService>();

            const firstService = new TestService("first");
            Container.set(TestToken, firstService);
            Container.get(TestToken).should.be.equal(firstService);
            Container.get(TestToken).name.should.be.equal("first");

            const secondService = new TestService("second");
            Container.set(TestToken, secondService);

            Container.get(TestToken).should.be.equal(secondService);
            Container.get(TestToken).name.should.be.equal("second");
        });

    });

    describe("set multiple", function() {

        it("should be able to provide a list of values", function() {

            class TestService {
                constructor() {
                }
            }

            const testService = new TestService();
            const test1Service = new TestService();
            const test2Service = new TestService();

            Container.set([
                { id: TestService, value: testService },
                { id: "test1-service", value: test1Service },
                { id: "test2-service", value: test2Service },
            ]);

            Container.get(TestService).should.be.equal(testService);
            Container.get<TestService>("test1-service").should.be.equal(test1Service);
            Container.get<TestService>("test2-service").should.be.equal(test2Service);

        });

    });

    describe("remove", function() {

        it("should be able to remove previously registered services", function() {

            class TestService {
                constructor() {
                }
            }

            const testService = new TestService();
            const test1Service = new TestService();
            const test2Service = new TestService();

            Container.set([
                { id: TestService, value: testService },
                { id: "test1-service", value: test1Service },
                { id: "test2-service", value: test2Service },
            ]);

            Container.get(TestService).should.be.equal(testService);
            Container.get<TestService>("test1-service").should.be.equal(test1Service);
            Container.get<TestService>("test2-service").should.be.equal(test2Service);

            Container.remove("test1-service", "test2-service");

            Container.get(TestService).should.be.equal(testService);
            expect(() => Container.get<TestService>("test1-service")).to.throw(ServiceNotFoundError);
            expect(() => Container.get<TestService>("test2-service")).to.throw(ServiceNotFoundError);

        });

    });

    describe("reset", function() {
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
    });

    describe("registerHandler", function() {

        it("should have ability to pre-specify class initialization parameters", function() {

            @Service()
            class ExtraService {
                constructor(public luckyNumber: number, public message: string) {
                }
            }

            Container.registerHandler({
                object: ExtraService,
                index: 0,
                value: () => 777
            });

            Container.registerHandler({
                object: ExtraService,
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
                        object: target,
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

    });

    describe("set with ServiceMetadata passed", function() {

        it("should support factory functions", function() {

            class Engine {
                public serialNumber = "A-123";
            }

            class Car {
                constructor(public engine: Engine) {
                }
            }

            Container.set({
                type: Car,
                factory: () => new Car(new Engine())
            });

            Container.get(Car).engine.serialNumber.should.be.equal("A-123");

        });

        it("should support factory classes", function() {

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

            Container.set({
                type: Car,
                factory: [CarFactory, "createCar"]
            });

            Container.get(Car).engine.serialNumber.should.be.equal("A-123");

        });

        it("should support tokenized services from factories", function() {

            interface Vehicle {
                getColor(): string;
            }

            class Bus implements Vehicle {
                getColor (): string {
                    return "yellow";
                }
            }

            class VehicleFactory {
                createBus(): Vehicle {
                    return new Bus();
                }
            }

            const VehicleService = new Token<Vehicle>();

            Container.set({
                id: VehicleService,
                factory: [VehicleFactory, "createBus"]
            });

            Container.get(VehicleService).getColor().should.be.equal("yellow");

        });

    });

});
