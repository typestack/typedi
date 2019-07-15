import "reflect-metadata";
import {Container} from "../../src/Container";
import {Service} from "../../src/decorators/Service";
import {Token} from "../../src/Token";

describe("Service Decorator", function() {

    beforeEach(() => Container.reset());

    it("should register class in the container, and its instance should be retrievable", function() {
        @Service()
        class TestService {
        }
        @Service("super.service")
        class NamedService {
        }
        Container.get(TestService).should.be.instanceOf(TestService);
        Container.get(TestService).should.not.be.instanceOf(NamedService);
    });

    it("should register class in the container with given name, and its instance should be retrievable", function() {
        @Service()
        class TestService {
        }
        @Service("super.service")
        class NamedService {
        }
        Container.get("super.service").should.be.instanceOf(NamedService);
        Container.get("super.service").should.not.be.instanceOf(TestService);
    });

    it("should register class in the container, and its parameter dependencies should be properly initialized", function() {
        @Service()
        class TestService {
        }
        @Service()
        class SecondTestService {
        }
        @Service()
        class TestServiceWithParameters {
            constructor(public testClass: TestService, public secondTest: SecondTestService) {
            }
        }
        Container.get(TestServiceWithParameters).should.be.instanceOf(TestServiceWithParameters);
        Container.get(TestServiceWithParameters).testClass.should.be.instanceOf(TestService);
        Container.get(TestServiceWithParameters).secondTest.should.be.instanceOf(SecondTestService);
    });

    it("should support factory functions", function() {

        class Engine {
            constructor(public serialNumber: string) {
            }
        }

        function createCar() {
            return new Car("BMW", new Engine("A-123"));
        }

        @Service({ factory: createCar })
        class Car {
            constructor(public name: string, public engine: Engine) {
            }
        }

        Container.get(Car).name.should.be.equal("BMW");
        Container.get(Car).engine.serialNumber.should.be.equal("A-123");

    });

    it("should support factory classes", function() {

        @Service()
        class Engine {
            public serialNumber = "A-123";
        }

        @Service()
        class CarFactory {

            constructor(public engine: Engine) {
            }

            createCar() {
                return new Car("BMW", this.engine);
            }

        }

        @Service({ factory: [CarFactory, "createCar"] })
        class Car {
            name: string;
            constructor(name: string, public engine: Engine) {
                this.name = name;
            }
        }

        Container.get(Car).name.should.be.equal("BMW");
        Container.get(Car).engine.serialNumber.should.be.equal("A-123");

    });

    it("should support factory function with arguments", function() {

        @Service()
        class Engine {
            public type = "V8";
        }

        @Service()
        class CarFactory {
            createCar(engine: Engine) {
                engine.type = "V6";
                return new Car(engine);
            }
        }

        @Service({ factory: [CarFactory, "createCar"] })
        class Car {
            constructor(public engine: Engine) {
            }
        }

        Container.get(Car).engine.type.should.be.equal("V6");

    });

    it("should support transient services", function() {

        @Service()
        class Car {
            public serial = Math.random();
        }

        @Service({ transient: true })
        class Engine {
            public serial = Math.random();
        }

        const car1Serial = Container.get(Car).serial;
        const car2Serial = Container.get(Car).serial;
        const car3Serial = Container.get(Car).serial;

        const engine1Serial = Container.get(Engine).serial;
        const engine2Serial = Container.get(Engine).serial;
        const engine3Serial = Container.get(Engine).serial;

        car1Serial.should.be.equal(car2Serial);
        car1Serial.should.be.equal(car3Serial);

        engine1Serial.should.not.be.equal(engine2Serial);
        engine2Serial.should.not.be.equal(engine3Serial);
        engine3Serial.should.not.be.equal(engine1Serial);
    });

    it("should support global services", function() {

        @Service()
        class Engine {
            public name = "sporty";
        }

        @Service({ global: true })
        class Car {
            public name = "SportCar";
        }

        const globalContainer = Container;
        const scopedContainer = Container.of("enigma");

        globalContainer.get(Car).name.should.be.equal("SportCar");
        scopedContainer.get(Car).name.should.be.equal("SportCar");

        globalContainer.get(Engine).name.should.be.equal("sporty");
        scopedContainer.get(Engine).name.should.be.equal("sporty");

        globalContainer.get(Car).name = "MyCar";
        globalContainer.get(Engine).name = "regular";

        globalContainer.get(Car).name.should.be.equal("MyCar");
        scopedContainer.get(Car).name.should.be.equal("MyCar");

        globalContainer.get(Engine).name.should.be.equal("regular");
        scopedContainer.get(Engine).name.should.be.equal("sporty");
    });

    it("should support function injection with Token dependencies", function() {
        const token: Token<string> = new Token<string>("token");

        Container.set(token, "test_string");

        const TestService = Service([
            token
        ], function (s: string): string {
            return s.toUpperCase();
        });

        Container.get(TestService).should.be.equal("TEST_STRING");
    });

});
