import "reflect-metadata";
import {Inject, Require, Service} from "../../src/decorators";
import {Container} from "../../src/Container";

describe("Service Decorator", function() {

    beforeEach(() => {
       Container.reset();
    });

    // -------------------------------------------------------------------------
    // Specifications
    // -------------------------------------------------------------------------

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

    it("should support factory functions with dependencies", function() {

        @Service()
        class Engine {
            public serialNumber = "A-123";
        }

        function createCar(engine: Engine) {
            return new Car("BMW", engine);
        }

        @Service()
        class CarFactory {

            constructor(public engine: Engine) {
            }

            createCar(engine: Engine) {
                return new Car("BMW", engine);
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

describe("Inject Decorator", function() {

    beforeEach(() => {
        Container.reset();
    });

    // -------------------------------------------------------------------------
    // Specifications
    // -------------------------------------------------------------------------

    it("should inject service into class property", function() {
        @Service()
        class TestService {
        }
        @Service()
        class SecondTestService {
            @Inject()
            testService: TestService;
        }
        Container.get(SecondTestService).testService.should.be.instanceOf(TestService);
    });

    it("should inject named service into class property", function() {
        @Service("mega.service")
        class NamedService {
        }
        @Service()
        class SecondTestService {
            @Inject("mega.service")
            megaService: any;
        }
        Container.get(SecondTestService).megaService.should.be.instanceOf(NamedService);
    });

    it("should inject service via constructor", function() {
        @Service()
        class TestService {
        }
        @Service()
        class SecondTestService {
        }
        @Service("mega.service")
        class NamedService {
        }
        @Service()
        class TestServiceWithParameters {
            constructor(
                public testClass: TestService,
                @Inject(type => SecondTestService) public secondTest: any,
                @Inject("mega.service") public megaService: any
            ) {
            }
        }
        Container.get(TestServiceWithParameters).testClass.should.be.instanceOf(TestService);
        Container.get(TestServiceWithParameters).secondTest.should.be.instanceOf(SecondTestService);
        Container.get(TestServiceWithParameters).megaService.should.be.instanceOf(NamedService);
    });

});

describe("Require Decorator", function() {

    beforeEach(() => {
        Container.reset();
    });

    // -------------------------------------------------------------------------
    // Specifications
    // -------------------------------------------------------------------------

    it("should require package into class property", function() {
        @Service()
        class TestService {

            @Require("path")
            path: any;

            @Require("fs")
            fs: any;

        }
        Container.get(TestService).path.should.be.equal(require("path"));
        Container.get(TestService).fs.should.be.equal(require("fs"));
    });

    it("should require package to constructor parameter", function() {
        @Service()
        class SecondTestService {
            constructor(
                @Require("path") public path: any,
                @Require("fs") public fs: any
            ) {}
        }
        Container.get(SecondTestService).path.should.be.equal(require("path"));
        Container.get(SecondTestService).fs.should.be.equal(require("fs"));
    });

});
