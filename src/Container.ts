import 'reflect-metadata';

export interface Instance {
    type: Function;
    instance: Object;
}

export interface CustomParamHandler {
    type: Function;
    index: number;
    getValue: () => any;
}

export class Container {

    // -------------------------------------------------------------------------
    // Static Properties
    // -------------------------------------------------------------------------

    static instances: Instance[] = [];
    static customParamHandlers: CustomParamHandler[] = [];

    // -------------------------------------------------------------------------
    // Public Static Methods
    // -------------------------------------------------------------------------

    static registerCustomParamHandler(paramHandler: CustomParamHandler) {
        this.customParamHandlers.push(paramHandler);
    }

    static get<T>(type: Function, params?: any[]): T {
        let obj = this.findInstanceOfType(type);
        if (obj)
            return <T> obj;

        if (params) {
            params = this.mapParams(type, params);
            params.unshift(null);
        }

        var objectInstance = new (type.bind.apply(type, params))();
        this.instances.push({ type: type, instance: objectInstance });
        return objectInstance;
    }

    // -------------------------------------------------------------------------
    // Private Static Methods
    // -------------------------------------------------------------------------

    private static findInstanceOfType(type: Function): Object {
        return this.instances.reduce((found, typeInstance) => typeInstance.type === type ? typeInstance.instance : found, null);
    }

    private static findCustomParamHandler(type: Function, index: number): CustomParamHandler {
        return this.customParamHandlers.reduce((found, param) => param.type === type && param.index === index ? param : found, null);
    }

    private static mapParams(type: Function, params: any[]): any[] {
        return params.map((param, key) => {
            let paramHandler = this.findCustomParamHandler(type, key);
            if (paramHandler)
                return paramHandler.getValue();

            return Container.get(param, Reflect.getMetadata('design:paramtypes', param));
        });
    }

}