import 'reflect-metadata';
import { Container } from '../src/container.class';
import { ContainerInstance } from '../src/container-instance.class';
import { Token } from '../src/token.class';
import { ServiceNotFoundError } from '../src/error/service-not-found.error';

/**
 * Covers the registry operations that back `Container.get`: registration,
 * overwriting, multi-service registration, removal and both reset strategies.
 *
 * `has` and `reset({ strategy: 'resetServices' })` were previously uncovered.
 */
describe('service registry', function () {
  beforeEach(() => Container.reset());

  describe('has', () => {
    it('should report a registered identifier', () => {
      class TestService {}
      Container.set({ id: TestService, type: TestService, global: true });

      expect(Container.has(TestService)).toBe(true);
    });

    it('should report an unregistered identifier', () => {
      class UnregisteredService {}

      expect(Container.has(UnregisteredService)).toBe(false);
    });

    it('should report a removed identifier as absent', () => {
      class TestService {}
      Container.set({ id: TestService, type: TestService, global: true });
      Container.remove(TestService);

      expect(Container.has(TestService)).toBe(false);
    });
  });

  describe('set', () => {
    it('should overwrite an existing registration without duplicating it', () => {
      const token = new Token<Record<string, boolean>>('overwritten-service');
      Container.set({ id: token, value: { overridden: false }, global: true });
      Container.set({ id: token, value: { overridden: true }, global: true });

      expect(Container.get(token)).toEqual({ overridden: true });
      expect(Container.getMany(token)).toHaveLength(1);
    });

    it('should keep every service registered with multiple, in insertion order', () => {
      const token = new Token<string>('multiple-services');
      Container.set({ id: token, value: 'first', multiple: true, global: true });
      Container.set({ id: token, value: 'second', multiple: true, global: true });
      Container.set({ id: token, value: 'third', multiple: true, global: true });

      expect(Container.getMany(token)).toEqual(['first', 'second', 'third']);
      expect(Container.get(token)).toBe('first');
    });
  });

  describe('remove', () => {
    it('should remove every service sharing an identifier', () => {
      const token = new Token<string>('multiple-services');
      Container.set({ id: token, value: 'first', multiple: true, global: true });
      Container.set({ id: token, value: 'second', multiple: true, global: true });
      Container.remove(token);

      expect(Container.has(token)).toBe(false);
      expect(Container.getMany(token)).toEqual([]);
    });

    it('should remove an array of identifiers', () => {
      class FirstService {}
      class SecondService {}
      Container.set({ id: FirstService, type: FirstService, global: true });
      Container.set({ id: SecondService, type: SecondService, global: true });
      Container.remove([FirstService, SecondService]);

      expect(Container.has(FirstService)).toBe(false);
      expect(Container.has(SecondService)).toBe(false);
    });

    it('should allow an identifier to be registered again after removal', () => {
      const token = new Token<Record<string, boolean>>('revived-service');
      Container.set({ id: token, value: { revived: false }, global: true });
      Container.remove(token);
      Container.set({ id: token, value: { revived: true }, global: true });

      expect(Container.get(token)).toEqual({ revived: true });
      expect(Container.getMany(token)).toHaveLength(1);
    });
  });

  describe('reset', () => {
    it('should keep registrations when resetting values', () => {
      const container = Container.of('reset-value-container');
      class TestService {}
      container.set({ id: TestService, type: TestService });
      container.get(TestService);

      container.reset({ strategy: 'resetValue' });

      expect(container.has(TestService)).toBe(true);
      expect(container.get(TestService)).toBeInstanceOf(TestService);
    });

    it('should drop registrations when resetting services', () => {
      const container = Container.of('reset-services-container');
      class TestService {}
      const token = new Token<number>('multiple-services');
      container.set({ id: TestService, type: TestService });
      container.set({ id: token, value: 1, multiple: true });
      container.set({ id: token, value: 2, multiple: true });

      container.reset({ strategy: 'resetServices' });

      expect(container.has(TestService)).toBe(false);
      expect(container.has(token)).toBe(false);
      expect(() => container.get(TestService)).toThrow(ServiceNotFoundError);
    });

    it('should not leave stale entries behind after resetting services', () => {
      const container = Container.of('reset-services-reregister-container');
      const token = new Token<number>('reregistered-service');
      container.set({ id: token, value: 1, multiple: true });
      container.reset({ strategy: 'resetServices' });
      container.set({ id: token, value: 2, multiple: true });

      expect(container.getMany(token)).toEqual([2]);
    });

    it('should throw on an unknown reset strategy', () => {
      const container = new ContainerInstance('invalid-strategy-container');

      expect(() => container.reset({ strategy: 'nope' } as any)).toThrowError('Received invalid reset strategy.');
    });
  });
});
