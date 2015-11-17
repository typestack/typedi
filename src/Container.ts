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

    private static instances: Instance[] = [];
    private static customParamHandlers: CustomParamHandler[] = [];
    private static defaultParameters: { type: Function, params: any[] }[] = [];

    // -------------------------------------------------------------------------
    // Public Static Methods
    // -------------------------------------------------------------------------

    static registerCustomParamHandler(paramHandler: CustomParamHandler) {
        this.customParamHandlers.push(paramHandler);
    }

    static registerDefaultInitializationParameter(type: Function, params?: any[]) {
        this.defaultParameters.push({ type: type, params: params });
    }

    static get<T>(type: Function, params?: any[]): T {
        let obj = this.findInstanceOfType(type);
        if (obj)
            return <T> obj;

        if (!params) {
            let defaultParams = this.defaultParameters.reduce((found, i) => i.type === type ? i : found, undefined);
            if (defaultParams)
                params = defaultParams.params;
        }

        if (params) {
            params = this.mapParams(type, params);
            params.unshift(null);
        }

        var objectInstance = new (type.bind.apply(type, params))();
        this.instances.push({ type: type, instance: objectInstance });
        return objectInstance;
    }

    static set(type: Function, value: any) {
        this.instances.push({ type: type, instance: value });
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

            if (this.isParamValid(param))
                return Container.get(param);

            return undefined;
        });
    }

    private static isParamValid(param: any) {
        const ignoredTypes = ['string', 'boolean', 'number', 'object'];
        if (param && param.name && ignoredTypes.indexOf(param.name.toLowerCase()) !== -1)
            return false;

        return true;
    }

}