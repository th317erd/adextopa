import { TypeBase } from './type-base.js';
import * as Utils   from './utils.js';

export const Scope = Utils.makeKeysNonEnumerable(class Scope extends TypeBase {
  static [Symbol.for('/adextopa/types/type')] = 'Scope';

  constructor(parent, _options) {
    let options = _options || {};

    super(options);

    let data = new Map();

    Object.defineProperties(this, {
      'parent': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        parent || null,
      },
      'properties': {
        writable:     false,
        enumerable:   false,
        configurable: true,
        value:        data,
      },
    });

    this.assign(options.properties);
  }

  dynamicProperties() {
    return {
      'parent': () => this.parent,
    };
  }

  get(key, defaultValue) {
    let dynamicProperties = this.dynamicProperties();
    if (Object.prototype.hasOwnProperty.call(dynamicProperties, key))
      return dynamicProperties[key]();

    let value = this.properties.get(key);
    if (value == null) {
      if (this.parent && typeof this.parent.get === 'function')
        return this.parent.get(key, defaultValue);

      return defaultValue;
    }

    return value;
  }

  set(key, value) {
    let dynamicProperties = this.dynamicProperties();
    if (Object.prototype.hasOwnProperty.call(dynamicProperties, key))
      throw new Error(`Can not set property named "${key}" on scope. This property name is reserved.`);

    this.properties.set(key, value);

    return this;
  }

  assign(properties) {
    if (!properties)
      return this;

    let data = this.properties;
    if (typeof properties.entries === 'undefined') {
      let keys = Object.keys(properties);
      for (let i = 0, il = keys.length; i < il; i++) {
        let key = keys[i];
        let value = properties[key];

        data.set(key, value);
      }
    } else {
      for (let [ key, value ] of properties.entries())
        data.set(key, value);
    }

    return this;
  }

  fetch(path, defaultValue) {
    return Utils.fetch.call(this, path, defaultValue);
  }

  [Symbol.for('nodejs.util.inspect.custom')]() {
    return this.properties;
  }

  toJSON(_alreadyVisited) {
    let obj = Object.assign({}, super.toJSON(_alreadyVisited) || {});

    if (this.parent && Utils.isType(this.parent.toJSON, 'Function')) {
      let alreadyVisited = _alreadyVisited;
      if (!alreadyVisited)
        alreadyVisited = new Set();

      if (!alreadyVisited.has(this.parent)) {
        alreadyVisited.add(this.parent);
        obj = Object.assign(obj, this.parent.toJSON(alreadyVisited));
      }
    }

    for (let [ key, value ] of this.properties.entries()) {
      if (!Utils.isSerializable(value))
        continue;

      obj[key] = value;
    }

    return obj;
  }
});
