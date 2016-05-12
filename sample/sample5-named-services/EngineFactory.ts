import {Service} from "../../src/index";
import {Factory} from "./Factory";

@Service("engine.factory")
export class EngineFactory implements Factory {

    private series: string = "0000";

    setSeries(series: string) {
        this.series = series;
    }

    getSeries(): string {
        return this.series;
    }

    create(): void {
        console.log("engine " + this.series + " is created");
    }

}