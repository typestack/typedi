import {Service} from "../../src/typedi";
import {Factory} from "./Factory";

@Service("body.factory")
export class BodyFactory implements Factory {

    color: number;

    create(): void {
        console.log("body with color " + this.color + " is created");
    }

}