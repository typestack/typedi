import "reflect-metadata";
import {Container} from "../../src/Container";
import {Service} from "../../src/decorators/Service";
import {Inject} from "../../src/decorators/Inject";

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
