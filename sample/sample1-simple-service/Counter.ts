export class Counter {
  private counter = 0;

  increase() {
    this.counter++;
  }

  getCount(): number {
    return this.counter;
  }
}
