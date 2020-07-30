import 'reflect-metadata';
import { Container } from '../../src/index';
import { FactoryToken } from './FactoryToken';
import { SugarFactory } from './SugarFactory';
import { WaterFactory } from './WaterFactory';
import { BeanFactory } from './BeanFactory';

Container.import([BeanFactory, SugarFactory, WaterFactory]);
const factories = Container.getMany(FactoryToken);
factories.forEach(factory => factory.create());
console.log(factories);
