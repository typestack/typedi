import "reflect-metadata";
import {Container} from "../../../src/Container";
import {Service} from "../../../src/decorators/Service";
import {Inject} from "../../../src/decorators/Inject";
import {expect} from "chai";

describe("github issues > #40 Constructor inject not working", function() {

    beforeEach(() => Container.reset());

    it("should work properly", function() {

        @Service("AccessTokenService")
        class AccessTokenService {

            constructor(@Inject("moment") public moment: any,
                        @Inject("jsonwebtoken") public jsonwebtoken: any,
                        @Inject("cfg.auth.jwt") public jwt: any) {
            }

        }

        Container.set("moment", "A");
        Container.set("jsonwebtoken", "B");
        Container.set("cfg.auth.jwt", "C");
        const accessTokenService = Container.get<AccessTokenService>("AccessTokenService");

        expect(accessTokenService.moment).not.to.be.undefined;
        expect(accessTokenService.jsonwebtoken).not.to.be.undefined;
        expect(accessTokenService.jwt).not.to.be.undefined;

        accessTokenService.moment.should.be.equal("A");
        accessTokenService.jsonwebtoken.should.be.equal("B");
        accessTokenService.jwt.should.be.equal("C");
    });

});
