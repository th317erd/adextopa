const {
  clamp,
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

function getLevelIndent(level) {
  return (new Array(level + 1)).join('  ');
};

class MatcherDefinition {
  constructor(_opts) {
    var opts = _opts || {};
    if (isType(opts, 'string')) {
      opts = {
        typeName: opts,
      };
    } else if (typeof opts === 'function') {
      var finalizeMethod = opts;
      opts = { finalize: finalizeMethod };
    }

    opts = Object.assign({ typeName: this._getTypeName() }, opts);

    Object.defineProperties(this, {
      '_options': {
        writable:     false,
        enumerable:   false,
        configurable: true,
        value:        opts,
      },
      '_matcherCache': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        null,
      },
    });
  }

  logDebugInfo(context, result) {
    const colorString = (color, _str) => {
      var str = _str;
      if (!str)
        str = '<empty>';

      return `\x1b[43m${str}\x1b[0m`;
    }

    var typeName  = this.getTypeName();
    var source    = this.getSourceAsString();
    var range     = '';
    var logKey;
    var status;
    var sourceRange;

    if (result instanceof Token) {
      sourceRange = result.getSourceRange();
      status      = (result instanceof SkipToken) ? 'SKIPPED+' : 'SUCCESS';
    } else {
      sourceRange = new SourceRange(this.getParser(), this.startOffset, this.endOffset);
      if (result == null) {
        status = 'SKIPPED';
      } else if (result === false) {
        status = 'FAILED';
      } else if (result instanceof Error) {
        status = 'ERROR';
      }
    }

    var sourcePart    = colorString('bgYellow', source.substring(sourceRange.start, sourceRange.end));
    var before        = source.substring(clamp(sourceRange.start - 10, 0, source.length), sourceRange.start);
    var after         = source.substring(sourceRange.end, clamp(sourceRange.end + 10, 0, source.length));

    logKey  = `[${sourceRange.start}-${sourceRange.end}]`;
    range   = `: ${logKey}{${before}${sourcePart}${after}}`;

    console.log(`${getLevelIndent(context._level)}Exited matcher ${typeName}[${status}]${range}`);
  }

  createNewContext(_context, opts) {
    var context   = Object.create(_context || null);
    var typeName  = this.getTypeName();
    var count     = context[typeName] || 0;
    var debugSkip = opts.debugSkip || context.debugSkip;
    var debug     = (!debugSkip && (opts.debug || context.debug));

    if (opts.context)
      context = Object.assign(context, opts.context);

    context._super = _context || null;

    if (debugSkip === 'all' && context.debugSkip !== 'all')
      context.debugSkip = 'all';

    if (debug) {
      context._level = (_context) ? ((_context._level || 0) + 1) : 0;

      if (!context.debug)
        context.debug = true;
    }

    const findParentContext = (_typeNames, _currentContext) => {
      var typeNames = _typeNames;
      if (!(typeNames instanceof Array))
        typeNames = [ typeNames ];

      var context = _currentContext;
      if (!context)
        context = _context;

      if (typeNames.indexOf(context.typeName) >= 0)
        return context;

      if (typeNames.indexOf(context.rawTypeName) >= 0)
        return context;

      if (context._super)
        return findParentContext(typeNames, context._super);
    };

    context[typeName]         = count + 1;
    context.rawTypeName       = this._getTypeName();
    context.typeName          = typeName;
    context.findParentContext = findParentContext;
    context.stop              = (typeName) => {
      var context = context;
      if (typeName)
        context = findParentContext(typeName, context);

      if (!context)
        throw new Error(`Attempting to stop process, but no context found for ${JSON.stringify(typeName || null)}`);

      if (debug)
        console.log(`${getLevelIndent(context._level)}Parent command ${typeName} stopping as requested...`);

      context.isStopped = true;
    };

    return context;
  }

  defineMatcherProperties(parser, _offset) {
    var offset      = _offset || 0;
    var sourceRange = (offset instanceof SourceRange) ? offset.clone() : parser.createSourceRange(offset, offset);

    Object.defineProperties(this, {
      '_parser': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        parser,
      },
      '_sourceRange': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        sourceRange,
      },
      'startOffset': {
        enumerable:   false,
        configurable: true,
        get:          () => this._sourceRange.start,
        set:          (val) => (this._sourceRange.start = val),
      },
      'endOffset': {
        enumerable:   false,
        configurable: true,
        get:          () => this._sourceRange.end,
        set:          (val) => (this._sourceRange.end = val),
      }
    });
  }

  exec(parser, offset, _context) {
    this.defineMatcherProperties(parser, offset);

    try {
      var opts      = this.getOptions();
      var context   = this.createNewContext(_context, opts);
      var typeName  = this.getTypeName();
      var debugSkip = opts.debugSkip || context.debugSkip;
      var debug     = (!debugSkip && (opts.debug || context.debug));

      if (debug && context.debugLevel > 0)
        console.log(`${getLevelIndent(context._level)}Entering matcher ${typeName}`);

      var result = this.respond(context);

      if (debug)
        this.logDebugInfo(context, result);

      return result;
    } catch (error) {
      this.error(context, error);
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
    var constructorArgs = (_constructorArgs || []).concat(this.getOptions());
    var matcher         = new this.constructor(...constructorArgs);

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

  getErrorTypeName() {
    return this.getTypeName();
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

  fail(context, offset) {
    var opts    = this.getOptions();
    var onFail  = opts.onFail;
    if (typeof onFail === 'function') {
      var newSourceRange = this._parser.createSourceRange(this.startOffset, (offset == null) ? this.endOffset : offset);

      try {
        var str = onFail.call(this, context, newSourceRange, this);
        if (isType(str, 'string'))
          throw new Error(str);
      } catch (error) {
        return this.error(context, error, newSourceRange);
      }
    }

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
    return (context.runFinalize === false) ? token : this.finalize(context, token);
  }

  finalize(context, _token) {
    return this.callHook('finalize', context, _token);
  }

  callHook(name, context, _token, extraArgs) {
    var opts  = this.getOptions();
    var token = _token;
    var hook  = opts[name];

    if (typeof hook !== 'function')
      return token;

    try {
      var argsToken = token;
      if (token instanceof Token)
        argsToken = token.remapTokenLinks().getOutputToken();

      var args      = { matcher: this, context, token: argsToken, options: this.getOptions() };
      var newToken  = hook.call(this, (!extraArgs) ? args : Object.assign(args, extraArgs));

      if (newToken && newToken instanceof Token && newToken !== token)
        token.setOutputToken(newToken.clone({}, token.getSourceRange()));

      return token;
    } catch (e) {
      return this.error(context, e);
    }
  }

  skip(context, _offset) {
    var offset = (isValidNumber(_offset)) ? _offset : this.startOffset;
    return this.createToken(this.getParser().createSourceRange(this.startOffset, offset), undefined, SkipToken);
  }

  warning(context, message, offset) {
    var result      = { message };
    var sourceRange = (offset instanceof SourceRange) ? offset.clone() : this.getSourceRange().clone();

    if (isValidNumber(offset))
      sourceRange.end = offset;

    result.parser       = this.getParser();
    result.matcher      = this;
    result.sourceRange  = sourceRange;
    result.context      = context;

    this.getParser().addWarning(result);

    return result;
  }

  error(context, message, offset) {
    var errorResult = (message instanceof Error) ? message : new Error(message);
    var sourceRange = (offset instanceof SourceRange) ? offset.clone() : this.getSourceRange().clone();

    if (isValidNumber(offset))
      sourceRange.end = offset;

    errorResult.parser      = this.getParser();
    errorResult.matcher     = this;
    errorResult.sourceRange = sourceRange;
    errorResult.context     = context;

    this.getParser().addError(errorResult);

    return errorResult;
  }

  matches(sourceStr, offset, matcher) {
    if (isType(matcher, 'string')) {
      for (var i = 0, il = matcher.length; i < il; i++) {
        var char1 = sourceStr.charAt(offset + i);
        var char2 = matcher.charAt(i);

        if (char1 !== char2)
          return false;
      }

      return true;
    } else if (isType(matcher, RegExp)) {
      var result = matcher.lastIndex = offset;
      if (!result || result.index !== offset)
        return false;

      return true;
    } else if (isType(matcher, array)) {
      for (var i = 0, il = matcher.length; i < il; i++) {
        var item    = matcher[i];
        var result  = this.matches(sourceStr, offset, item);
        if (!result)
          continue;

        return item;
      }

      return false;
    }
  }
}

isType.addType('MatcherDefinition', (val) => (val instanceof MatcherDefinition || (val && !!val.MatcherDefinitionClass)));

function defineMatcher(typeName, definer, _parent = MatcherDefinition) {
  var parent                  = (_parent && _parent.MatcherDefinitionClass) ? _parent.MatcherDefinitionClass : _parent;
  var MatcherDefinitionClass  = definer(parent);

  MatcherDefinitionClass.prototype._getTypeName = () => typeName;
  MatcherDefinitionClass._getTypeName = () => typeName;

  const creator = function(...args) {
    const creatorScope = function() {
      return new MatcherDefinitionClass(...args);
    };

    creatorScope.name = creatorScope.displayName = typeName;
    creatorScope.MatcherDefinitionClass = MatcherDefinitionClass;

    creatorScope.exec = function(...args) {
      var instance = creatorScope();
      return instance.exec(...args);
    };

    creatorScope.getTypeName = function() {
      var instance = creatorScope();
      return instance.getTypeName();
    };

    creatorScope.getErrorTypeName = function() {
      var instance = creatorScope();
      return instance.getErrorTypeName();
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
  MatcherDefinition,
};
