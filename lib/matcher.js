import * as Utils       from './utils.js';
import { TypeBase }     from './type-base.js';
import { SourceRange }  from './source-range.js';

export const Matcher = Utils.makeKeysNonEnumerable(class Matcher extends TypeBase {
  static [Utils.TYPE_SYMBOL] = 'Matcher';

  static isVirtualMatcher(value) {
    return (value && typeof value.isVirtual === 'function' && value.isVirtual() === true);
  }

  static isVirtual() {
    return Object.prototype.hasOwnProperty.call(this, Utils.VIRTUAL_RESOLVER);
  }

  static isConsuming() {
    return true;
  }

  static hasOwnScope() {
    return false;
  }

  static skipLogging() {
    return true;
  }

  isVirtual() {
    return this.constructor.isVirtual();
  }

  isConsuming() {
    return this.constructor.isConsuming();
  }

  hasOwnScope() {
    return this.constructor.hasOwnScope();
  }

  skipLogging(...names) {
    return this.constructor.skipLogging(...names);
  }

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

  async exec(matcherScope) {
    return matcherScope.context.failResult();
  }

  [Symbol.for('nodejs.util.inspect.custom')]() {
    return this.toJSON();
  }

  toJSON() {
    return {
      $type:          Utils.typeOf(this),
      name:           this.getName(),
      hasCustomName:  this.hasCustomName,
    };
  }

  createMatcherScope(context) {
    let matcherName   = ('' + context.resolveValue(this.getName()));
    let typeName      = ('' + this.constructor.name);
    let startOffset   = context.parserRange.start;
    let endOffset     = context.parserRange.end;
    let matcherRange  = new SourceRange(startOffset, endOffset);
    let parserRange   = context.getInputRange();

    let matcherScope = {
      thisMatcher: this,
      context,
      typeName,
      matcherName,
      startOffset,
      endOffset,
      matcherRange,
      parserRange,
    };

    return matcherScope;
  }

  // Attribute accessors
  name(value) {
    if (Utils.noe(value))
      throw new Error('Value can not be empty for "name" attribute.');

    this.setAttribute('name', value);

    return this;
  }
});
