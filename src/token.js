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
            writable: true,
            enumerable: false,
            configurable: true,
            value: child
          }
        });
      }

      Object.defineProperties(child, {
        'parent': {
          writable: true,
          enumerable: false,
          configurable: true,
          value: newParent || this
        },
        'previousSibling': {
          writable: true,
          enumerable: false,
          configurable: true,
          value: previousSibling
        },
        'nextSibling': {
          writable: true,
          enumerable: false,
          configurable: true,
          value: null
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

  visit(_pattern, _callback) {
    var callback      = _callback,
        pattern       = _pattern,
        results       = [],
        finder;

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

function getMatchers(values) {
  var toMatcher = (value) => {
    if (value.MatcherDefinitionClass)
      return value();

    return value;
  };

  if (!(values instanceof Array))
    return toMatcher(values);
  else
    return values.map(toMatcher);
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
      opts = { finalize: finalizeMethod };
    }

    opts = Object.assign({ typeName: this._getTypeName() }, opts);

    Object.defineProperties(this, {
      _options: {
        writable: false,
        enumerable: false,
        configurable: true,
        value: opts
      },
      _matcherCache: {
        writable: true,
        enumerable: false,
        configurable: true,
        value: null
      }
    });
  }

  exec(parser, _offset, _context) {
    var context     = Object.create(_context || {}),
        offset      = _offset || 0,
        sourceRange = (offset instanceof SourceRange) ? offset.clone() : parser.createSourceRange(offset, offset);

    context._super = _context;

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
      var opts      = this.getOptions(),
          typeName  = this.getTypeName(),
          count     = context[typeName] || 0;

      if (opts.debug)
        context.debug = true;

      context[typeName] = count + 1;

      if (context.debug && context.debugLevel > 0)
        console.log(`Adextopa Tracing: -> Entering matcher ${typeName}`);

      var result = this.respond(context),
          logKey,
          skipLogging = false;

      if (context.debug) {
        if (context.debugLevel > 0)
          console.log(`Adextopa Tracing: -> Exited matcher ${typeName}`);

        var status, range = '';

        if (result == null || result instanceof SkipToken) {
          if (result == null)
            status = 'SKIPPED';
          else
            status = 'SKIPPED+';
        } else if (result === false) {
          status = 'FAILED';
        } else if (result instanceof Error) {
          status = 'ERROR';
        } else if (result instanceof Token) {
          var source        = this.getSourceAsString(),
              sourceRange   = result.getSourceRange(),
              value         = result._raw;

          // do we have colors?
          if (typeof ''.bgYellow !== 'undefined')
            value = ('' + value).bgYellow.black;
          else
            value = `[${value}]`;

          logKey = `[${sourceRange.start}-${sourceRange.end}]`;

          range = `: ${logKey}{${source.substring(sourceRange.start - 10, sourceRange.start)}${value.bgYellow}${source.substring(sourceRange.end, sourceRange.end + 10)}}`;
          status = 'SUCCESS';
        }

        if (!context.debugVerbose && logKey && (context._debugLogs || []).indexOf(logKey) >= 0)
          skipLogging = true;

        if (logKey && context._debugLogs)
          context._debugLogs.push(logKey);

        if (!skipLogging)
          console.log(`Adextopa Tracing: -> ${typeName}[${status}]${range}`);
      }

      return result;
    } catch (e) {
      this.error(context, e);
    }
  }

  getMatchers(values) {
    if (this._matcherCache)
      return this._matcherCache;

    this._matcherCache = getMatchers(values);
    return this._matcherCache;
  }

  clone(offset, _constructorArgs) {
    var constructorArgs = (_constructorArgs || []).concat(this.getOptions()),
        matcher         = new this.constructor(...constructorArgs);

    if (this._parser)
      matcher._parser = this._parser;

    if (offset != null) {
      if (offset instanceof SourceRange)
        matcher._sourceRange = offset.clone();
      else
        matcher._sourceRange = this._parser.createSourceRange(offset, offset);
    } else if (this._sourceRange) {
      matcher._sourceRange = this._sourceRange.clone();
    }

    return matcher;
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

  _getTypeName() {
    return '<none>';
  }

  getTypeName() {
    var opts = this.getOptions();
    return (opts.typeName || this._getTypeName());
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

  fail(context) {
    return false;
  }

  successWithoutFinalize(context, endOffset, props, tokenClass) {
    if (endOffset instanceof Token) {
      var token = endOffset;

      if (props)
        token.defineProperties.call(token, props);

      return token;
    }

    if (!isValidNumber(endOffset))
      throw new TypeError(`${this.getTypeName()}::respond::success: First argument must be a valid number (length/offset) an instance of \`Token\``);

    this.endOffset = endOffset || this.endOffset;

    return this.createToken(this.getSourceRange().clone(), Object.assign({ typeName: this.getTypeName() }, props || {}), tokenClass);
  }

  success(context, endOffset, props, tokenClass) {
    var token = this.successWithoutFinalize(context, endOffset, props, tokenClass);
    return this.finalize(context, token);
  }

  finalize(context, _token) {
    return this.callHook('finalize', context, _token);
  }

  callHook(name, context, _token) {
    var opts  = this.getOptions(),
        token = _token,
        hook  = opts[name];

    if (typeof hook !== 'function')
      return token;

    try {
      token = hook.call(this, { matcher: this, context, token });

      if (token instanceof Token)
        token.remapTokenLinks();

      return token;
    } catch (e) {
      return this.error(context, e);
    }
  }

  skip(context, offset) {
    if (!isValidNumber(offset))
      return;

    return this.createToken(this.getParser().createSourceRange(this.startOffset, offset), undefined, SkipToken);
  }

  warning(context, message, offset) {
    var result = { message };

    if (isValidNumber(offset))
      this.endOffset = offset;

    result.parser = this.getParser();
    result.sourceRange = this.getSourceRange().clone();
    result.context = context;

    this.getParser().addWarning(result);

    return result;
  }

  error(context, message, offset) {
    var errorResult = (message instanceof Error) ? message : new Error(message);

    if (isValidNumber(offset))
      this.endOffset = offset;

    errorResult.parser = this.getParser();
    errorResult.sourceRange = this.getSourceRange().clone();
    errorResult.context = context;

    this.getParser().addError(errorResult);

    return errorResult;
  }
}

isType.addType('Token', (val) => (val instanceof Token));
isType.addType('MatcherDefinition', (val) => (val instanceof MatcherDefinition || (val && !!val.MatcherDefinitionClass)));
isType.addType('SkipToken', (val) => (val instanceof SkipToken));

function defineMatcher(typeName, definer, _parent = MatcherDefinition) {
  var parent                  = (_parent && _parent.MatcherDefinitionClass) ? _parent.MatcherDefinitionClass : _parent,
      MatcherDefinitionClass  = definer(parent);

  MatcherDefinitionClass.prototype._getTypeName = () => typeName;
  MatcherDefinitionClass._getTypeName = () => typeName;

  var creator = function(...args) {
    var creatorScope = function() {
      return new MatcherDefinitionClass(...args);
    };

    creatorScope.name = creatorScope.displayName = typeName;
    creatorScope.MatcherDefinitionClass = MatcherDefinitionClass;
    creatorScope.exec = function(...args) {
      var instance = creatorScope();
      return instance.exec(...args);
    };

    return creatorScope;
  };

  creator.name = creator.displayName = typeName;
  creator.MatcherDefinitionClass = MatcherDefinitionClass;

  return creator;
};

module.exports = {
  Token,
  MatcherDefinition,
  SkipToken,
  defineMatcher,
  getMatchers
};
