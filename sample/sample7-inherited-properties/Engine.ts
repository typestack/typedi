import {Service} from "../../src/index";
import {Car} from "./Car";
import {Inject} from "../../src/decorators";

@Service()
export class Engine {

    @Inject(type => Car)
    car: Car;

    get model() {
        return "[" + this.car.year + "] v6";
    }

}