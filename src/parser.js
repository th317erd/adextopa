const { isType }              = require('./utils');
const { SourceRange }         = require('./source-range');
const { Token, getMatchers }  = require('./token');

const VERSION = '0.1.0';

class Parser {
  constructor(_source, _opts) {
    var source  = _source,
        opts    = Object.assign({}, _opts || {});

    if (!isType(source, 'string'))
      throw new TypeError('Parser::constructor: first argument must be instance of `string`');

    Object.defineProperties(this, {
      _source: {
        writable: false,
        enumerable: false,
        configurable: true,
        value: source.valueOf()
      },
      _options: {
        writable: false,
        enumerable: false,
        configurable: true,
        value: opts
      },
      _errors: {
        writable: true,
        enumerable: false,
        configurable: true,
        value: []
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

  getErrors() {
    return this._errors;
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
    var chunk = input.substring(0, offset),
        parts = chunk.split(/\n/);

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
    var start = _start || 1,
        end   = _end || input.length;

    if (start instanceof SourceRange) {
      end = start.end;
      start = start.start;
    }

    return {
      startLine:    this.getLineNumber(input, start),
      endLine:      this.getLineNumber(input, end),
      startColumn:  this.getColumnNumber(input, start),
      endColumn:    this.getColumnNumber(input, end)
    };
  }

  tokenize(matcher, context) {
    var opts          = this.getOptions(),
        startContext  = Object.assign({ _debugLogs: [] }, opts.context || {}, context || {}, (opts.debug) ? { debug: true, debugLevel: 0 } : {}),
        token         = getMatchers(matcher).exec(this, 0, startContext),
        errors        = this.getErrors();

    if (errors.length > 0)
      throw new Error('Parsing Error');

    return token;
  }
}

Parser.VERSION = VERSION;

isType.addType('Parser', (val) => (val instanceof Parser));

module.exports = {
  Parser
};
