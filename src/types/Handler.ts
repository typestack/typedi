export interface Handler {

    target: Function;
    propertyName?: string;
    index?: number;
    getValue: () => any;

}