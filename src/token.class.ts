/**
 * Used to create unique typed service identifier.
 * Useful when service has only interface, but don't have a class.
 */
/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
export class Token<T> {
  /**
   * @param name Token name, optional and only used for debugging purposes.
   */
  constructor(public name?: string) {}
}
