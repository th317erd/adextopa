import * as Utils       from './utils.js';
import { TypeBase }     from './type-base.js';
import { SourceRange }  from './source-range.js';
import { ParserContext } from './parser-context.js';

export const Token = Utils.makeKeysNonEnumerable(class Token extends TypeBase {
  static [Utils.TYPE_SYMBOL] = 'Token';

  constructor(context, parent, _properties) {
    let properties = _properties || {};

    super(properties);

    let name = properties.name;

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
      'proxyChildren': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        properties.proxyChildren || false,
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
        value:        (properties.value == null) ? null : properties.value,
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
        value:        new SourceRange(properties.capturedRange || (parent && parent.capturedRange)) || new SourceRange(context.parserRange.start, context.parserRange.end),
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
        value:        new SourceRange(properties.matchedRange || (parent && parent.matchedRange)) || new SourceRange(context.parserRange.start, context.parserRange.end),
      },
      'children': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        (properties.children || []).map((item) => this.safeClone(item, context, this)),
      },
    });
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
      'name':           () => this.name,
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

  toJSON() {
    return {
      ...this.getOptions(),
      $type:          Utils.typeOf(this),
      name:           this.name,
      // TODO: Need proper JSON Property path to parent
      parent:         (this.parent) ? { $ref: '0#' } : null,
      value:          this.value,
      capturedValue:  this.capturedValue,
      matchedValue:   this.matchedValue,
      capturedRange:  this.capturedRange.toJSON(),
      matchedRange:   this.matchedRange.toJSON(),
      children:       this.children,
      proxyChildren:  this.proxyChildren,
    };
  }
});
