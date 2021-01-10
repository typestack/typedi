import { Service } from '../../src/decorators/Service';
import { Logger } from './Logger';
import { LoggerInterface } from './LoggerInterface';
import { User } from './User';

@Service()
export class UserRepository {
  constructor(@Logger() private logger: LoggerInterface) {}

  save(user: User) {
    this.logger.log(`user ${user.firstName} ${user.secondName} has been saved.`);
  }
}
