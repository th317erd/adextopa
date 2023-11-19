import * as Utils from './utils.js';
import { TypeBase } from './type-base.js';

export class Attributable extends TypeBase {
  constructor(_options) {
    let options = _options || {};

    super(options);

    Object.defineProperties(this, {
      'hasCustomName': {
        enumerable:   false,
        configurable: true,
        get:          () => (this.getName() !== this.constructor.name),
      },
      'attributes': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        new Map(),
      },
    });

    this.setAttribute('name', options.name || this.constructor.name);

    Utils.iterate(options.attributes, (key, value) => {
      this.setAttribute(key, value);
    });
  }

  clone(options) {
    return new this.constructor(Object.assign(
      Object.create(null),
      this.getOptions(),
      options || {},
      {
        attributes: Utils.assign({}, this.attributes, (options || {}).attributes),
      },
    ));
  }

  getAttribute(name) {
    return this.attributes.get(name);
  }

  setAttribute(name, value) {
    this.attributes.set(name, value);
    return this;
  }

  getName() {
    return this.getAttribute('name');
  }

  get(key, defaultValue) {
    if (this.attributes.has(key)) {
      let value = this.getAttribute(key);
      return (value == null) ? defaultValue : value;
    }

    return super.get(key, defaultValue);
  }

  attributesToObject() {
    let obj = {};

    for (let key of this.attributes.keys()) {
      let value = this.getAttribute(key);
      obj[key] = value;
    }

    return obj;
  }

  toJSON(...args) {
    let attributes  = this.attributesToObject();
    let result      = {
      ...super.toJSON(...args),
    };

    if (Utils.sizeOf(attributes) > 0)
      result.attributes = attributes;

    return result;
  }

  // Attribute accessors
  name(value) {
    if (Utils.noe(value))
      throw new Error('Value can not be empty for "name" attribute.');

    this.setAttribute('name', value);

    return this;
  }
}
