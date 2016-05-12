import {Service} from "../../src/index";

@Service()
export class FakeCar {

    drive(): void {
        console.log("This is a fake car. Im driving fake car");
    }

}