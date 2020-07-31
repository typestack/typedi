import { Service } from '../../src/decorators/Service';
import { QuestionRepository } from './QuestionRepository';

@Service()
export class QuestionController {
  constructor(protected questionRepository: QuestionRepository) {}

  save(name: string) {
    if (name) this.questionRepository.userName = name;
    this.questionRepository.save();
  }
}
