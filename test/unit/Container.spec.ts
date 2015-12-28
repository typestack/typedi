import * as chai from "chai";
import {expect} from "chai";
import * as sinon from "sinon";
import {Container} from "../../src/Container";
import {Service} from "../../src/Decorators";

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
        Container.get<TestService>(TestService).should.be.equal(testService);
        Container.get<TestService>(TestService).name.should.be.equal("this is test");
    });

    it("should set named service", function() {
        const firstService = new TestService();
        firstService.name = "first";
        Container.set("first.service", TestService, firstService);

        const secondService = new TestService();
        secondService.name = "second";
        Container.set("second.service", TestService, secondService);

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

        Container.get<TestService>(TestService).should.be.equal(testService);
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

        Container.get<ExtraService>(ExtraService).luckyNumber.should.be.equal(777);
        Container.get<ExtraService>(ExtraService).message.should.be.equal("hello parameter");
    });

    it("should have ability to pre-specify initialized class properties", function() {
        Container.get<ExtraService>(ExtraService).badNumber.should.be.equal(888);
        Container.get<ExtraService>(ExtraService).byeMessage.should.be.equal("buy world");
    });

});
