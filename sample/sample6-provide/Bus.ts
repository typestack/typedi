import {Service} from "../../src/index";

@Service()
export class Bus {

    drive(): void {
        console.log("Im driving the bus");
    }

}