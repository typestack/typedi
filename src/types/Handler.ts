export interface Handler {

    target: Function|Object;
    propertyName?: string;
    index?: number;
    getValue: () => any;

}