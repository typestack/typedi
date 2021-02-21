# Changelog

## 0.11.0 [BREAKING] - [UNRELEASED]

### BREAKING CHANGES

#### Container.reset signature change

The `Container.reset` signature has changed. It's only possible to reset the current container instance, you are calling
the function on, so the first `containerId` parameter has been removed.

```ts
// Old format
Container.reset(myContainerId, { strategy: 'resetValue' });

// New format
MyContainer.reset({ strategy: 'resetValue' });
```

### Added

- added support for specifying Container ID as `Symbol`
- re-enabled throwing error when `reflect-metadata` is not imported

## 0.10.0 [BREAKING] - 2021.01.15

### BREAKING CHANGES

#### Container.remove signature change

The `Container.remove` method from now accepts one ID or an array of IDs.

```ts
// Old format
Container.remove(myServiceA, myServiceB);

// New format
Container.remove([myServiceA, myServiceB]);
```

#### Removed support for calling `Service([depA, depB], factory)`

This was an undocumented way of calling the `Service` function directly instead of using it as a decorator. This option
has been removed and the official supported way of achieving the same is with `Container.set`. Example:

```ts
const myToken = new Token('myToken');

Container.set(myToken, 'test-value');

// Old format:
const oldWayService = Service([myToken], function myFactory(myToken) {
  return myToken.toUpperCase();
});
const oldResult = Container.get(oldWayService);
// New format
const newWayService = Container.set({
  // ID can be anything, we use string for simplicity
  id: 'my-custom-service',
  factory: function myFactory(container) {
    return container.get(myToken).toUppserCase();
  },
});
const newResult = Container.get('my-custom-service');

oldResult === newResult; // -> true, both equals to "TEST-VALUE"
```

### Added

- added `eager` option to `ServiceOptions`, when enabled the class will be instantiated as soon as it's registered in the container
- added support for destroying removed services, when a service is removed and has a callable `destroy` property it will be called by TypeDI

### Changed

- [BREAKING] removed old, undocumented way of calling `@Service` decorator directly
- [BREAKING] renamed `MissingProvidedServiceTypeError` to `CannotInstantiateValueError`
- various internal refactors
- updated various dev dependencies

### Fixed

- generated sourcemaps contains the Typescript files preventing reference errors when using TypeDI with various build tools

## 0.9.1 - 2021.01.11

### Fixed

- correctly export error classes from package root

## 0.9.0 - 2021.01.10

### BREAKING CHANGES

#### Unregistered types are not resolved

Prior to this version when an unknown constructable type was requested from the default container it was added automatically
to the container and returned. This behavior has changed and now a `ServiceNotFoundError` error is thrown.

#### Changed container reset behavior

Until now resetting a container removed all dependency declarations from the container. From now on the default behavior
is to remove the created instances only but not the definitions. This means requesting a Service again from the container
won't result in a `ServiceNotFoundError` but will create a new instance of the requested function again.

The old behavior can be restored with passing the `{ strategy: 'resetServices'}` to the `ContainerInstance.reset` function.

### Changed

- **[BREAKING]** unknown values are not resolved anymore (ref #87)
- **[BREAKING]** resetting a container doesn't remove the service definitions only the created instances by default
- **[BREAKING]** container ID can be string only now
- default container ID changed from `undefined` to `default`
- stricter type definitions and assertions across the project
- updated the wording of `ServiceNotFoundError` to better explain which service is missing (#138)
- updated various dev-dependencies
- various changes to project tooling

### Fixed

- fixed a bug where requesting service with circular dependencies from a scoped container would result in Maximum call stack size exceeded error (ref #112)
- fixed a bug where `@Inject`-ed properties were not injected in inherited child classes (ref #102)
- fixed a typing issue which prevented using abstract class as service identifier (ref #144)
- fixed a bug which broke transient services when `Container.reset()` was called (ref #157)
- fixed some typos in the getting started documentation

## 0.8.0

- added new type of dependency injection - function DI
- now null can be stored in the container for values

## 0.7.2

- fixed bug with inherited services

## 0.7.1

- fixed the way how global services work

## 0.7.0

- added javascript support
- removed deprecated `@Require` decorator
- added support for transient services
- now service constructors cannot accept non-service arguments
- added `@InjectMany` decorator to support injection of "many" values
- fixed the way how global services work

## 0.6.1

- added `Container.has` method

## 0.6.0

- added multiple containers support
- added grouped (tagged) containers support
- removed `provide` method, use `set` method instead
- deprecated `Require` decorator. Use es6 imports instead or named services
- inherited classes don't need to be decorated with `@Service` decorator
- other small api changes
- now `Handler`'s `value` accepts a container which requests the value
