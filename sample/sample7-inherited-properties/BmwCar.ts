import {Car} from "./Car";
import {Wheel} from "./Wheel";
import {Inject} from "../../src/decorators/Inject";
import {Service} from "../../src/decorators/Service";

@Service()
export class BmwCar extends Car {

    @Inject()
    wheel: Wheel;

    drive(): void {
        console.log( this.driver.name + " is driving bmw with " + this.engine.model + " engine with " + this.wheel.count + " wheels");
    }

}