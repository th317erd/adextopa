import * as Utils   from '../utils.js';
import { TypeBase } from '../type-base.js';

const PANIC          = Symbol.for('/adextopa/result/panic');
const FAILED         = Symbol.for('/adextopa/result/failed');
const HALT           = Symbol.for('/adextopa/result/halt');
const BREAK          = Symbol.for('/adextopa/result/break');
const CONTINUE       = Symbol.for('/adextopa/result/continue');
const TOKEN          = Symbol.for('/adextopa/result/token');
const CAPTURED_RANGE = Symbol.for('/adextopa/result/capturedRange');
const MATCHED_RANGE  = Symbol.for('/adextopa/result/matchedRange');
const PARSER_RANGE   = Symbol.for('/adextopa/result/parserRange');
const PARSER_OFFSET  = Symbol.for('/adextopa/result/parserOffset');

export const MatcherResult = Utils.makeKeysNonEnumerable(class MatcherResult extends TypeBase {
  static [Utils.TYPE_SYMBOL] = 'MatcherResult';

  static PANIC          = PANIC;
  static FAILED         = FAILED;
  static HALT           = HALT;
  static BREAK          = BREAK;
  static CONTINUE       = CONTINUE;
  static TOKEN          = TOKEN;
  static CAPTURED_RANGE = CAPTURED_RANGE;
  static MATCHED_RANGE  = MATCHED_RANGE;
  static PARSER_RANGE   = PARSER_RANGE;
  static PARSER_OFFSET  = PARSER_OFFSET;

  constructor(parent) {
    super();

    Object.defineProperties(this, {
      'parent': {
        writable:     false,
        enumerable:   false,
        configurable: true,
        value:        parent || null,
      },
      'properties': {
        writable:     false,
        enumerable:   false,
        configurable: true,
        value:        new Map(),
      },
    });
  }

  get(key, defaultValue) {
    if (this.parent && !this.properties.has(key))
      return this.parent.get(key, defaultValue);

    let value = this.properties.get(key);
    if (value == null)
      return defaultValue;

    return value;
  }

  set(key, value) {
    this.properties.set(key, value);
    return this;
  }

  panic(value) {
    if (arguments.length === 0)
      return this.get(PANIC);

    return this.set(PANIC, value);
  }

  failed(value) {
    if (arguments.length === 0)
      return this.get(FAILED);

    return this.set(FAILED, !!value);
  }

  halt(value) {
    if (arguments.length === 0)
      return this.get(HALT);

    return this.set(HALT, !!value);
  }

  break(target) {
    if (arguments.length === 0)
      return this.get(BREAK);

    return this.set(BREAK, target || null);
  }

  continue(target) {
    if (arguments.length === 0)
      return this.get(CONTINUE);

    return this.set(CONTINUE, target || null);
  }

  token(token) {
    if (arguments.length === 0)
      return this.get(TOKEN);

    return this.set(TOKEN, token);
  }

  capturedRange(range) {
    if (arguments.length === 0)
      return this.get(CAPTURED_RANGE);

    return this.set(CAPTURED_RANGE, range);
  }

  matchedRange(range) {
    if (arguments.length === 0)
      return this.get(MATCHED_RANGE);

    return this.set(MATCHED_RANGE, range);
  }

  parserRange(range) {
    if (arguments.length === 0)
      return this.get(PARSER_RANGE);

    return this.set(PARSER_RANGE, range);
  }

  parserOffset(range) {
    if (arguments.length === 0)
      return this.get(PARSER_OFFSET);

    return this.set(PARSER_OFFSET, range);
  }
});
