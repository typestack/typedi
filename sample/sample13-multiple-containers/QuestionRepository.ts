import { Service } from '../../src/decorators/Service';

@Service()
export class QuestionRepository {
  userName: string;

  save() {
    console.log(`saving question. author is ${this.userName}`);
  }
}
