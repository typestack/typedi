import {Container} from "../../src/typedi";
import {CoffeeMaker} from "./CoffeeMaker";

let coffeeMaker = Container.get<CoffeeMaker>(CoffeeMaker);
console.log(coffeeMaker);
coffeeMaker.make();