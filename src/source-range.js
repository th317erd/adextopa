const { isType } = require('./utils');

class SourceRange {
  constructor(_parser, _start, _end) {
    var parser  = _parser;
    var start   = _start;
    var end     = _end;

    if (!isType(parser, 'Parser'))
      throw new TypeError('SourceRange::constructor: First argument must a instance of `Parser`');

    if (isType(start, 'SourceRange')) {
      end   = start.end;
      start = start.start;
    }

    Object.defineProperties(this, {
      '_parser': {
        writable:     false,
        enumerable:   false,
        configurable: true,
        value:        parser,
      },
      'start': {
        enumerable:   false,
        configurable: true,
        get: () =>    start,
        set: (val) => (start = val),
      },
      'end': {
        enumerable:   false,
        configurable: true,
        get: () =>    end,
        set: (val) => (end = val),
      },
      'value': {
        enumerable:   false,
        configurable: true,
        get: () =>    (this._parser.getSourceRangeAsString(this)),
        set: () =>    {}, // noop
      },
    });
  }

  toString() {
    return `{${this.start}-${this.end}}[${this.value}]`;
  }

  clone() {
    return new this.constructor(this.getParser(), this.start, this.end);
  }

  getParser() {
    return this._parser;
  }
}

isType.addType('SourceRange', (val) => (val instanceof SourceRange));

module.exports = {
  SourceRange
};
