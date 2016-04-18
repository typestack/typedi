import {Container} from "../../src/typedi";
import {Driver} from "./Driver";
import {FakeBus} from "./FakeBus";
import {FakeCar} from "./FakeCar";
import {Bus} from "./Bus";
import {Car} from "./Car";

// provide fake implementations
Container.provide([
    { type: Bus, value: new FakeBus() },
    { type: Car, value: new FakeCar() }
]);

// drive!
let driver = Container.get(Driver);
driver.driveBus();
driver.driveCar();