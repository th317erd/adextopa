import * as Utils       from './utils.js';
import { SourceRange }  from './source-range.js';
import { Attributable } from './attributable.js';

export const Token = Utils.makeKeysNonEnumerable(class Token extends Attributable {
  static [Utils.TYPE_SYMBOL] = 'Token';

  constructor(context, parent, _options) {
    let options = _options || {};

    super(options);

    Object.defineProperties(this, {
      'context': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        context || null,
      },
      'parent': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        parent || null,
      },
      'value': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        (options.value == null) ? null : options.value,
      },
      'capturedValue': {
        enumerable:   false,
        configurable: true,
        get:          () => this.context.getInputStream().slice(this.capturedRange),
      },
      'capturedRange': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        new SourceRange(options.capturedRange || (parent && parent.capturedRange)) || new SourceRange(context.parserRange.start, context.parserRange.end),
      },
      'matchedValue': {
        enumerable:   false,
        configurable: true,
        get:          () => this.context.getInputStream().slice(this.matchedRange),
      },
      'matchedRange': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        new SourceRange(options.matchedRange || (parent && parent.matchedRange)) || new SourceRange(context.parserRange.start, context.parserRange.end),
      },
      'children': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        (options.children || []).map((item) => this.safeClone(item, context, this)),
      },
    });

    if (!Utils.isType(this.getAttribute('proxyChildren'), 'Boolean'))
      this.setAttribute('proxyChildren', false);
  }

  proxyChildren(set) {
    if (arguments.length === 0)
      return !!this.getAttribute('proxyChildren');

    this.setAttribute('proxyChildren', !!set);

    return this;
  }

  addChild(token, updateRange) {
    token.parent = this;

    this.children.push(token);

    if (updateRange !== false) {
      this.capturedRange.expandTo(token.capturedRange);
      this.matchedRange.expandTo(token.matchedRange);
    }

    return this;
  }

  getRangeBounds(rangeName) {
    let children  = this.children || [];
    let smallest  = Infinity;
    let largest   = -Infinity;

    for (let i = 0, il = children.length; i < il; i++) {
      let token = children[i];
      if (!token)
        continue;

      let range = token[rangeName];
      if (!range)
        continue;

      if (range.start < smallest)
        smallest = range.start;

      if (range.end > largest)
        largest = range.end;
    }

    if (Object.is(smallest, Infinity))
      smallest = 0;

    if (Object.is(largest, -Infinity))
      largest = 0;

    if (smallest > largest) {
      let temp = smallest;
      smallest = largest;
      largest = temp;
    }

    return new SourceRange(smallest, largest);
  }

  getCapturedRangeBounds(tokens) {
    return this.getRangeBounds('capturedRange', tokens);
  }

  getMatchedRangeBounds(tokens) {
    return this.getRangeBounds('matchedRange', tokens);
  }

  clone(context, parent, properties) {
    return new this.constructor(
      context || this.context,
      parent || this.parent,
      // Stack an object on top of "this".
      // This way, any properties not
      // provided will be provided by
      // "this" underlying token.
      Object.assign(
        Object.create(null),
        this.toJSON(),
        properties || {},
        { $type: undefined },
      ),
    );
  }

  [Symbol.toPrimitive](hint) {
    if (hint === 'number')
      return this.matchedRange.start;
    else if (hint === 'string')
      return this.toString.call(this);

    return this.valueOf.call(this, hint);
  }

  toString() {
    return this.value;
  }

  valueOf() {
    return this;
  }

  dynamicProperties() {
    return {
      'name':           () => this.getName(),
      'value':          () => this.value,
      'capturedValue':  () => this.capturedValue,
      'capturedRange':  () => this.capturedRange.clone(),
      'matchedValue':   () => this.matchedValue,
      'matchedRange':   () => this.matchedRange.clone(),
      'childrenCount':  () => this.children.length,
    };
  }

  [Symbol.for('nodejs.util.inspect.custom')]() {
    return this.toJSON();
  }

  toJSON(...args) {
    return {
      ...super.toJSON(...args),
      // TODO: Need proper JSON Property path to parent
      parent:         (this.parent) ? { $ref: '0#' } : null,
      value:          this.value,
      capturedValue:  this.capturedValue,
      matchedValue:   this.matchedValue,
      capturedRange:  this.capturedRange.toJSON(),
      matchedRange:   this.matchedRange.toJSON(),
      children:       this.children,
    };
  }
});
