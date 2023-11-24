import * as Utils       from './utils.js';
import { SourceRange }  from './source-range.js';
import { Attributable } from './attributable.js';

export const Token = Utils.makeKeysNonEnumerable(class Token extends Attributable {

  constructor(_options) {
    let options = _options || {};
    let {
      context,
      parent,
    } = options;

    super(options);

    Object.defineProperties(this, {
      [Symbol.toPrimitive]: {
        writable:     true,
        enumerable:   true,
        configurable: true,
        value:        (hint) => {
          if (hint === 'number')
            return this.matchedRange.start;
          else if (hint === 'string' || hint === 'default')
            return this.toString.call(this);

          return this.valueOf.call(this, hint);
        },
      },
      'context': {
        writable:     true,
        enumerable:   true,
        configurable: true,
        value:        context || null,
      },
      'parent': {
        writable:     true,
        enumerable:   true,
        configurable: true,
        value:        parent || null,
      },
      'capturedValue': {
        enumerable:   false,
        configurable: true,
        get:          () => (this.context && this.context.getInputStream().slice(this.capturedRange)) || '',
      },
      'capturedRange': {
        writable:     true,
        enumerable:   true,
        configurable: true,
        value:        (options.capturedRange) ? this.safeClone(options.capturedRange) : new SourceRange({ start: (context && context.parserRange.start), end: (context && context.parserRange.start) }),
      },
      'matchedValue': {
        enumerable:   false,
        configurable: true,
        get:          () => (this.context && this.context.getInputStream().slice(this.matchedRange)) || '',
      },
      'matchedRange': {
        writable:     true,
        enumerable:   true,
        configurable: true,
        value:        (options.matchedRange) ? new SourceRange(options.matchedRange) : new SourceRange({ start: (context && context.parserRange.start), end: (context && context.parserRange.start) }),
      },
      'children': {
        writable:     true,
        enumerable:   true,
        configurable: true,
        value:        [],
      },
    });

    if (!Utils.isType(this.getAttribute('proxyChildren'), 'Boolean'))
      this.setAttribute('proxyChildren', false);

    if (options.children) {
      for (let child of options.children)
        this.addChild(this.safeClone(child, context, this));
    }
  }

  setDefaultAttributes(options) {
    this.setAttribute('value', (options.value == null) ? null : options.value);
    return super.setDefaultAttributes(options);
  }

  proxyChildren(set) {
    if (arguments.length === 0)
      return !!this.getAttribute('proxyChildren');

    this.setAttribute('proxyChildren', !!set);

    return this;
  }

  setParent(parent, updateRange) {
    if (this.parent === parent)
      return this;

    if (this.parent)
      this.parent.removeChild(this, updateRange);

    this.parent = parent;

    return this;
  }

  clearChildren() {
    for (let child of this.children)
      child.setParent(null);

    this.children = [];

    return this;
  }

  addChild(token, updateRange) {
    if (Utils.isType(token, 'Token', Token)) {
      token.setParent(this, updateRange);

      this.children.push(token);

      if (updateRange !== false) {
        this.capturedRange.expandTo(token.capturedRange);
        this.matchedRange.expandTo(token.matchedRange);
      }
    } else {
      this.children.push(token);
    }

    return this;
  }

  removeChild(token, updateRange) {
    let index = this.children.indexOf(token);
    if (index < 0)
      return this;

    this.children = this.children.filter((child) => {
      return (child !== token);
    });

    if (updateRange !== false)
      this.updateRangesToChildren();

    return this;
  }

  getRangeBounds(rangeName, _children) {
    let children  = _children || this.children || [];
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

    return new SourceRange({ start: smallest, end: largest });
  }

  getCapturedRangeBounds(children) {
    return this.getRangeBounds('capturedRange', children);
  }

  getMatchedRangeBounds(children) {
    return this.getRangeBounds('matchedRange', children);
  }

  updateCapturedRangeToChildren(children) {
    this.capturedRange = this.getCapturedRangeBounds(children);
    return this;
  }

  updateMatchedRangeToChildren(children) {
    this.matchedRange = this.getMatchedRangeBounds(children);
    return this;
  }

  updateRangesToChildren() {
    this.updateCapturedRangeToChildren();
    this.updateMatchedRangeToChildren();

    return this;
  }

  clone(options) {
    return super.clone({
      context:        this.context,
      parent:         this.parent,
      capturedRange:  this.capturedRange,
      matchedRange:   this.matchedRange,
      children:       this.children,
      ...(options || {}),
    });
  }

  toString() {
    let value = this.value();
    if (value == null)
      value = this.matchedValue;

    return value;
  }

  valueOf() {
    return this;
  }

  dynamicProperties() {
    return {
      '$type:String':       () => {
        let value = this.value();
        if (value == null)
          return this.matchedValue || '';

        return value;
      },
      '$type:Number':       () => this.matchedRange.start,
      '$type:SourceRange':  () => this.matchedRange.clone(),
      'name':               () => this.name(),
      'value':              () => this.value(),
      'capturedValue':      () => this.capturedValue,
      'capturedRange':      () => this.capturedRange.clone(),
      'capturedOffset':     () => this.capturedRange.start,
      'matchedValue':       () => this.matchedValue,
      'matchedRange':       () => this.matchedRange.clone(),
      'matchedOffset':      () => this.matchedRange.start,
      'childrenCount':      () => this.children.length,
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
      capturedValue:  this.capturedValue,
      matchedValue:   this.matchedValue,
      capturedRange:  this.capturedRange.toJSON(),
      matchedRange:   this.matchedRange.toJSON(),
      children:       this.children,
    };
  }

  // Attribute accessors
  value(value) {
    if (arguments.length === 0)
      return this.getAttribute('value');

    this.setAttribute('value', value);

    return this;
  }
});
