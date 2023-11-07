export class Token {
  constructor(context, _opts) {
    let opts = _opts || {};
    let name = opts.name;

    if (!context)
      throw new TypeError('Token: "context" argument required.');

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
        value:        [],
      },
      'capturedValue': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        opts.capturedValue,
      },
      'capturedRange': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        opts.capturedRange || context.range.clone(),
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
        value:        matchedRange,
      },
      'range': {
        enumerable:   false,
        configurable: true,
        get:          () => this.matchedRange,
        set:          (value) => {
          this.matchedRange = value;
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
        enumerable:   false,
        configurable: true,
        get:          () => this.capturedValue,
        set:          (value) => {
          this.capturedValue = value;
        },
      },
      'offset': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        matchedRange.start,
      },
      'attributes': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        new Map(),
      },
    });
  }

  fetchProp(context, keyName) {
    let fetchableProps = {
      '$default':       this.value,
      'name':           this.name,
      'value':          this.value,
      'captured_value': this.capturedValue,
      'captured_range': this.capturedRange,
      'matched_value':  this.matchedValue,
      'matched_range':  this.matchedRange,
      'offset':         this.offset,
      'children_count': this.children.length,
    };

    if (!Object.prototype.hasOwnProperty.call(fetchableProps, keyName))
      return;

    return fetchableProps[keyName];
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
      ...this._options,
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
