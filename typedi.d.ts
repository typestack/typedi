declare module 'typedi/Container' {
	/// <reference path="../node_modules/reflect-metadata/reflect-metadata.d.ts" />
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
	    static instances: Instance[];
	    static requireParams: RequiredParam[];
	    static registerRequireParam(cls: Function, index: number, packageName: string): void;
	    static get(type: Function, params?: any[]): any;
	    private static findInstanceOfType(type);
	    private static findRequireParams(type, index);
	    private static mapParams(type, params);
	}

}
declare module 'typedi/Inject' {
	/// <reference path="../node_modules/reflect-metadata/reflect-metadata.d.ts" />
	export function Inject(type?: Function): (target: any, key: string) => void;

}
declare module 'typedi/Require' {
	/// <reference path="../node_modules/reflect-metadata/reflect-metadata.d.ts" />
	export function Require(name: string): (target: Function, key: string, index: number) => void;

}
declare module 'typedi/Resolve' {
	/// <reference path="../node_modules/reflect-metadata/reflect-metadata.d.ts" />
	export function Resolve(): (target: Function) => void;

}
