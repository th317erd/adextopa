import * as Utils from './utils.js';

export const TypeBase = Utils.makeKeysNonEnumerable(class TypeBase {

  constructor(options) {
    Object.defineProperties(this, {
      // [Utils.TYPE_SYMBOL]: {
      //   enumerable:   false,
      //   configurable: false,
      //   get:          () => this.constructor[Utils.TYPE_SYMBOL],
      // },
      'options': {
        writable:     true,
        enumerable:   true,
        configurable: true,
        value:        Object.assign(Object.create(null), options || {}), // Clear prototype and copy
      },
    });
  }

  [Symbol.toStringTag]() {
    return (this.constructor || this).name;
  }

  getOptions() {
    return this.options;
  }

  clone(options) {
    return new this.constructor({
      ...this.getOptions(),
      ...(options || {}),
    });
  }

  valueOf() {
    return this;
  }

  safeClone(item, options) {
    if (item && typeof item.clone === 'function')
      return item.clone(options);

    return item;
  }

  dynamicProperties() {
    return {};
  }

  get(key, defaultValue) {
    let dynamicProperties = this.dynamicProperties();
    if (Object.prototype.hasOwnProperty.call(dynamicProperties, key))
      return dynamicProperties[key]();

    return defaultValue;
  }

  fetch(path, defaultValue) {
    return Utils.fetch.call(this, path, defaultValue);
  }

  toJSON() {
    return {
      $type: Utils.typeOf(this),
    };
  }
});
