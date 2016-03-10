import {Service} from "../../src/typedi";

@Service()
export class Car {

    drive(): void {
        console.log("Im driving the car");
    }

}