const { isType }            = require('./utils');
const { SourceRange }       = require('./source-range');
const { Token, SkipToken }  = require('./token');
const { getMatchers }       = require('./matcher-definition');

const VERSION = '0.1.0';

class Parser {
  constructor(_source, _opts) {
    var source  = _source;
    var opts    = Object.assign({ fileName: '<none>' }, _opts || {});

    if (!isType(source, 'string'))
      throw new TypeError('Parser::constructor: first argument must be instance of `string`');

    Object.defineProperties(this, {
      '_source': {
        writable:     false,
        enumerable:   false,
        configurable: true,
        value:        source.valueOf(),
      },
      '_options': {
        writable:     false,
        enumerable:   false,
        configurable: true,
        value:        opts,
      },
      '_errors': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        [],
      },
      '_warnings': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        [],
      }
    });
  }

  getVersion() {
    return VERSION;
  }

  getSourceRangeClass() {
    return SourceRange;
  }

  getTokenClass() {
    return Token;
  }

  getOptions() {
    return this._options;
  }

  createSourceRange(...args) {
    return new (this.getSourceRangeClass())(this, ...args);
  }

  addError(error) {
    this._errors.push(error);
  }

  addWarning(warning) {
    this._warnings.push(warning);
  }

  getErrors() {
    return this._errors;
  }

  getWarnings() {
    return this._warnings;
  }

  clone() {
    return new this.constructor(this._source, this._options);
  }

  getSourceAsString() {
    return this._source;
  }

  getSourceRangeAsString(start, end) {
    var input = this.getSourceAsString();
    if (!arguments.length)
      return input;

    if (start instanceof SourceRange)
      return input.substring(start.start, start.end);

    return input.substring(start, end);
  }

  getLineNumber(input, offset) {
    var chunk = input.substring(0, offset);
    var parts = chunk.split(/\n/);

    return parts.length;
  }

  findNearestNewline(input, offset) {
    if (offset === 0)
      return 0;

    var re = /\n/g;

    for (var i = offset - 1; i >=0; i--) {
      re.lastIndex = i;

      var result = re.exec(input);
      if (!result || result.index !== i)
        continue;

      return i;
    }

    return 0;
  }

  getColumnNumber(input, offset) {
    var newLinePosition = this.findNearestNewline(input, offset);
    return offset - newLinePosition;
  }

  getLinesAndColumnsFromRange(input, _start, _end) {
    var start = _start || 1;
    var end   = _end || input.length;

    if (start instanceof SourceRange) {
      end   = start.end;
      start = start.start;
    }

    return {
      startLine:    this.getLineNumber(input, start),
      endLine:      this.getLineNumber(input, end),
      startColumn:  this.getColumnNumber(input, start),
      endColumn:    this.getColumnNumber(input, end),
    };
  }

  formatErrorMessage(error) {
    const generateStringOfLength = (len, char = ' ') => {
      var parts = new Array(len);
      for (var i = 0; i < len; i++)
        parts[i] = char;

      return parts.join('');
    };

    const displaySourceCode = (parser, sourceRange, prefix) => {
      var sourceString  = parser.getSourceAsString();
      var startOffset   = sourceRange.start - 10;
      var endOffset     = sourceRange.end + 10;
      var before;
      var after;
      var source;

      if (startOffset < 0)
        startOffset = 0;

      if (endOffset > sourceString.length)
        endOffset = sourceString.length;

      before  = sourceString.substring(startOffset, sourceRange.start);
      after   = sourceString.substring(sourceRange.end, endOffset);
      source  = sourceString.substring(sourceRange.start, sourceRange.end);

      return `...${before}${source}${after}...\n${generateStringOfLength(prefix.length + before.length + 3 + ((source.length) ? 0 : -1))}${generateStringOfLength((source.length) ? source.length : 1, '^')}`;
    };

    var {
      message,
      parser,
      sourceRange,
    } = error;

    if (!parser || !sourceRange)
      return message;

    var {
      startLine,
      endLine,
      startColumn,
      endColumn,
    } = this.getLinesAndColumnsFromRange(parser.getSourceAsString(), sourceRange);

    var lineStr   = (startLine === endLine) ? `[${startLine}]` : `[${startLine}-${endLine}]`;
    var columnStr = (startColumn === endColumn) ? `[${startColumn}]` : `[${startColumn}-${endColumn}]`;
    var prefix    = `${message}:${lineStr}${columnStr}: `;

    return `${prefix}${displaySourceCode(parser, sourceRange, prefix)}`;
  }

  formatErrors(_error) {
    var error = _error;
    if (error instanceof Error && !error.errors)
      return [ `${error.message}\n${error.stack}` ];

    var errors = error.errors || error;
    if (!(errors instanceof Array))
      errors = [ errors ];

    var newErrors = [];

    for (var i = 0, il = errors.length; i < il; i++) {
      error = errors[i];

      var {
        message,
        parser,
        sourceRange,
      } = error;

      if (parser && sourceRange)
        message = this.formatErrorMessage(error);

      newErrors.push(message);
    }

    return newErrors;
  }

  displayErrors(_errors) {
    var errors = this.formatErrors(_errors);
    for (var i = 0, il = errors.length; i < il; i++) {
      var error = errors[i];
      console.error(error);
    }
  }

  tokenize(matcher, context) {
    var opts          = this.getOptions();
    var startContext  = Object.assign(
      {
        '_debugLogs': [],
        'debugLevel': opts.debugLevel || 0,
        'debug':      opts.debug || false,
      },
      opts.context || {},
      context || {},
    );

    this._errors    = [];
    this._warnings  = [];

    var token         = getMatchers(matcher).exec(this, 0, startContext);
    var errors        = this.getErrors();

    if (errors.length > 0) {
      var error = new Error('Parsing Error');

      error.parser    = this;
      error.matcher   = matcher;
      error.errors    = errors;
      error.warnings  = this.getWarnings();

      throw error;
    }

    if (token instanceof Token)
      token = token.getOutputToken();

    if (token instanceof SkipToken)
      return;

    if (token instanceof Token)
      return token.remapTokenLinks();

    return token;
  }
}

Parser.VERSION = VERSION;

isType.addType('Parser', (val) => (val instanceof Parser));

module.exports = {
  Parser,
};
