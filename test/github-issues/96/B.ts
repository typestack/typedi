import { Service } from "../../../src";

// This is a circular import, not necessarily a circular reference.
import { C } from "./A";

// Here is what happens:
// A is imported
//   the A module has no exports initially
//   A imports B
//   B imports A, which still has no exports so C is undefined
//   B is defined and has metadata attached to it for :paramtypes for [undefined]
//   B is exported
// A imports B
// A is defined and has metadata for :paramtypes [B]
// A is exported
// C is exported
//
// Later when typedi resolves A, then B, then C it silently will fail to resolve C
// and B will end up with a null reference to C which can end up failing much later
// in your applications life-cycle with no early indication of how or why C is undefined.
@Service()
export class B {
  constructor(public c: C) {
  }
}
