import {Inject} from "../../src/index";
import {BeanFactory} from "./BeanFactory";
import {SugarFactory} from "./SugarFactory";
import {WaterFactory} from "./WaterFactory";

export class CoffeeMaker {

    @Inject()
    beanFactory: BeanFactory;

    @Inject()
    sugarFactory: SugarFactory;

    @Inject()
    waterFactory: WaterFactory;

    make() {
        this.beanFactory.create();
        this.sugarFactory.create();
        this.waterFactory.create();

        console.log("coffee is made");
    }

}