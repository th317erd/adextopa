const {
  isType,
  isValidNumber
}                     = require('./utils');
const { SourceRange } = require('./source-range');

// This will be set on first run, and remain static afterwords
var RESERVED_WORDS;

function defineProperties(props) {
  var keys = Object.keys(props);

  for (var i = 0, il = keys.length; i < il; i++) {
    var key         = keys[i],
        value       = props[key],
        enumerable  = true;

    if (value === undefined)
      continue;

    if (key.charAt(0) === '_') {
      key = key.substring(1);
      enumerable = false;
    }

    if (RESERVED_WORDS && RESERVED_WORDS.indexOf(key) >= 0)
      continue;

    Object.defineProperty(this, key, {
      writable: true,
      enumerable,
      configurable: true,
      value
    });
  }

  return this;
}

class Token {
  constructor(_parser, _sourceRange, props) {
    var parser      = _parser,
        sourceRange = _sourceRange || null;

    var reservedProperties = {
      _parser: {
        writable: false,
        enumerable: false,
        configurable: true,
        value: parser
      },
      _sourceRange: {
        enumerable: false,
        configurable: true,
        get: () => sourceRange,
        set: () => {} // noop
      },
      _raw: {
        enumerable: false,
        configurable: true,
        get: () => (sourceRange && sourceRange.value),
        set: () => {} // noop
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
    var token = new (tokenClass || this.constructor)(this.getParser(), this.getSourceRange(), Object.assign({}, this, props));

    token.remapParentTokenForAllChildren();

    return token;
  }

  remapParentTokenForAllChildren(newParent) {
    if (!this.children)
      return this;

    this.children = (this.children || []).map((child) => {
      Object.defineProperty(child, 'parent', {
        writable: true,
        enumerable: false,
        configurable: true,
        value: newParent || this
      });

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

  getRawValue() {
    return this._raw;
  }

  skipOutput() {
    return false;
  }
}

class SkipToken extends Token {
  skipOutput() {
    return true;
  }
}

class MatcherDefinition {
  constructor(_opts) {
    var opts = _opts || {};
    if (isType(opts, 'string')) {
      opts = {
        typeName: opts
      };
    } else if (typeof opts === 'function') {
      var finalizeMethod = opts;

      opts = {};
      Object.defineProperties(opts, {
        _finalize: {
          writable: false,
          enumerable: false,
          configurable: true,
          value: finalizeMethod
        }
      });
    }

    Object.defineProperties(this, {
      _options: {
        writable: false,
        enumerable: false,
        configurable: true,
        value: opts
      }
    });
  }

  exec(parser, _offset) {
    var offset      = _offset || 0,
        sourceRange = (offset instanceof SourceRange) ? offset.clone() : parser.createSourceRange(offset, offset);

    Object.defineProperties(this, {
      _parser: {
        writable: true,
        enumerable: false,
        configurable: true,
        value: parser
      },
      _sourceRange: {
        writable: true,
        enumerable: false,
        configurable: true,
        value: sourceRange
      },
      startOffset: {
        enumerable: false,
        configurable: true,
        get: () => this._sourceRange.start,
        set: (val) => (this._sourceRange.start = val),
      },
      endOffset: {
        enumerable: false,
        configurable: true,
        get: () => this._sourceRange.end,
        set: (val) => (this._sourceRange.end = val),
      }
    });

    try {
      return this.respond();
    } catch (e) {
      this.error(e);
    }
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

  getOptions() {
    return this._options;
  }

  isValidResult(result) {
    if (result == null)
      return true;

    if (result === false)
      return true;

    if (result instanceof Error)
      return true;

    if (result instanceof Token)
      return true;

    return false;
  }

  getTypeName() {
    return '<none>';
  }

  getSourceAsString() {
    return this.getParser().getSourceAsString();
  }

  getSourceRangeAsString(...args) {
    return this.getParser().getSourceRangeAsString(...args);
  }

  createToken(sourceRange, props, tokenClass) {
    var parser = this.getParser();
    return new (tokenClass || parser.getTokenClass())(parser, sourceRange, props);
  }

  fail() {
    return false;
  }

  successWithoutFinalize(endOffset, props, tokenClass) {
    if (endOffset instanceof Token) {
      var token = endOffset;

      if (props)
        token.defineProperties.call(token, props);

      this.endOffset = token.endOffset;

      return token;
    }

    if (!isValidNumber(endOffset))
      throw new TypeError(`${this.getTypeName()}::respond::success: First argument must be a valid number (length/offset) an instance of \`Token\``);

    this.endOffset = endOffset || this.endOffset;

    var opts  = this.getOptions(),
        token = this.createToken(this.getSourceRange().clone(), Object.assign({ typeName: opts.typeName || this.getTypeName() }, props || {}), tokenClass);

    return token;
  }

  success(endOffset, props, tokenClass) {
    var token = this.successWithoutFinalize(endOffset, props, tokenClass);
    return this.finalize(token);
  }

  finalize(token) {
    var opts      = this.getOptions(),
        finalize  = opts._finalize;

    if (typeof finalize === 'function') {
      var result = finalize.call(this, { context: this, token });
      if (!(result instanceof Token))
        throw new TypeError(`${this.getTypeName()}::respond::finalize: Returned an invalid value. Must return an instance of \`Token\``);

      return result;
    }

    return token;
  }

  skip() {
  }

  warning(message) {
    // TODO: implement warning
  }

  error(message, offset) {
    var errorResult = (message instanceof Error) ? message: new Error(message);

    if (isValidNumber(offset))
      this.endOffset = this.startOffset + offset;

    errorResult.sourceRange = this.getSourceRange().clone();
    this.getParser().addError(errorResult);

    return errorResult;
  }
}

isType.addType('Token', (val) => (val instanceof Token));
isType.addType('MatcherDefinition', (val) => (val instanceof MatcherDefinition));
isType.addType('SkipToken', (val) => (val instanceof SkipToken));

function defineMatcher(typeName, definer, _parent = MatcherDefinition) {
  var parent                  = (_parent && _parent.MatcherDefinitionClass) ? _parent.MatcherDefinitionClass : _parent,
      MatcherDefinitionClass  = definer(parent);

  MatcherDefinitionClass.prototype.getTypeName = () => typeName;
  MatcherDefinitionClass.getTypeName = () => typeName;

  var creator = function(...args) {
    return new MatcherDefinitionClass(...args);
  };

  creator.name = creator.displayName = typeName;
  creator.MatcherDefinitionClass = MatcherDefinitionClass;

  return creator;
};

module.exports = {
  Token,
  MatcherDefinition,
  SkipToken,
  defineMatcher
};
