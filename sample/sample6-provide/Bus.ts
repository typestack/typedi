import {Service} from "../../src/typedi";

@Service()
export class Bus {

    drive(): void {
        console.log("Im driving the bus");
    }

}