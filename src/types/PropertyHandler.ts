
/**
 * Storage value to be injected into class property.
 */
export interface PropertyHandler {
    target: Function;
    key: string;
    getValue: () => any;
}
