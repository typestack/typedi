import {Container} from "../../src/Container";
import {CoffeeMaker} from "./CoffeeMaker";

let coffeeMaker = Container.get<CoffeeMaker>(CoffeeMaker);
console.log(coffeeMaker);
coffeeMaker.make();