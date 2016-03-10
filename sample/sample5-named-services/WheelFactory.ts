import {Service} from "../../src/typedi";
import {Factory} from "./Factory";

@Service("wheel.factory")
export class WheelFactory implements Factory {

    size: number;

    create(): void {
        console.log("wheel with size " + this.size + " is created");
    }

}