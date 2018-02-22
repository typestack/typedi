let BeanFactory = require("./BeanFactory").BeanFactory;
let SugarFactory = require("./SugarFactory").SugarFactory;
let WaterFactory = require("./WaterFactory").WaterFactory;

class CoffeeMaker {

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

module.exports = { CoffeeMaker: CoffeeMaker };