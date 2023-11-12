import { CustomScope } from './custom-scope.js';

export class Token {
  constructor(context, _opts) {
    let opts          = _opts || {};
    let name          = opts.name;
    let proxyChildren = opts.proxyChildren || false;

    if (!context)
      throw new TypeError('Token: "context" argument required.');

    const safeClone = (value) => {
      if (value && typeof value.clone === 'function')
        return value.clone();

      return value;
    };

    let matchedRange = opts.matchedRange || context.range.clone();

    Object.defineProperties(this, {
      [Symbol.for('/adextopa/types/type')]: {
        writable:     false,
        enumerable:   false,
        configurable: false,
        value:        'Token',
      },
      '_options': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        opts,
      },
      'proxyChildren': {
        enumerable:   false,
        configurable: true,
        get:          () => {
          return proxyChildren;
        },
        set:          (value) => {
          proxyChildren = !!value;
        },
      },
      'context': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        context,
      },
      'parent': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        opts.parent || null,
      },
      'children': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        (opts.children || []).map((token) => token.clone(context)),
      },
      'capturedValue': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        safeClone((opts.capturedValue == null) ? opts.value : opts.capturedValue),
      },
      'capturedRange': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        safeClone(opts.capturedRange || context.range.clone()),
      },
      'matchedValue': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        opts.matchedValue,
      },
      'matchedRange': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        safeClone(matchedRange),
      },
      'range': {
        enumerable:   false,
        configurable: true,
        get:          () => this.matchedRange,
        set:          (value) => {
          this.matchedRange = safeClone(value);
        },
      },
      'name': {
        enumerable:   false,
        configurable: true,
        get:          () => name || this.constructor.name,
        set:          (_name) => {
          name = _name;
        },
      },
      'value': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        (opts.value == null) ? opts.capturedValue : opts.value,
      },
      'offset': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        (opts.offset == null) ? matchedRange.start : opts.offset,
      },
      'attributes': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        new CustomScope(opts.attributes),
      },
    });

    // Clear any prototype we might not want
    // around (i.e. another Token)
    opts = Object.assign(Object.create(null), opts);
  }

  getOptions() {
    return this._options;
  }

  isProxy(set) {
    if (arguments.length === 0)
      return this.proxyChildren;

    this.proxyChildren = !!set;

    return this;
  }

  clone(context, props) {
    return new this.constructor(
      context,
      Object.assign(Object.create(this), props || {}),
    );
  }

  fetchProp(context, keyName, opts) {
    let fetchableProps = {
      '$default':       () => this.value,
      'name':           () => this.name,
      'value':          () => this.value,
      'captured_value': () => this.capturedValue,
      'captured_range': () => this.capturedRange.clone(),
      'matched_value':  () => this.matchedValue,
      'matched_range':  () => this.matchedRange.clone(),
      'offset':         () => this.offset,
      'children_count': () => this.children.length,
      'attributes':     () => this.attributes,
    };

    if (Object.prototype.hasOwnProperty.call(fetchableProps, keyName))
      return fetchableProps[keyName]();

    return (opts && opts.defaultValue);
  }

  updateValueFromRange(source) {
    this.value = source.substring(this.capturedRange.start, this.capturedRange.end);
    return this;
  }

  updateCapturedValueFromRange(source) {
    this.capturedValue = source.substring(this.capturedRange.start, this.capturedRange.end);
    return this;
  }

  updateMatchedValueFromRange(source) {
    this.matchedValue = source.substring(this.matchedRange.start, this.matchedRange.end);
    return this;
  }

  [Symbol.for('nodejs.util.inspect.custom')]() {
    return {
      ...this.toJSON(),
      $type: Token,
    };
  }

  toJSON() {
    return {
      ...this.getOptions(),
      name:          this.name,
      parent:        (this.parent) ? { $ref: '0#' } : null,
      value:         this.value,
      capturedRange: this.capturedRange,
      capturedValue: this.capturedValue,
      matchedRange:  this.matchedRange,
      matchedValue:  this.matchedValue,
      children:      this.children,
    };
  }
}
