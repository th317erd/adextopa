import * as Utils               from './utils.js';
import { Scope }                from './scope.js';
import { InputStream }          from './input-stream.js';
import { Token }                from './token.js';
import { TokenMatcherResult }   from './results/token-matcher-result.js';
import { FailureMatcherResult } from './results/failure-matcher-result.js';
import { SkipMatcherResult }    from './results/skip-matcher-result.js';
import { PanicMatcherResult }   from './results/panic-matcher-result.js';
import { SourceRange }          from './source-range.js';

const VIRTUAL_RESOLVER = Symbol.for('/adextopa/helper/virtualResolver');

const DEBUG_POSITION_WINDOW_SIZE = 10;

export const ParserContext = Utils.makeKeysNonEnumerable(class ParserContext extends Scope {
  static [Utils.TYPE_SYMBOL] = 'ParserContext';

  static VIRTUAL_RESOLVER = VIRTUAL_RESOLVER;

  constructor(parser, parent, _options) {
    if (!parser)
      throw new TypeError('ParserContext: "parser" is a required option.');

    let options = _options || {};

    super(parent, options);

    Object.defineProperties(this, {
      'parser': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        parser,
      },
      'parserRange': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        this.safeClone(options.parserRange) || new SourceRange(0, parser.getInputStream().length),
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
      'parser':       () => this.parser,
      'fileName':     () => this.getFileName(),
      'lineStart':    () => this.getLineAtOffset(this.parserRange.start),
      'lineEnd':      () => this.getLineAtOffset(this.parserRange.end),
      'columnStart':  () => this.getColumnAtOffset(this.parserRange.start),
      'columnEnd':    () => this.getColumnAtOffset(this.parserRange.end),
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

  clone(parent, options) {
    return new this.constructor(
      this.parser,
      (arguments.length > 0) ? parent : this,
      Object.assign(Object.create(this.getOptions()), options || {}),
    );
  }

  getParser() {
    return this.parser;
  }

  getInputRange() {
    return new SourceRange(0, this.getInputStream().length);
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
    if (value && typeof value[VIRTUAL_RESOLVER] === 'function')
      return this.resolveValue(value[VIRTUAL_RESOLVER](options), options);

    return value;
  }

  resolvePrimitive(value, options) {
    let resolved = this.resolveValue(value, options);
    if (resolved && typeof resolved.get === 'function') {
      let primitiveValue = resolved.get(Utils.TO_PRIMITIVE_SYMBOL);
      if (primitiveValue != null)
        resolved = primitiveValue;
    }

    return resolved;
  }

  // eslint-disable-next-line no-unused-vars
  failResult(value) {
    return new FailureMatcherResult(value);
  }

  tokenResult(_properties) {
    let properties = _properties || {};
    let token = new Token(
      this,
      properties.parent,
      properties,
    );

    return new TokenMatcherResult(token);
  }

  skipResult(skipCount) {
    return new SkipMatcherResult(skipCount);
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

  panicResult(error) {
    return new PanicMatcherResult(this.prepareError(error));
  }

  throwError(_error) {
    let error = this.prepareError(_error);
    throw error;
  }

  cloneToCustomMatcherResult(matcher, matcherResult) {
    let Klass = matcher.constructor[Utils.typeOf(matcherResult)];
    if (!Klass)
      return matcherResult;

    return matcherResult.clone({ Klass });
  }

  async exec(_matcher) {
    let matcher     = _matcher.clone();
    let hasOwnScope = matcher.hasOwnScope();
    let matcherName = ('' + this.resolvePrimitive(this.name));
    let context     = (hasOwnScope) ? this.clone(this) : this;

    if (hasOwnScope) {
      // Set "self" key
      context.set('@', context);
    }

    // Set myself on the scope
    // so that others can reference
    // me with a "Fetch"
    if (this.hasCustomName)
      context.assign({ [matcherName]: this });

    try {
      return await matcher.exec(context);
    } catch (_error) {
      let error = this.prepareError(_error);

      context.debugLog('Internal error encountered:\n', error);

      return context.panicResult(error);
    }
  }
});
