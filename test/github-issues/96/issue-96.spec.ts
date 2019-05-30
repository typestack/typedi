import "reflect-metadata";
import {Container} from "../../../src/Container";
import {expect} from "chai";
import { A } from "./A";
import { CircularImportError } from "../../../src/error/CircularImportError";

describe("github issues > #96 circular imports can cause constructor injection to fail silently", function() {

    beforeEach(() => Container.reset());

    it("should throw an error instead of silently doing the wrong thing", function() {

      expect(() => Container.get(A)).to.throw(CircularImportError);

    });

});
