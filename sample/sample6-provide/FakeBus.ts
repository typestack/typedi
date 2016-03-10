import {Service} from "../../src/typedi";

@Service()
export class FakeBus {

    drive(): void {
        console.log("This is a fake bus. Im driving fake bus");
    }

}