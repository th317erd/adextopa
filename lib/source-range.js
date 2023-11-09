import { VIRTUAL_RESOLVER } from './value-resolver.js';

export class SourceRange {
  constructor(_start, _end) {
    let start = _start || 0;
    let end   = _end || 0;

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
    });
  }

  setStart(value) {
    this.start = value;
    return this;
  }

  setEnd(value) {
    this.end = value;
    return this;
  }

  clone() {
    return new this.constructor(this.start, this.end);
  }

  fetchProp(context, keyName, defaultValue = null) {
    let fetchableProps = {
      '$default': this.start,
      'start':    this.start,
      'end':      this.end,
    };

    if (Object.prototype.hasOwnProperty.call(fetchableProps, keyName))
      return fetchableProps[keyName];

    return defaultValue;
  }

  [Symbol.for('nodejs.util.inspect.custom')]() {
    return {
      ...this.toJSON(),
      $type: SourceRange,
    };
  }

  toJSON() {
    return {
      start:  this.start,
      end:    this.end,
    };
  }
}