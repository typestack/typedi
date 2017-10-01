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

    it("should register classes in the container with string tags, and their instance should be retrievable", function() {
        @Service({tags: ["test1"]})
        class TestService1 {
        }
        @Service({tags: ["test1", "test2"]})
        class TestService2 {
        }

        const testService1 = Container.get(TestService1);
        const testService2 = Container.get(TestService2);
        Container.getAllByTag("test1").should.have.members([testService1, testService2]);
        Container.getAllByTag("test2").should.have.members([testService2]);
    });

    it("should register classes in the container with token tags, and their instance should be retrievable", function() {
        interface TagInterface1 {}
        interface TagInterface2 {}
        const Tag1 = new Token<TagInterface1>();
        const Tag2 = new Token<TagInterface2>();

        @Service({tags: [Tag1]})
        class TestService1 {
        }

        @Service({tags: [Tag1, Tag2]})
        class TestService2 {
        }

        const testService1 = Container.get(TestService1);
        const testService2 = Container.get(TestService2);
        Container.getAllByTag(Tag1).should.have.members([testService1, testService2]);
        Container.getAllByTag(Tag2).should.have.members([testService2]);
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

});
