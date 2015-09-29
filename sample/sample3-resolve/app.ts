import {Container} from "../../src/Container";
import {CoffeeMaker} from "./CoffeeMaker";

let coffeeMaker = Container.get(CoffeeMaker);
console.log(coffeeMaker);
coffeeMaker.make();