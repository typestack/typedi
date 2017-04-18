import {ObjectType} from "./ObjectType";

export interface ServiceOptions<T, K extends keyof T> {
  name?: string;
  factory?: [ObjectType<T>, K]|((...params: any[]) => ObjectType<any>);
}