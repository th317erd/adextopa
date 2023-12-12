import { TypeBase } from './type-base.js';
import * as Utils   from './utils.js';

export const Scope = Utils.makeKeysNonEnumerable(class Scope extends TypeBase {
  static [Symbol.for('/adextopa/types/type')] = 'Scope';

  constructor(_options) {
    let options = _options || {};
    let {
      parent,
    } = options;

    super(options);

    let data = new Map();

    Object.defineProperties(this, {
      'parent': {
        writable:     true,
        enumerable:   true,
        configurable: true,
        value:        parent || null,
      },
      'properties': {
        writable:     true,
        enumerable:   true,
        configurable: true,
        value:        data,
      },
    });

    this.assign(options.properties, true);
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

  set(key, value, silentlyIgnoreBadSet) {
    let dynamicProperties = this.dynamicProperties();
    if (Object.prototype.hasOwnProperty.call(dynamicProperties, key)) {
      if (silentlyIgnoreBadSet)
        return this;

      throw new Error(`Can not set property named "${key}" on scope. This property name is reserved.`);
    }

    this.properties.set(key, value);

    return this;
  }

  assign(properties, silentlyIgnoreBadSet) {
    if (!properties)
      return this;

    if (typeof properties.entries === 'undefined') {
      let keys = Object.keys(properties);
      for (let i = 0, il = keys.length; i < il; i++) {
        let key   = keys[i];
        let value = properties[key];
        this.set(key, value, silentlyIgnoreBadSet);
      }
    } else {
      for (let [ key, value ] of properties.entries())
        this.set(key, value, silentlyIgnoreBadSet);
    }

    return this;
  }

  fetch(path, defaultValue) {
    return Utils.fetch.call(this, path, defaultValue);
  }

  [Symbol.for('nodejs.util.inspect.custom')]() {
    return this.properties;
  }

  propertiesToObject(_options) {
    let options = _options || {};
    let {
      onlySerializable,
      includeParents,
    } = options;

    let obj = Object.assign(Object.create(null), (this.parent && includeParents !== false && typeof this.parent.propertiesToObject === 'function') ? this.parent.propertiesToObject(options) : {});

    for (let key of this.properties.keys()) {
      let value = this.get(key);
      if (onlySerializable === true && !Utils.isSerializable(value))
        continue;

      obj[key] = value;
    }

    return obj;
  }

  toJSON(_alreadyVisited) {
    let obj = Object.assign(
      {},
      super.toJSON() || {},
      {
        properties: this.propertiesToObject({ onlySerializable: true }),
      },
    );

    return obj;
  }
});
