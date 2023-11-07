import { SourceRange }    from './source-range.js';
import { MatcherResult }  from './matcher-result.js';

const DEBUG_POSITION_WINDOW_SIZE = 10;

// Many thanks to Bud Damyanov for the following
// table of escape sequences!
// https://stackoverflow.com/a/41407246

const COLOR_TABLE = {
  'reset':              '\x1b[0m',
  'effect:bright':      '\x1b[1m',
  'effect:dim':         '\x1b[2m',
  'effect:underscore':  '\x1b[4m',
  'effect:blink':       '\x1b[5m',
  'effect:reverse':     '\x1b[7m',
  'effect:hidden':      '\x1b[8m',

  'fg:black':           '\x1b[30m',
  'fg:red':             '\x1b[31m',
  'fg:green':           '\x1b[32m',
  'fg:yellow':          '\x1b[33m',
  'fg:blue':            '\x1b[34m',
  'fg:magenta':         '\x1b[35m',
  'fg:cyan':            '\x1b[36m',
  'fg:white':           '\x1b[37m',
  'fg:gray':            '\x1b[90m',

  'bg:black':           '\x1b[40m',
  'bg:red':             '\x1b[41m',
  'bg:green':           '\x1b[42m',
  'bg:yellow':          '\x1b[43m',
  'bg:blue':            '\x1b[44m',
  'bg:magenta':         '\x1b[45m',
  'bg:cyan':            '\x1b[46m',
  'bg:white':           '\x1b[47m',
  'bg:gray':            '\x1b[100m',
};

export class ParserContext {
  static cloneScope(sourceScope) {
    let scope = new Map();
    for (let [ key, value ] of sourceScope.entries())
      scope.set(key, value);

    return scope;
  }

  constructor(parser, _opts) {
    let opts = _opts || {};

    if (!parser)
      throw new TypeError('ParserContext: "parser" is a required argument.');

    Object.defineProperties(this, {
      [Symbol.for('/adextopa/types/type')]: {
        writable:     false,
        enumerable:   false,
        configurable: false,
        value:        'ParserContext',
      },
      'parser': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        parser,
      },
      'scope': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        opts.scope || new Map(),
      },
      'range': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        new SourceRange(
          (opts.range && opts.range.start) || 0,
          (opts.range && opts.range.end) || parser.getSource().length,
        ),
      },
      'debug': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        opts.debug || false,
      },
      'debugColors': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        (typeof opts.debugColors === 'boolean') ? opts.debugColors : (opts.debug || false),
      },
    });
  }

  fetchProp(context, keyName) {
    let fetchableProps = {
      '$default': this.range.start,
      'offset':   this.range.start,
      'range':    this.range,
    };

    if (!Object.prototype.hasOwnProperty.call(fetchableProps, keyName))
      return;

    return fetchableProps[keyName];
  }

  setDebugMode(value) {
    this.debug = !!value;
  }

  setDebugColors(value) {
    this.debugColors = !!value;
  }

  debugValue(value, primaryColor) {
    let formattedValue = ('' + value)
      .replace(/\r/g, `${this.debugColor('bg:yellow')}\\r${this.debugColor('bg:black')}`)
      .replace(/\n/g, `${this.debugColor('bg:yellow')}\\n${this.debugColor('bg:black')}`)
      .replace(/\t/g, `${this.debugColor('bg:yellow')}\\t${this.debugColor('bg:black')}`);

    return `${this.debugColor(primaryColor || 'fg:magenta')}${formattedValue}${this.debugColor('reset')}`;
  }

  debugLog(...args) {
    if (!this.debug)
      return;

    console.debug(...args);
  }

  debugColor(colorCommands, _content) {
    let content = _content;
    if (typeof content === 'symbol')
      content = content.toString();

    if (content == null)
      content = '';

    if (!this.debugColors)
      return ('' + content);

    const getColorEscapeSequence = (colorCommands) => {
      return colorCommands
        .split(/;/g)
        .map((part) => part.trim())
        .map((part) => {
          if (!Object.prototype.hasOwnProperty.call(COLOR_TABLE, part))
            return '';

          return COLOR_TABLE[part];
        })
        .join('');
    };

    let escapeSequence = getColorEscapeSequence(colorCommands);
    return (content) ? `${escapeSequence}${content}${getColorEscapeSequence('reset')}` : escapeSequence;
  }

  debugPosition(..._args) {
    let source          = this.getSource();
    let debugStrPrefix  = this.debugValue(source.substring(Math.max(this.range.start - DEBUG_POSITION_WINDOW_SIZE, 0), this.range.start), 'fg:green');
    let debugStr        = this.debugValue(source.substring(this.range.start, this.range.start + 1), 'fg:yellow');
    let debugStrPostfix = this.debugValue(source.substring(this.range.start + 1, Math.min(this.range.start + DEBUG_POSITION_WINDOW_SIZE, this.range.end)), 'fg:yellow');

    return `${debugStrPrefix}${this.debugColor('reset;effect:blinking;bg:red')}🞂${this.debugColor('fg:yellow;bg:cyan')}${debugStr}${this.debugColor('reset;fg:yellow')}${debugStrPostfix}${this.debugColor('reset')}`;
  }

  collectClonableProps() {
    return {
      scope:        this.scope,
      range:        this.range,
      debug:       this.debug,
      debugColors:  this.debugColors,
    };
  }

  clone(newScope) {
    return new this.constructor(
      this.parser,
      {
        ...(this.collectClonableProps() || {}),
        scope: (newScope) ? this.constructor.cloneScope(this.scope) : this.scope,
      },
    );
  }

  cloneWithRange(newRange) {
    return new this.constructor(
      this.parser,
      {
        ...(this.collectClonableProps() || {}),
        range: newRange,
      },
    );
  }

  getSource() {
    let parser = this.parser;
    if (!parser)
      return '';

    return parser.source || '';
  }

  getFileName() {
    let parser = this.parser;
    if (!parser)
      return '';

    return parser.fileName || '';
  }

  getLineAtOffset(offset) {
    let source = this.getSource();
    let lineCount = source.substring(0, offset).split(/\r\n|\r|\n/g).length;

    return lineCount;
  }

  getColumnAtOffset(offset) {
    let source    = this.getSource();
    let lines     = source.substring(0, offset).split(/\r\n|\r|\n/g);
    let lastLine  = lines[lines.length - 1] || '';

    return lastLine.length;
  }

  [MatcherResult.RESULT_BREAK](result) {
    if (result.payload)
      return this[result.payload.type](result.payload);

    return result;
  }

  [MatcherResult.RESULT_CONTINUE](result) {
    if (result.payload)
      return this[result.payload.type](result.payload);

    return result;
  }

  [MatcherResult.RESULT_EMPTY](result) {
    if (result.payload)
      return this[result.payload.type](result.payload);

    return result;
  }

  [MatcherResult.RESULT_FAIL](result) {
    if (result.payload)
      return this[result.payload.type](result.payload);

    return result;
  }

  [MatcherResult.RESULT_HALT](result) {
    if (result.payload)
      return this[result.payload.type](result.payload);

    return result;
  }

  [MatcherResult.RESULT_PANIC](result) {
    throw result.value;
  }

  [MatcherResult.RESULT_PROXY_CHILDREN](result) {
    return result;
  }

  [MatcherResult.RESULT_TOKEN](result) {
    return result;
  }

  [MatcherResult.RESULT_SKIP](result) {
    return result;
  }

  async tokenize(matcher) {
    let result = await matcher.run(this);
    if (!result)
      return;

    return this[result.type](result);
  }
}

// Make static members non-enumberable
Object.keys(ParserContext).forEach((staticPropertyName) => {
  Object.defineProperties(ParserContext, {
    [staticPropertyName]: {
      writable:     false,
      enumerable:   false,
      configurable: true,
      value:        ParserContext[staticPropertyName],
    },
  });
});