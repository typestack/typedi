# Changelog

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