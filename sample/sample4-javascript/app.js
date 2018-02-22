import "reflect-metadata";
import {Container} from "../../src/index";
import {CoffeeMaker} from "./CoffeeMaker";

Container.of("my-container").set("authorizationToken", "!@#$%^&*");
let coffeeMaker = Container.of("my-container").get(CoffeeMaker);
console.log(coffeeMaker);
coffeeMaker.make();