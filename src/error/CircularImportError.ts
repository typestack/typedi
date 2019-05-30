/**
 * Thrown when service is registered without type.
 */
export class CircularImportError extends Error {
  name = "CircularImportError";

  constructor(type: Function, index: number) {
      super(`The import at index ${index} for type [${type.name}] failed to resolve because it was undefined at the time of import. This is usually caused by a circular "import" relationship.`);
      Object.setPrototypeOf(this, CircularImportError.prototype);
  }

}
