import {Service} from "../../src/index";
import {Driver} from "../sample7-inherited-properties/Driver";
import {Inject} from "../../src/decorators";
import {Engine} from "../sample7-inherited-properties/Engine";

@Service()
export abstract class Car {

    @Inject(type => Driver)
    driver: Driver;

    @Inject(type => Engine)
    engine: Engine;

    year = 2016;

    abstract drive(): void;

}