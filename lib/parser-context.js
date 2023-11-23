import * as Utils         from './utils.js';
import { Scope }          from './scope.js';
import { InputStream }    from './input-stream.js';
import { Token }          from './token.js';
import { SourceRange }    from './source-range.js';
import { MatcherResult }  from './results/index.js';
import { Matcher }        from './matcher.js';

const DEBUG_POSITION_WINDOW_SIZE = 10;

export const ParserContext = Utils.makeKeysNonEnumerable(class ParserContext extends Scope {
  static [Utils.TYPE_SYMBOL] = 'ParserContext';

  constructor(_options) {
    let options = _options || {};
    let {
      parser,
    } = options;

    if (!parser)
      throw new TypeError('ParserContext: "parser" is a required option.');

    super(options);

    Object.defineProperties(this, {
      'parser': {
        writable:     true,
        enumerable:   true,
        configurable: true,
        value:        parser,
      },
      'parserRange': {
        writable:     true,
        enumerable:   true,
        configurable: true,
        value:        this.safeClone(options.parserRange) || new SourceRange({ start: 0, end: parser.getInputStream().length }),
      },
      'startOffset': {
        enumerable:   false,
        configurable: true,
        get:          () => this.parserRange.start,
      },
      'endOffset': {
        enumerable:   false,
        configurable: true,
        get:          () => this.parserRange.end,
      },
    });
  }

  dynamicProperties() {
    return {
      '$type:String':       () => this.getInputStream().toString(),
      '$type:Number':       () => this.parserRange.start,
      '$type:SourceRange':  () => this.parserRange.clone(),
      'parser':             () => this.parser,
      'fileName':           () => this.getFileName(),
      'lineStart':          () => this.getLineAtOffset(this.parserRange.start),
      'lineEnd':            () => this.getLineAtOffset(this.parserRange.end),
      'columnStart':        () => this.getColumnAtOffset(this.parserRange.start),
      'columnEnd':          () => this.getColumnAtOffset(this.parserRange.end),
      'range':              () => this.parserRange.clone(),
    };
  }

  setDebugMode(value) {
    this.set('debug', !!value);
    return this;
  }

  setDebugColors(value) {
    this.set('debugColors', !!value);
    return this;
  }

  debugValue(value, primaryColor) {
    let formattedValue = ('' + value)
      .replace(/\r/g, `${this.debugColor('bg:yellow')}\\r${this.debugColor('bg:black')}`)
      .replace(/\n/g, `${this.debugColor('bg:yellow')}\\n${this.debugColor('bg:black')}`)
      .replace(/\t/g, `${this.debugColor('bg:yellow')}\\t${this.debugColor('bg:black')}`);

    return `${this.debugColor(primaryColor || 'fg:magenta')}${formattedValue}${this.debugColor('reset')}`;
  }

  debugLog(...args) {
    if (this.get('debug') !== true)
      return;

    console.debug(...args);
  }

  debugColor(colorCommands, content) {
    if (this.get('debugColors') !== true)
      return (content == null) ? '' : content;

    return Utils.setStringColor(colorCommands, content);
  }

  debugPosition(..._args) {
    let inputStream     = this.getInputStream();
    let debugStrPrefix  = this.debugValue(inputStream.slice(Math.max(this.parserRange.start - DEBUG_POSITION_WINDOW_SIZE, 0), this.parserRange.start), 'fg:green');
    let debugStr        = this.debugValue(inputStream.slice(this.parserRange.start, this.parserRange.start + 1), 'fg:yellow');
    let debugStrPostfix = this.debugValue(inputStream.slice(this.parserRange.start + 1, Math.min(this.parserRange.start + DEBUG_POSITION_WINDOW_SIZE, this.parserRange.end)), 'fg:yellow');

    return `${debugStrPrefix}${this.debugColor('reset;effect:blinking;bg:red')}🞂${this.debugColor('fg:yellow;bg:cyan')}${debugStr}${this.debugColor('reset;fg:yellow')}${debugStrPostfix}${this.debugColor('reset')}`;
  }

  getProperties() {
    return this.properties;
  }

  getParser() {
    return this.parser;
  }

  getInputRange() {
    return new SourceRange({ start: 0, end: this.getInputStream().length });
  }

  getInputStream() {
    let parser = this.parser;
    if (!parser || !parser.getInputStream())
      return new InputStream({ source: '' });

    return parser.getInputStream();
  }

  getFileName() {
    return this.getInputStream().getFileName();
  }

  getLineAtOffset(...args) {
    return this.getInputStream().getLineAtOffset(...args);
  }

  getColumnAtOffset(...args) {
    return this.getInputStream().getColumnAtOffset(...args);
  }

  resolveValue(value, options) {
    if (value && typeof value[Utils.VIRTUAL_RESOLVER] === 'function')
      return this.resolveValue(value[Utils.VIRTUAL_RESOLVER](this, options), options);

    return value;
  }

  resolveValueByType(type, value, options) {
    let resolvedValue = this.resolveValue(value, options);
    if (resolvedValue && resolvedValue.dynamicProperties) {
      let newResolvedValue = resolvedValue.get(`$type:${type}`);
      if (newResolvedValue != null)
        resolvedValue = newResolvedValue;
    }

    return resolvedValue;
  }

  resolveValueToString(value, options) {
    return (new String(this.resolveValueByType('String', value, options))).valueOf();
  }

  resolveValueToNumber(value, options) {
    return (new Number(this.resolveValueByType('Number', value, options))).valueOf();
  }

  resolveValueToBoolean(value, options) {
    return (new Boolean(this.resolveValueByType('Boolean', value, options))).valueOf();
  }

  resolveValueToMatcher(value, options) {
    let resolvedValue = this.resolveValueByType('Matcher', value, options);
    if (typeof resolvedValue === 'function')
      resolvedValue = resolvedValue();

    if (!Utils.isType(resolvedValue, 'Matcher', Matcher))
      return null;

    return resolvedValue;
  }

  resolveValueToMatcherOrMethod(value, options) {
    let resolvedValue = this.resolveValueByType('Matcher', value, options);
    if (!Utils.isType(resolvedValue, 'Function', 'Matcher', Matcher))
      return null;

    return resolvedValue;
  }

  resolveValueToSourceRange(value, options) {
    let resolvedValue = this.resolveValueByType('SourceRange', value, options);
    if (!Utils.isType(resolvedValue, 'SourceRange', SourceRange))
      return null;

    return resolvedValue;
  }

  result(parent) {
    return new MatcherResult({ context: this, parent });
  }

  prepareError(_error) {
    let error = _error;

    // Error already prepared?
    if (Utils.isType(error, Error) && error.parserContext)
      return error;

    if (Utils.isType(error, 'String'))
      error = new Error(error);

    if (!error.parserContext)
      error.parserContext = this;

    if (error.lineStart == null)
      error.lineStart = this.getLineAtOffset(this.parserRange.start);

    if (error.lineEnd == null)
      error.lineEnd = this.getLineAtOffset(this.parserRange.end);

    if (error.columnStart == null)
      error.columnStart = this.getColumnAtOffset(this.parserRange.start);

    if (error.columnEnd == null)
      error.columnEnd = this.getColumnAtOffset(this.parserRange.end);

    return error;
  }

  throwError(_error) {
    let error = this.prepareError(_error);
    throw error;
  }

  nullResult(parent) {
    return this.result(parent);
  }

  panicResult(error, parent) {
    return this.result(parent)
      .setPanic(this.prepareError(error));
  }

  failResult(parent) {
    return this.result(parent)
      .setFailed(true);
  }

  haltResult(parent) {
    return this.result(parent)
      .setHalt(true);
  }

  breakResult(target, parent) {
    return this.result(parent)
      .setBreak((target && Utils.isType(target, 'String')) ? target : true);
  }

  continueResult(target, parent) {
    return this.result(parent)
      .setContinue((target && Utils.isType(target, 'String')) ? target : true);
  }

  tokenResult(_properties, parent) {
    let properties = _properties || {};
    let token = (Utils.isType(properties, Token, 'Token')) ? properties : new Token({
      context:  this,
      parent:   properties.parent,
      ...properties,
    });

    return this.result(parent)
      .setToken(token)
      .setCapturedRange(token.capturedRange)
      .setMatchedRange(token.matchedRange)
      .setParserOffset(token.matchedRange.end);
  }

  updateParserRangeResult(range, parent) {
    return this.result(parent)
      .setParsedRange(range);
  }

  updateParserOffsetResult(range, parent) {
    return this.result(parent)
      .setParserOffset(range);
  }

  async exec(_matcher) {
    let matcher = _matcher;
    if (typeof matcher === 'function')
      matcher = matcher();

    matcher = _matcher.clone();

    let hasOwnScope = matcher.hasOwnScope();
    let matcherName = ('' + this.resolveValue(matcher.name()));
    let context     = (hasOwnScope) ? this.clone(this) : this;

    if (hasOwnScope) {
      // Set "self" key
      context.set('@', context);
    }

    // Set myself on the scope
    // so that others can reference
    // me with a "Fetch"
    context.assign({ [matcherName]: matcher });

    try {
      let result = await matcher.exec(matcher.createMatcherScope(context));
      if (!Utils.isType(result, MatcherResult))
        throw new TypeError(`Matcher "${matcherName}" returned a bad result (${result}). All matchers must return a MatcherResult.`);

      return result;
    } catch (_error) {
      let error = this.prepareError(_error);

      context.debugLog('Internal error encountered:\n', error);

      return context.panicResult(error);
    }
  }
});
