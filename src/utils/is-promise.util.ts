/**
 * Returns true if the passed value is a Promise like object or false otherwise.
 */
export function isPromise<T>(value: unknown): value is Promise<T> {
  return value !== null && typeof value === 'object' && typeof (value as any).then === 'function';
}
