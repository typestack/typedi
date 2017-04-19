import "reflect-metadata";
import {Container} from "../../src/Container";
import {Car} from "./Car";

const car = Container.get(Car);
console.log(car);

