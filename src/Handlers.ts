/**
 * Storage value to be injected into constructor parameter.
 */
export interface ParamHandler {
    type: Function;
    index: number;
    getValue: () => any;
}

/**
 * Storage value to be injected into class property.
 */
export interface PropertyHandler {
    target: Function;
    key: string;
    getValue: () => any;
}
