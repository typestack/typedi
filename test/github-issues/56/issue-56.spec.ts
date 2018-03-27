import "reflect-metadata";
import {Container} from "../../../src/Container";
import {Service} from "../../../src/decorators/Service";
import {expect} from "chai";

describe("github issues > #56 extended class is being overwritten", function() {

    beforeEach(() => Container.reset());

    it("should work properly", function() {

        @Service()
        class Rule {
            getRule() {
                return "very strict rule";
            }
        }

        @Service()
        class Whitelist extends Rule {
            getWhitelist() {
                return ["rule1", "rule2"];
            }
        }

        const whitelist = Container.get(Whitelist);
        expect(whitelist.getRule).to.not.be.undefined;
        expect(whitelist.getWhitelist).to.not.be.undefined;
        whitelist.getWhitelist().should.be.eql(["rule1", "rule2"]);
        whitelist.getRule().should.be.equal("very strict rule");

        const rule = Container.get(Rule);
        expect(rule.getRule).to.not.be.undefined;
        expect((rule as Whitelist).getWhitelist).to.be.undefined;
        rule.getRule().should.be.equal("very strict rule");
    });

});
