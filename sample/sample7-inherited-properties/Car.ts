import {Service} from "../../src/decorators/Service";
import {Inject} from "../../src/decorators/Inject";
import {Driver} from "./Driver";
import {Engine} from "./Engine";

@Service()
export abstract class Car {

    @Inject(type => Driver)
    driver: Driver;

    @Inject(type => Engine)
    engine: Engine;

    year = 2016;

    abstract drive(): void;

}