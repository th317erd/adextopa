/* eslint-disable no-cond-assign */

import * as Utils   from '../utils.js';
import { TypeBase } from '../type-base.js';

const PANIC           = Symbol.for('/adextopa/result/panic');
const FAILED          = Symbol.for('/adextopa/result/failed');
const HALT            = Symbol.for('/adextopa/result/halt');
const BREAK           = Symbol.for('/adextopa/result/break');
const CONTINUE        = Symbol.for('/adextopa/result/continue');
const TOKEN           = Symbol.for('/adextopa/result/token');
const VALUE           = Symbol.for('/adextopa/result/value');
const CAPTURED_RANGE  = Symbol.for('/adextopa/result/capturedRange');
const MATCHED_RANGE   = Symbol.for('/adextopa/result/matchedRange');
const PARSER_RANGE    = Symbol.for('/adextopa/result/parserRange');
const PARSER_OFFSET   = Symbol.for('/adextopa/result/parserOffset');

const PROPERTY_NAME_MAP = {
  [PANIC]:          'panic',
  [FAILED]:         'failed',
  [HALT]:           'halt',
  [BREAK]:          'break',
  [CONTINUE]:       'continue',
  [TOKEN]:          'token',
  [VALUE]:          'value',
  [CAPTURED_RANGE]: 'capturedRange',
  [MATCHED_RANGE]:  'matchedRange',
  [PARSER_RANGE]:   'parserRange',
  [PARSER_OFFSET]:  'parserOffset',
};

export const MatcherResult = Utils.makeKeysNonEnumerable(class MatcherResult extends TypeBase {
  static [Utils.TYPE_SYMBOL] = 'MatcherResult';

  static PANIC          = PANIC;
  static FAILED         = FAILED;
  static HALT           = HALT;
  static BREAK          = BREAK;
  static CONTINUE       = CONTINUE;
  static TOKEN          = TOKEN;
  static VALUE          = VALUE;
  static CAPTURED_RANGE = CAPTURED_RANGE;
  static MATCHED_RANGE  = MATCHED_RANGE;
  static PARSER_RANGE   = PARSER_RANGE;
  static PARSER_OFFSET  = PARSER_OFFSET;

  constructor(context, parent) {
    super();

    Object.defineProperties(this, {
      'context': {
        writable:     false,
        enumerable:   false,
        configurable: true,
        value:        context || null,
      },
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

    const generateGetter = (key) => {
      return () => this.get(key);
    };

    const generateSetter = (key) => {
      return (value) => {
        this.set(key, value);
      };
    };

    let propertyNameKeys = Object.getOwnPropertySymbols(PROPERTY_NAME_MAP);
    for (let i = 0, il = propertyNameKeys.length; i < il; i++) {
      let key = propertyNameKeys[i];
      Object.defineProperty(this, PROPERTY_NAME_MAP[key], {
        enumerable:   false,
        configurable: true,
        get:          generateGetter(key),
        set:          generateSetter(key),
      });
    }
  }

  resolve() {
    let value;

    if (value = this.get(PANIC))
      return value;
    else if (value = this.get(FAILED))
      return this.context.prepareError('Matcher failed');
    else if (value = this.get(TOKEN))
      return value;
    else if (value = this.get(VALUE))
      return value;
    else if (value = this.get(MATCHED_RANGE))
      return value;
    else if (value = this.get(HALT))
      return HALT;
    else if (value = this.get(BREAK))
      return BREAK;
    else if (value = this.get(CONTINUE))
      return CONTINUE;
  }

  [Symbol.toPrimitive](hint) {
    if (hint === 'number') {
      let token = this.get(TOKEN);
      let range = ((token && token.matchedRange) || this.get(MATCHED_RANGE));
      return (range) ? range.start : Infinity;
    } else if (hint === 'string' || hint === 'default') {
      let value = this.resolve.call(this);
      return (value && typeof value.toString === 'function') ? value.toString() : ('' + value);
    }

    return this.valueOf.call(this, hint);
  }

  toString() {
    return ('' + this.resolve());
  }

  valueOf() {
    return this.resolveValue();
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

  setPanic(value) {
    return this.set(PANIC, value);
  }

  setFailed(value) {
    return this.set(FAILED, !!value);
  }

  setHalt(value) {
    return this.set(HALT, !!value);
  }

  setBreak(target) {
    return this.set(BREAK, target || null);
  }

  setContinue(target) {
    return this.set(CONTINUE, target || null);
  }

  setToken(token) {
    return this.set(TOKEN, token);
  }

  setValue(value) {
    return this.set(VALUE, value);
  }

  setCapturedRange(range) {
    if (arguments.length === 0)
      return this.get(CAPTURED_RANGE);

    return this.set(CAPTURED_RANGE, range);
  }

  setMatchedRange(range) {
    if (arguments.length === 0)
      return this.get(MATCHED_RANGE);

    return this.set(MATCHED_RANGE, range);
  }

  setParserRange(range) {
    if (arguments.length === 0)
      return this.get(PARSER_RANGE);

    return this.set(PARSER_RANGE, range);
  }

  setParserOffset(range) {
    if (arguments.length === 0)
      return this.get(PARSER_OFFSET);

    return this.set(PARSER_OFFSET, range);
  }

  isSuccessful() {
    if (this.get(PANIC) || this.get(FAILED))
      return false;

    if (this.get(TOKEN))
      return true;

    return false;
  }
});
