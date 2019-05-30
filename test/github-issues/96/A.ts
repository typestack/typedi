import { Service } from "../../../src";
import { B } from "./B";

@Service()
export class A {
  constructor(public b: B) {
  }
}

@Service()
export class C {
}
