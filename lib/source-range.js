export class SourceRange {
  constructor(_start, _end, isRelative) {
    let start = _start;
    let end   = _end;

    if (start == null)
      start = 0;

    if (end == null)
      end = 0;

    // If constructor was passed object format:
    // new SourceRange({ start, end })
    if (typeof start == 'object' && !(start instanceof Number)) {
      end = start.end;
      start = start.start;
    }

    if (start instanceof SourceRange) {
      end = start.end;
      start = start.start;
    }

    Object.defineProperties(this, {
      [Symbol.for('/adextopa/types/type')]: {
        writable:     false,
        enumerable:   false,
        configurable: false,
        value:        'SourceRange',
      },
      'start': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        start,
      },
      'end': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        end,
      },
      '_isRelative': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        !!isRelative,
      },
    });
  }

  isRelative(set) {
    if (arguments.length === 0)
      return (this._isRelative === true || this.start < 0 || this.end < 0 || Object.is(this.start, -0) || Object.is(this.end, -0));

    this._isRelative = !!set;

    return this;
  }

  setStart(value) {
    this.start = value;
    return this;
  }

  setEnd(value) {
    this.end = value;
    return this;
  }

  setTo(range) {
    this.start = range.start;
    this.end = range.end;
    return this;
  }

  addRange(range) {
    this.start += range.start;
    this.end += range.end;
    return this;
  }

  ensureBounds(...ranges) {
    let minStart  = Math.max(...ranges.map((r) => r.start));
    let minEnd    = Math.min(...ranges.map((r) => r.end));

    if (minStart > minEnd) {
      let tmp = minStart;
      minStart = minEnd;
      minEnd = tmp;
    }

    if (this.start < minStart)
      this.start = minStart;

    if (this.end > minEnd)
      this.end = minEnd;

    return this;
  }

  clone() {
    return new this.constructor(this.start, this.end);
  }

  fetchProp(context, keyName, opts) {
    let fetchableProps = {
      '$default': this.start,
      'start':    this.start,
      'end':      this.end,
    };

    if (Object.prototype.hasOwnProperty.call(fetchableProps, keyName))
      return fetchableProps[keyName];

    return (opts && opts.defaultValue);
  }

  [Symbol.for('nodejs.util.inspect.custom')]() {
    return {
      ...this.toJSON(),
      $type: SourceRange,
    };
  }

  toString() {
    return `{ start: ${this.start}, end: ${this.end} }`;
  }

  toJSON() {
    return {
      start:  this.start,
      end:    this.end,
    };
  }
}
