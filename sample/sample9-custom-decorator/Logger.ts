import {Container} from "../../src/Container";
import {ConsoleLogger} from "./ConsoleLogger";

export function Logger() {
    return function(object: Object, propertyName: string, index?: number) {
        const logger = new ConsoleLogger();
        Container.registerHandler({ object, propertyName, index, value: () => logger });
    };
}