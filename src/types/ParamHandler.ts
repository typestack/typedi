/**
 * Storage value to be injected into constructor parameter.
 */
export interface ParamHandler {
    type: Function;
    index: number;
    getValue: () => any;
}