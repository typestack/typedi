import {Service} from "../../src/decorators/Service";

@Service()
export class Car {

    drive(): void {
        console.log("Im driving the car");
    }

}