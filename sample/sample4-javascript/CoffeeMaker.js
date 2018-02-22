import {BeanFactory} from "./BeanFactory";
import {SugarFactory} from "./SugarFactory";
import {WaterFactory} from "./WaterFactory";

export class CoffeeMaker {

    constructor(container) {
        this.beanFactory  = container.get(BeanFactory);
        this.sugarFactory = container.get(SugarFactory);
        this.waterFactory = container.get(WaterFactory);
        this.authorizationToken = container.get("authorizationToken");
    }

    make() {
        this.beanFactory.create();
        this.sugarFactory.create();
        this.waterFactory.create();

        console.log("coffee is made. Authorization token: " + this.authorizationToken);
    }

}