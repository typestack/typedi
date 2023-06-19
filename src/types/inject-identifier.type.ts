import { ContainerInstance } from "../container-instance.class";
import { INJECTED_FACTORY } from "../type-stamps.const";
import { LazyReference } from "./lazy-reference.type";
import { ServiceIdentifier } from "./service-identifier.type";

export type InjectedFactoryGet<TReturn> = (container: ContainerInstance) => TReturn;

export interface InjectedFactory<T = unknown, TReturn = unknown> {
    [INJECTED_FACTORY]: true;
    get: InjectedFactoryGet<TReturn | InjectedFactory>;
    id: ServiceIdentifier<T>;
}

export type AnyInjectIdentifier = ServiceIdentifier | InjectedFactory | LazyReference<ServiceIdentifier | InjectedFactory>;