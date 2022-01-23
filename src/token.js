const { isType } = require('./utils');

// This will be set on first run, and remain static afterwords
var RESERVED_WORDS;

function defineProperties(props) {
  var keys = Object.keys(props);

  for (var i = 0, il = keys.length; i < il; i++) {
    var key         = keys[i];
    var value       = props[key];
    var enumerable  = true;

    if (value === undefined)
      continue;

    if (key.charAt(0) === '_') {
      key = key.substring(1);
      enumerable = false;
    }

    if (RESERVED_WORDS && RESERVED_WORDS.indexOf(key) >= 0)
      continue;

    Object.defineProperty(this, key, {
      writable:     true,
      configurable: true,
      enumerable,
      value,
    });
  }

  return this;
}

class Token {
  constructor(_parser, _sourceRange, props) {
    var parser      = _parser;
    var sourceRange = _sourceRange || null;

    var reservedProperties = {
      '_parser': {
        writable:     false,
        enumerable:   false,
        configurable: true,
        value:        parser,
      },
      '_sourceRange': {
        enumerable:   false,
        configurable: true,
        get: () =>    sourceRange,
        set: () =>    {}, // noop
      },
      '_raw': {
        enumerable:   false,
        configurable: true,
        get: () =>    (sourceRange && sourceRange.value),
        set: () =>    {}, // noop
      }
    };

    Object.defineProperties(this, reservedProperties);

    if (props) {
      if (!RESERVED_WORDS)
        RESERVED_WORDS = Object.keys(reservedProperties);

      this.defineProperties.call(this, props);
    }
  }

  clone(props, tokenClass) {
    var token = new (tokenClass || this.constructor)(
      this.getParser(),
      this.getSourceRange(),
      Object.assign({}, this, props),
    );

    token.remapTokenLinks();

    return token;
  }

  remapTokenLinks(newParent) {
    if (!this.children)
      return this;

    var previousSibling = null;
    this.children = (this.children || []).map((child) => {
      if (previousSibling) {
        Object.defineProperties(previousSibling, {
          'nextSibling': {
            writable:     true,
            enumerable:   false,
            configurable: true,
            value:        child,
          }
        });
      }

      Object.defineProperties(child, {
        'parent': {
          writable:     true,
          enumerable:   false,
          configurable: true,
          value:        newParent || this,
        },
        'previousSibling': {
          writable:     true,
          enumerable:   false,
          configurable: true,
          value:        previousSibling,
        },
        'nextSibling': {
          writable:     true,
          enumerable:   false,
          configurable: true,
          value:        null,
        }
      });

      previousSibling = child;

      return child;
    });

    return this;
  }

  defineProperties(props) {
    return defineProperties.call(this, props);
  }

  getParser() {
    return this._parser;
  }

  getSourceRange() {
    return this._sourceRange;
  }

  setSourceRange(sourceRange) {
    this._sourceRange.start = sourceRange.start;
    this._sourceRange.end = sourceRange.end;
    return this;
  }

  getRawValue() {
    return this._raw;
  }

  skipOutput() {
    return false;
  }

  getFirstChild() {
    if (!this.children || !this.children.length)
      return;

    return this.children[0];
  }

  setFirstChild(value) {
    if (!this.children)
      this.defineProperties({ children: [ value ] });
    else if (!this.children.length)
      this.children.push(value);
    else
      this.children[0] = value;

    return this;
  }

  getLastChild() {
    if (!this.children || !this.children.length)
      return;

    return this.children[this.children.length - 1];
  }

  setLastChild(value) {
    if (!this.children)
      this.defineProperties({ children: [ value ] });
    else if (!this.children.length)
      this.children.push(value);
    else
      this.children[this.children.length - 1] = value;

    return this;
  }

  visit(_pattern, _callback) {
    var callback  = _callback;
    var pattern   = _pattern;
    var results   = [];
    var finder;

    if (arguments.length < 1) {
      throw new TypeError('Token::visit: Arguments must be specified');
    } else if (arguments.length < 2) {
      callback = pattern;

      if (!isType(callback, 'function'))
        throw new TypeError('Token::visit: First argument must be instance of `function`');

      finder = () => true;
    } else {
      if (!isType(pattern, 'string', 'array', 'function'))
        throw new TypeError('Token::visit: First argument must be instance of `string`, `array`, or `function`');

      if (!isType(callback, 'function'))
        throw new TypeError('Token::visit: Second argument must be instance of `function`');

      if (isType(pattern, 'string', 'array')) {
        if (!isType(pattern, 'array'))
          pattern = [ pattern ];

        finder = (token) => (pattern.indexOf(token.typeName) >= 0);
      } else if (typeof pattern === 'function') {
        finder = pattern;
      }
    }

    if (finder(this))
      results.push(callback(this));

    if (this.children) {
      var children = this.children;
      for (var i = 0, il = children.length; i < il; i++) {
        var child = children[i];
        results.push(child.visit(finder, callback));
      }
    }

    return results;
  }
}

class SkipToken extends Token {
  skipOutput() {
    return true;
  }
}

isType.addType('Token', (val) => (val instanceof Token));
isType.addType('SkipToken', (val) => (val instanceof SkipToken));

module.exports = {
  Token,
  SkipToken,
};
