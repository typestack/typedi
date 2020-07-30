import { Service } from '../../src/index';

@Service()
export class FakeBus {
  drive(): void {
    console.log('This is a fake bus. Im driving fake bus');
  }
}
