const {
  isType,
  isValidNumber
}                           = require('./utils');
const { SourceRange }       = require('./source-range');
const { Token, SkipToken }  = require('./token');

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
    const getLevelIndent = (level) => {
      return (new Array(level + 1)).join('  ');
    };

    var context     = Object.create(_context || {}),
        offset      = _offset || 0,
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
      var opts      = this.getOptions(),
          typeName  = this.getTypeName(),
          count     = context[typeName] || 0,
          debugSkip = opts.debugSkip || context.debugSkip,
          debug     = (!debugSkip && (opts.debug || context.debug));

      context._super = _context;

      if (debugSkip === 'all' && context.debugSkip !== 'all')
        context.debugSkip = 'all';

      if (debug) {
        context._level = (_context) ? ((_context._level || 0) + 1) : 0;

        if (!context.debug)
          context.debug = true;
      }

      context[typeName] = count + 1;

      if (debug && context.debugLevel > 0)
        console.log(`${getLevelIndent(context._level)}Entering matcher ${typeName}`);

      var result = this.respond(context),
          logKey;

      if (debug) {
        var status, range = '';

        if (result == null) {
          status = 'SKIPPED';
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
          status = (result instanceof SkipToken) ? 'SKIPPED+' : 'SUCCESS';
        }

        console.log(`${getLevelIndent(context._level)}Exited matcher ${typeName}[${status}]${range}`);
      }

      return result;
    } catch (e) {
      this.error(context, e);
    }
  }

  _getMatchers(values) {
    return getMatchers(values);
  }

  getMatchers(values) {
    if (this._matcherCache)
      return this._matcherCache;

    this._matcherCache = this._getMatchers(values);
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

  isToken(value) {
    return (value instanceof Token);
  }

  isSkipToken(value) {
    return (value instanceof SkipToken);
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

  callHook(name, context, _token, extraArgs) {
    var opts  = this.getOptions(),
        token = _token,
        hook  = opts[name];

    if (typeof hook !== 'function')
      return token;

    try {
      var args = { matcher: this, context, token };
      token = hook.call(this, (!extraArgs) ? args : Object.assign(args, extraArgs));

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

isType.addType('MatcherDefinition', (val) => (val instanceof MatcherDefinition || (val && !!val.MatcherDefinitionClass)));

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
  getMatchers,
  defineMatcher,
  MatcherDefinition
};
