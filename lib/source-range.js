import * as Utils   from './utils.js';
import { TypeBase } from './type-base.js';

function isRelativeCheck(start, end, _relative) {
  return (_relative === true || start < 0 || end < 0 || Object.is(start, -0) || Object.is(end, -0));
}

export const SourceRange = Utils.makeKeysNonEnumerable(class SourceRange extends TypeBase {

  constructor(_options) {
    let options = _options || {};
    let {
      start,
      end,
      relative,
    } = options;

    super(options);

    start = +start;
    end = +end;

    if (!Utils.isType(start, 'Number'))
      start = 0;

    if (!Utils.isType(end, 'Number'))
      end = 0;

    // We need to know if this is relative
    // before we swap the start/end order
    relative = isRelativeCheck(start, end, relative);

    if (start > end && !relative) {
      let tmp = start;
      start = end;
      end = tmp;
    }

    start = Math.floor(start);
    end = Math.floor(end);

    Object.defineProperties(this, {
      [Symbol.toPrimitive]: {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        (hint) => {
          if (hint === 'number')
            return this.start;
          else if (hint === 'string' || hint === 'default')
            return this.toString.call(this);

          return this.valueOf.call(this, hint);
        },
      },
      'start': {
        writable:     true,
        enumerable:   true,
        configurable: true,
        value:        start,
      },
      'end': {
        writable:     true,
        enumerable:   true,
        configurable: true,
        value:        end,
      },
      'relative': {
        writable:     true,
        enumerable:   true,
        configurable: true,
        value:        !!relative,
      },
    });
  }

  isRelative(set) {
    if (arguments.length === 0)
      return isRelativeCheck(this.start, this.end, this.relative);

    this.relative = !!set;

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
      this.relative = start.relative;
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

  clone(options) {
    return super.clone({
      start:    this.start,
      end:      this.end,
      relative: this.relative,
      ...(options || {}),
    });
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
