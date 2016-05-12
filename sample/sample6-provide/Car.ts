import {Service} from "../../src/index";

@Service()
export class Car {

    drive(): void {
        console.log("Im driving the car");
    }

}