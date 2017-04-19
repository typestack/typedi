import {Car} from "./Car";

export function carFactory() {
    return new Car("BMW", "v12", 6);
}