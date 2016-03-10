import {Service} from "../../src/typedi";

@Service()
export class FakeCar {

    drive(): void {
        console.log("This is a fake car. Im driving fake car");
    }

}