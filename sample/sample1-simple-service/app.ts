import {Container} from "../../src/Container";
import {CarFactory} from "./CarFactory";
import {Counter} from "./Counter";

let carFactory = Container.get<CarFactory>(CarFactory);
carFactory.create();

let counter = Container.get<Counter>(Counter);
counter.increase();
counter.increase();
counter.increase();
console.log(counter.getCount());