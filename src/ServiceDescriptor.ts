
export type ObjectType<T> = { new (): T }|Function;

export interface ServiceDescriptor<T, K extends keyof T> {
  name?: string;
  type?: Function;
  factory?: [ObjectType<T>, K]|Function;
  params?: any[];
}