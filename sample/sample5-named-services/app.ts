import {Container} from "../../src/Container";
import {CarFactory} from "./CarFactory";
import {EngineFactory} from "./EngineFactory";
import {BodyFactory} from "./BodyFactory";
import {WheelFactory} from "./WheelFactory";

// first you need to require all services you want to register
require('./CarFactory');
require('./EngineFactory');
require('./BodyFactory');
require('./WheelFactory');

// setup services

let bodyFactory = Container.get<BodyFactory>('body.factory');
bodyFactory.color = 333;

let wheelFactory = Container.get<WheelFactory>('wheel.factory');
wheelFactory.size = 20;

let engineFactory = Container.get<EngineFactory>('engine.factory');
engineFactory.setSeries('3000');

// create a car using car factory

let carFactory = Container.get<CarFactory>('car.factory');
carFactory.create();