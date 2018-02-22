class BeanFactory {

    create() {
        console.log("bean created");
    }

}

module.exports = { BeanFactory: BeanFactory };