import {ContainerInstanceInterface} from "./container-instance.interface";

export interface ContainerClusterInterface extends ContainerInstanceInterface{
  addContainer(container: ContainerInstanceInterface): void
  removeContainer(container: ContainerInstanceInterface): void
}