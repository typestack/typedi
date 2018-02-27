# Changelog

## 0.7.1

* fixed the way how global services work

## 0.7.0

* added javascript support
* removed deprecated `@Require` decorator
* added support for transient services
* now service constructors cannot accept non-service arguments
* added `@InjectMany` decorator to support injection of "many" values
* fixed the way how global services work

## 0.6.1

* added `Container.has` method

## 0.6.0

* added multiple containers support
* added grouped (tagged) containers support
* removed `provide` method, use `set` method instead
* deprecated `Require` decorator. Use es6 imports instead or named services
* inherited classes don't need to be decorated with `@Service` decorator
* other small api changes
* now `Handler`'s `value` accepts a container which requests the value