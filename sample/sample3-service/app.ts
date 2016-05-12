import "es6-shim";
import "reflect-metadata";
import {Container} from "../../src/index";
import {CoffeeMaker} from "./CoffeeMaker";

let coffeeMaker = Container.get(CoffeeMaker);
console.log(coffeeMaker);
coffeeMaker.make();