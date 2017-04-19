export interface Handler {

    target: Object;
    propertyName?: string;
    index?: number;
    getValue: () => any;

}