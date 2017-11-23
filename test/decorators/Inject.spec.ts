import "reflect-metadata";
import {Container} from "../../src/Container";
import {Service} from "../../src/decorators/Service";
import {Inject, InjectTagged} from "../../src/decorators/Inject";
import {Token} from "../../src/Token";

describe("Inject Decorator", function() {

    beforeEach(() => Container.reset());

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

    it("should inject token service properly", function() {
        interface Test {

        }
        const ServiceToken = new Token<Test>();

        @Service(ServiceToken)
        class TestService {
        }
        @Service()
        class SecondTestService {
            @Inject(ServiceToken)
            testService: Test;
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


    it("should inject tagged service into class property", function() {
        @Service({tags: ["test"]})
        class TaggedService {
        }
        @Service()
        class SecondTestService {
            @InjectTagged("test")
            taggedServices: any[];
        }
        Container.get(SecondTestService).taggedServices[0].should.be.instanceOf(TaggedService);
    });

});
