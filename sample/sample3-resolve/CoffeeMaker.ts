import {Resolve} from "../../src/Resolve";
import {BeanFactory} from "./BeanFactory";
import {SugarFactory} from "./SugarFactory";
import {WaterFactory} from "./WaterFactory";

@Resolve()
export class CoffeeMaker {

    private beanFactory: BeanFactory;
    private sugarFactory: SugarFactory;
    private waterFactory: WaterFactory;

    constructor(beanFactory: BeanFactory, sugarFactory: SugarFactory, waterFactory: WaterFactory) {
        this.beanFactory = beanFactory;
        this.sugarFactory = sugarFactory;
        this.waterFactory = waterFactory;
    }

    make() {
        this.beanFactory.create();
        this.sugarFactory.create();
        this.waterFactory.create();

        console.log('coffee is made');
    }

}