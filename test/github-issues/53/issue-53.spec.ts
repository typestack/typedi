import 'reflect-metadata';
import { Container } from '../../../src/Container';
import { Service } from '../../../src/decorators/Service';
import { Token } from '../../../src';

describe('github issues > #53 Token-based services are cached in the Global container even when fetched via a subcontainer', function () {
  beforeEach(() => Container.reset());

  it('should work properly', function () {
    @Service()
    class QuestionRepository {
      userName: string;

      save() {
        // console.log(`saving question. author is ${this.userName}`);
      }
    }

    const QuestionController = new Token<QuestionControllerImpl>('QCImpl');

    @Service({ id: QuestionController })
    class QuestionControllerImpl {
      constructor(protected questionRepository: QuestionRepository) {}

      save(name: string) {
        if (name) this.questionRepository.userName = name;
        this.questionRepository.save();
      }
    }

    const request1 = { param: 'Timber' };
    const controller1 = Container.of(request1).get(QuestionController);
    controller1.save('Timber');
    Container.reset(request1);

    const request2 = { param: 'Guest' };
    const controller2 = Container.of(request2).get(QuestionController);
    controller2.save('');
    Container.reset(request2);

    expect(controller1).not.toBe(controller2);
    expect(controller1).not.toBe(Container.get(QuestionController));
  });
});
