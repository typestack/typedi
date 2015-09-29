/// <reference path="../node_modules/reflect-metadata/reflect-metadata.d.ts" />
import 'reflect-metadata';

export interface Instance {
    type: Function;
    instance: Object;
}

export interface RequiredParam {
    type: Function;
    index: number;
    packageName: string;
}

export class Container {

    // -------------------------------------------------------------------------
    // Static Properties
    // -------------------------------------------------------------------------

    static instances: Instance[] = [];
    static requireParams: RequiredParam[] = [];

    // -------------------------------------------------------------------------
    // Public Static Methods
    // -------------------------------------------------------------------------

    static registerRequireParam(cls: Function, index: number, packageName: string) {
        this.requireParams.push({ type: cls, index: index, packageName: packageName });
    }

    static get(type: Function, params?: any[]):any {
        let obj = this.findInstanceOfType(type);
        if (obj) return obj;

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

    private static findInstanceOfType(type: Function): Instance {
        return this.instances.reduce((found, typeInstance) => typeInstance.type === type ? typeInstance.instance : found, null);
    }

    private static findRequireParams(type: Function, index: number): RequiredParam {
        return this.requireParams.reduce((found, param) => param.type === type && param.index === index ? param : found, null);
    }

    private static mapParams(type: Function, params: any[]): any[] {
        return params.map((param, key) => {
            let requireParam = this.findRequireParams(type, key);
            if (requireParam)
                return require(requireParam.packageName);

            return Container.get(param, Reflect.getMetadata('design:paramtypes', param));
        });
    }

}
