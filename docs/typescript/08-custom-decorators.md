# Creating custom decorators

> **NOTE:** This page is a direct copy of the old documentation. It will be reworked.

You can create your own decorators which will inject your given values for your service dependencies. For example:

```ts
// Logger.ts
export function Logger() {
  return function (object: Object, propertyName: string, index?: number) {
    const logger = new ConsoleLogger();
    Container.registerHandler({ object, propertyName, index, value: containerInstance => logger });
  };
}

// LoggerInterface.ts
export interface LoggerInterface {
  log(message: string): void;
}

// ConsoleLogger.ts
import { LoggerInterface } from './LoggerInterface';

export class ConsoleLogger implements LoggerInterface {
  log(message: string) {
    console.log(message);
  }
}

// UserRepository.ts
@Service()
export class UserRepository {
  constructor(@Logger() private logger: LoggerInterface) {}

  save(user: User) {
    this.logger.log(`user ${user.firstName} ${user.secondName} has been saved.`);
  }
}
```
