import "reflect-metadata";
import {Container} from "../../src/Container";
import {Service} from "../../src/decorators/Service";

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

});
