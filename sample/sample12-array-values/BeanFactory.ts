import {Service} from "../../src/decorators/Service";
import {Factory} from "./Factory";
import {FactoryToken} from "./FactoryToken";

@Service({ id: FactoryToken, scope: "prototype" })
export class BeanFactory implements Factory {

    create() {
        console.log("bean created");
    }

}