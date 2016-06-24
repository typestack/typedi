import {Service} from "../../src/index";
import {Car} from "./Car";
import {Inject} from "../../src/decorators";
import {Wheel} from "./Wheel";

@Service()
export class BmwCar extends Car {

    @Inject()
    wheel: Wheel;

    drive(): void {
        console.log( this.driver.name + " is driving bmw with " + this.engine.model + " engine with " + this.wheel.count + " wheels");
    }

}