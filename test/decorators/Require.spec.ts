import "reflect-metadata";
import {Container} from "../../src/Container";
import {Service} from "../../src/decorators/Service";
import {Require} from "../../src/decorators/Require";

describe("Require Decorator", function() {

    beforeEach(() => Container.reset());

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
