import {Require, Service} from "../../src/typedi";
import {BeanFactory} from "./BeanFactory";

@Service()
export class CoffeeMaker {

    private beanFactory: BeanFactory;
    private gulp: any;
    private typescript: any;

    constructor(beanFactory: BeanFactory,
                @Require("gulp") gulp: any,
                @Require("typescript") typescript: any) {

        this.beanFactory = beanFactory;
        this.gulp = gulp;
        this.typescript = typescript;
    }

    make() {
        this.beanFactory.create();
        console.log("coffee is made. here is a gulp plugin we required: ");
        console.log(this.gulp);
    }

}