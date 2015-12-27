import {Service, Inject} from "../../src/Decorators";
import {Factory} from "./Factory";

@Service('car.factory')
export class CarFactory {

    @Inject('wheel.factory')
    wheelFactory: Factory;

    constructor(@Inject('engine.factory') private engineFactory: Factory,
                @Inject('body.factory') private bodyFactory: Factory) {
    }

    create() {
        console.log('Creating a car:');
        this.engineFactory.create();
        this.bodyFactory.create();
        this.wheelFactory.create();
        console.log('car created');
    }

}