import { LoggerInterface } from './LoggerInterface';

export class ConsoleLogger implements LoggerInterface {
  log(message: string) {
    console.log(message);
  }
}
