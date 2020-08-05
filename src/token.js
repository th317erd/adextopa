const {
  isType,
  isValidNumber
}                     = require('./utils');
const { SourceRange } = require('./source-range');

// This will be set on first run, and remain static afterwords
var RESERVED_WORDS;

function addUserProperties(opts, reservedWords) {
  var keys = Object.keys(opts);
  for (var i = 0, il = keys.length; i < il; i++) {
    var key = keys[i];

    if (reservedWords && reservedWords.indexOf(key) >= 0)
      continue;

    Object.defineProperty(this, key, {
      writable: false,
      enumerable: true,
      configurable: false,
      value: opts[key]
    });
  }
}

class Token {
  constructor(_parser, _sourceRange, opts) {
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

    if (opts) {
      if (!RESERVED_WORDS)
        RESERVED_WORDS = Object.keys(reservedProperties);

      addUserProperties.call(this, opts, RESERVED_WORDS);
    }
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
}

class TokenDefinition {
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
        sourceRange = (offset instanceof SourceRange) ? offset.clone() : new (parser.getSourceRangeClass())(parser, offset, offset);

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

  createToken(sourceRange, props) {
    var parser = this.getParser();
    return new (parser.getTokenClass())(parser, sourceRange, props);
  }

  fail() {
    return false;
  }

  successWithoutFinalize(offset, props) {
    if (offset instanceof Token) {
      var token = offset;

      if (opts)
        Object.assign(token, opts);

      this.endOffset = token.endOffset;

      return token;
    }

    if (!isValidNumber(offset))
      throw new TypeError(`${this.getTypeName()}::respond::success: First argument must be a valid number (length/offset) an instance of \`Token\``);

    this.endOffset = this.startOffset + (offset || 0);

    var opts  = this.getOptions(),
        token = this.createToken(this.getSourceRange().clone(), Object.assign({ typeName: opts.typeName || this.getTypeName() }, props || {}));

    return token;
  }

  success(offset, props) {
    var token = this.successWithoutFinalize(offset, props);
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
isType.addType('TokenDefinition', (val) => (val instanceof TokenDefinition));

function defineTokenMatcher(typeName, definer, parent = TokenDefinition) {
  var TokenDefinitionClass = definer(parent);

  TokenDefinitionClass.prototype.getTypeName = () => typeName;
  TokenDefinitionClass.getTypeName = () => typeName;

  var creator = function(...args) {
    return new TokenDefinitionClass(...args);
  };

  creator.name = creator.displayName = typeName;

  return creator;
};

module.exports = {
  Token,
  TokenDefinition,
  defineTokenMatcher
};
