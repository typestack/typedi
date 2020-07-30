import 'reflect-metadata';
import * as fs from 'fs';
import { Container } from '../../src';
import { FileReader } from './FileReader';

Container.set('fs', fs);

Container.get(FileReader)
  .read(__dirname + '/text.txt')
  .then(data => console.log(data.toString()));
