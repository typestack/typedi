import "reflect-metadata";
import {Container} from "../../../src/Container";
import {Service} from "../../../src/decorators/Service";
import {Inject} from "../../../src";

describe("github issues > #112 Circular dependencies inside a scoped container", function() {

    beforeEach(() => Container.reset());

    it("should work properly", function() {

        @Service()
        class A {
            @Inject(() => B) public b: any;
        }

        @Service()
        class B {
            @Inject(() => A) public a: any;
        }

        const aFromGlobal = Container.get(A);
        const bFromGlobal = Container.get(B);

        aFromGlobal.should.be.equal(bFromGlobal.a);
        bFromGlobal.should.be.equal(aFromGlobal.b);

        const scopedContainer = Container.of("foo");

        const aFromScoped = scopedContainer.get(A);
        const bFromScoped = scopedContainer.get(B);

        aFromScoped.should.be.equal(bFromScoped.a);
        bFromScoped.should.be.equal(aFromScoped.b);

        aFromScoped.should.not.be.equal(aFromGlobal);
        bFromScoped.should.not.be.equal(bFromGlobal);
    });

});
