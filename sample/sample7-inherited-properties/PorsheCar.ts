import {Service} from "../../src/index";
import {Car} from "./Car";

@Service()
export class PorsheCar extends Car {

    drive(): void {
        console.log( this.driver.name + " is driving porshe with " + this.engine.model + " engine");
    }

}