import * as Utils   from './utils.js';
import { TypeBase } from './type-base.js';

function isRelativeCheck(start, end, _relative) {
  return (_relative === true || start < 0 || end < 0 || Object.is(start, -0) || Object.is(end, -0));
}

export const SourceRange = Utils.makeKeysNonEnumerable(class SourceRange extends TypeBase {
  static [Utils.TYPE_SYMBOL] = 'SourceRange';

  constructor(_start, _end, _isRelative) {
    super();

    let start       = +_start;
    let end         = +_end;
    let isRelative  = _isRelative;

    // If constructor was passed object format:
    // new SourceRange({ start, end })
    if (Utils.isPlainObject(_start)) {
      isRelative = (Utils.isType(_start.relative, 'Boolean')) ? _start.relative : _start.isRelative;
      end = +_start.end;
      start = +_start.start;
    }

    if (Utils.isType(_start, 'SourceRange')) {
      end = +_start.end;
      start = +_start.start;
      isRelative = _start.isRelative();
    }

    if (!Utils.isType(start, 'Number'))
      start = 0;

    if (!Utils.isType(end, 'Number'))
      end = 0;

    // We need to know if this is relative
    // before we swap the start/end order
    isRelative = isRelativeCheck(start, end, isRelative);

    if (start > end && !isRelative) {
      let tmp = start;
      start = end;
      end = tmp;
    }

    start = Math.floor(start);
    end = Math.floor(end);

    Object.defineProperties(this, {
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
      '_relative': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        !!isRelative,
      },
    });
  }

  isRelative(set) {
    if (arguments.length === 0)
      return isRelativeCheck(this.start, this.end, this._relative);

    this._relative = !!set;

    return this;
  }

  setStart(value) {
    this.start = value;
    return this;
  }

  addToStart(value) {
    this.start += value;
    return this;
  }

  setEnd(value) {
    this.end = value;
    return this;
  }

  addToEnd(value) {
    this.end += value;
    return this;
  }

  setTo(start, end) {
    if (Utils.isType(start, 'SourceRange')) {
      this.start = start.start;
      this.end = start.end;
    } else {
      this.start = +start;
      this.end = +end;
    }

    return this;
  }

  addTo(start, end) {
    if (Utils.isType(start, 'SourceRange')) {
      this.start += start.start;
      this.end += start.end;
    } else {
      this.start += (+start);
      this.end += (+end);
    }

    return this;
  }

  clampTo(...ranges) {
    if (!ranges.length)
      return this;

    let maxStart  = Math.max(...ranges.map((r) => r.start));
    let minEnd    = Math.min(...ranges.map((r) => r.end));

    if (maxStart > minEnd) {
      let tmp = maxStart;
      maxStart = minEnd;
      minEnd = tmp;
    }

    if (this.start < maxStart)
      this.start = maxStart;

    if (this.end > minEnd)
      this.end = minEnd;

    return this;
  }

  expandTo(...ranges) {
    if (!ranges.length)
      return this;

    let minStart  = Math.min(...ranges.map((r) => r.start));
    let maxEnd    = Math.max(...ranges.map((r) => r.end));

    if (minStart > maxEnd) {
      let tmp = minStart;
      minStart = maxEnd;
      maxEnd = tmp;
    }

    if (this.start > minStart)
      this.start = minStart;

    if (this.end < maxEnd)
      this.end = maxEnd;

    return this;
  }

  clone(start, end, isRelative) {
    if (Utils.isPlainObject(start))
      return new this.constructor(start);

    return new this.constructor(
      (Utils.isType(start, 'Number')) ? start : this.start,
      (Utils.isType(end, 'Number')) ? end : this.end,
      (Utils.isType(isRelative, 'Boolean')) ? isRelative : this.isRelative(),
    );
  }

  [Symbol.toPrimitive](hint) {
    if (hint === 'number')
      return this.start;
    else if (hint === 'string' || hint === 'default')
      return this.toString.call(this);

    return this.valueOf.call(this, hint);
  }

  toString() {
    return `[${this.start}:${this.end}/${this.isRelative()}]`;
  }

  valueOf() {
    return this;
  }

  dynamicProperties() {
    return {
      '$type:Number':       () => this.start,
      '$type:SourceRange':  () => this.clone(),
      'start':              () => this.start,
      'end':                () => this.end,
      'size':               () => Math.abs(this.end - this.start),
    };
  }

  [Symbol.for('nodejs.util.inspect.custom')]() {
    return this.toJSON();
  }

  toJSON(...args) {
    return {
      ...super.toJSON(...args),
      start:    this.start,
      end:      this.end,
      relative: this.isRelative(),
    };
  }
});
