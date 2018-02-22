var Container = require("../../build/compiled/src/index").Container;
var CoffeeMaker = require("./CoffeeMaker").CoffeeMaker;

Container.of("my-container").set("authorizationToken", "!@#$%^&*");
let coffeeMaker = Container.of("my-container").get(CoffeeMaker);
console.log(coffeeMaker);
coffeeMaker.make();