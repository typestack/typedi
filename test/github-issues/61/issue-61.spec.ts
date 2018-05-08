import "reflect-metadata";
import {Container} from "../../../src/Container";
import {Service} from "../../../src/decorators/Service";

describe("github issues > #61 Scoped container creates new instance of service every time", function() {

    beforeEach(() => Container.reset());

    it("should work properly", function() {

        @Service()
        class Car {
            public serial = Math.random();
        }

        const fooContainer = Container.of("foo");
        const barContainer = Container.of("bar");

        const car1Serial = Container.get(Car).serial;
        const car2Serial = Container.get(Car).serial;

        const fooCar1Serial = fooContainer.get(Car).serial;
        const fooCar2Serial = fooContainer.get(Car).serial;

        const barCar1Serial = barContainer.get(Car).serial;
        const barCar2Serial = barContainer.get(Car).serial;

        car1Serial.should.be.equal(car2Serial);
        fooCar1Serial.should.be.equal(fooCar2Serial);
        barCar1Serial.should.be.equal(barCar2Serial);

        car1Serial.should.not.be.equal(fooCar1Serial);
        car1Serial.should.not.be.equal(barCar1Serial);
        fooCar1Serial.should.not.be.equal(barCar1Serial);
    });

});
