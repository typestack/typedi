import {ObjectType} from "./ObjectType";

export interface ServiceDescriptor<T, K extends keyof T> {
  name?: string;
  type?: Function;
  factory?: [ObjectType<T>, K]|Function;
  params?: any[];
}