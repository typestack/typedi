export interface ParamHandler {
    type: Function;
    index: number;
    getValue: () => any;
}

export interface PropertyHandler {
    target: Function;
    key: string;
    getValue: () => any;
}
