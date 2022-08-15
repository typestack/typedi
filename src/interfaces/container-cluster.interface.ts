import { ContainerInstanceInterface } from './container-instance.interface';

export interface ContainerClusterInterface extends ContainerInstanceInterface {
  is(container: ContainerInstanceInterface): boolean;
  addContainer(container: ContainerInstanceInterface): void;
  removeContainer(container: ContainerInstanceInterface): void;
}
