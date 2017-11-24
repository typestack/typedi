import {Service} from "../../src/decorators/Service";
import {Factory} from "./Factory";
import {FactoryToken} from "./FactoryToken";

@Service({ id: FactoryToken, scope: "prototype" })
export class WaterFactory implements Factory {

    create() {
        console.log("water created");
    }

}