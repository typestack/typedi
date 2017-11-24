import {Service} from "../../src/decorators/Service";
import {Factory} from "./Factory";
import {FactoryToken} from "./FactoryToken";

@Service({ id: FactoryToken, scope: "prototype" })
export class SugarFactory implements Factory {

    create() {
        console.log("sugar created");
    }

}