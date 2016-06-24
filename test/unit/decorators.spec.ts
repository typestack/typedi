import "es6-shim";
import "reflect-metadata";
import * as chai from "chai";
import {expect} from "chai";
import * as sinon from "sinon";
import {Service, Inject, Require} from "../../src/decorators";
import {Container} from "../../src/Container";

describe("Service Decorator", function() {

    @Service()
    class TestService {
    }

    @Service()
    class SecondTestService {
    }

    @Service("super.service")
    class NamedService {
    }

    @Service()
    class TestServiceWithParameters {
        constructor(public testClass: TestService, public secondTest: SecondTestService) {
        }
    }

    // -------------------------------------------------------------------------
    // Specifications
    // -------------------------------------------------------------------------

    it("should register class in the container, and its instance should be retrievable", function() {
        Container.get(TestService).should.be.instanceOf(TestService);
        Container.get(TestService).should.not.be.instanceOf(NamedService);
    });

    it("should register class in the container with given name, and its instance should be retrievable", function() {
        Container.get("super.service").should.be.instanceOf(NamedService);
        Container.get("super.service").should.not.be.instanceOf(TestService);
    });

    it("should register class in the container, and its parameter dependencies should be properly initialized", function() {
        Container.get(TestServiceWithParameters).should.be.instanceOf(TestServiceWithParameters);
        Container.get(TestServiceWithParameters).testClass.should.be.instanceOf(TestService);
        Container.get(TestServiceWithParameters).secondTest.should.be.instanceOf(SecondTestService);
    });

});

describe("Inject Decorator", function() {

    @Service()
    class TestService {
    }

    @Service("mega.service")
    class NamedService {
    }

    @Service()
    class SecondTestService {

        @Inject()
        testService: TestService;

        @Inject("mega.service")
        megaService: any;

    }

    @Service()
    class TestServiceWithParameters {
        constructor(public testClass: TestService,
                    @Inject(type => SecondTestService) public secondTest: any,
                    @Inject("mega.service") public megaService: any) {
        }
    }

    // -------------------------------------------------------------------------
    // Specifications
    // -------------------------------------------------------------------------

    it("should inject service into class property", function() {
        Container.get(SecondTestService).testService.should.be.instanceOf(TestService);
    });

    it("should inject named service into class property", function() {
        Container.get(SecondTestService).megaService.should.be.instanceOf(NamedService);
    });

    it("should inject service via constructor", function() {
        Container.get(TestServiceWithParameters).testClass.should.be.instanceOf(TestService);
        Container.get(TestServiceWithParameters).secondTest.should.be.instanceOf(SecondTestService);
        Container.get(TestServiceWithParameters).megaService.should.be.instanceOf(NamedService);
    });

});

describe("Require Decorator", function() {

    @Service()
    class TestService {

        @Require("path")
        path: any;

        @Require("fs")
        fs: any;

    }

    @Service()
    class SecondTestService {

        constructor(@Require("path") public path: any,
                    @Require("fs") public fs: any) {
        }

    }

    @Service()
    class TestServiceWithParameters {
    }

    // -------------------------------------------------------------------------
    // Specifications
    // -------------------------------------------------------------------------

    it("should require package into class property", function() {
        Container.get(TestService).path.should.be.equal(require("path"));
        Container.get(TestService).fs.should.be.equal(require("fs"));
    });

    it("should require package to constructor parameter", function() {
        Container.get(SecondTestService).path.should.be.equal(require("path"));
        Container.get(SecondTestService).fs.should.be.equal(require("fs"));
    });

});
