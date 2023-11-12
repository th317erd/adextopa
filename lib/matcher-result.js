/* eslint-disable no-magic-numbers */

const RESULT_EMPTY          = Symbol.for('/adextopa/results/empty');
const RESULT_PANIC          = Symbol.for('/adextopa/results/error');
const RESULT_FAIL           = Symbol.for('/adextopa/results/fail');
const RESULT_HALT           = Symbol.for('/adextopa/results/stop');
const RESULT_BREAK          = Symbol.for('/adextopa/results/break');
const RESULT_CONTINUE       = Symbol.for('/adextopa/results/continue');
const RESULT_SKIP           = Symbol.for('/adextopa/results/skip');
const RESULT_SEEK           = Symbol.for('/adextopa/results/seek');
const RESULT_TOKEN          = Symbol.for('/adextopa/results/token');

export class MatcherResult {
  static RESULT_EMPTY           = RESULT_EMPTY;
  static RESULT_PANIC           = RESULT_PANIC;
  static RESULT_FAIL            = RESULT_FAIL;
  static RESULT_HALT            = RESULT_HALT;
  static RESULT_BREAK           = RESULT_BREAK;
  static RESULT_CONTINUE        = RESULT_CONTINUE;
  static RESULT_SKIP            = RESULT_SKIP;
  static RESULT_SEEK            = RESULT_SEEK;
  static RESULT_TOKEN           = RESULT_TOKEN;

  static clone(item, ...args) {
    let props = Object.assign({
      type:     item.type,
      value:    item.value,
      payload:  item.payload,
      options:  item.options,
    }, ...args);

    let c = new this(props.type, props.value, props.payload);

    delete props.type;
    delete props.value;
    delete props.payload;
    delete props.options;

    return Object.assign(c, props);
  }

  static cloneMatcherResult(matcherResult, ...args) {
    let cloneMethod = (typeof matcherResult.constructor.clone === 'function') ? matcherResult.constructor.clone : MatcherResult.clone;
    let thisContext = (typeof matcherResult.constructor.clone === 'function') ? matcherResult.constructor : MatcherResult;

    return cloneMethod.call(thisContext, matcherResult, ...args);
  }

  constructor(type, value, payload, options) {
    Object.defineProperties(this, {
      [Symbol.for('/adextopa/types/type')]: {
        writable:     false,
        enumerable:   false,
        configurable: false,
        value:        'MatcherResult',
      },
      'type': {
        writable:     false,
        enumerable:   false,
        configurable: true,
        value:        type,
      },
      'value': {
        writable:     false,
        enumerable:   false,
        configurable: true,
        value:        value || null,
      },
      'payload': {
        writable:     false,
        enumerable:   false,
        configurable: true,
        value:        payload || null,
      },
      'options': {
        writable:     false,
        enumerable:   false,
        configurable: true,
        value:        Object.assign({}, options || {}),
      },
    });
  }

  getOptions() {
    return this.options;
  }

  clone(...args) {
    return this.constructor.cloneMatcherResult(this, ...args);
  }

  fetchProp(context, keyName, opts) {
    let fetchableProps = {
      '$default': this.value,
      'value':    this.value,
    };

    if (Object.prototype.hasOwnProperty.call(fetchableProps, keyName))
      return fetchableProps[keyName];

    return (opts && opts.defaultValue);
  }

  [Symbol.for('nodejs.util.inspect.custom')]() {
    return {
      ...this.toJSON(),
      $type: MatcherResult,
    };
  }

  toJSON() {
    return {
      type:     this.type,
      value:    this.value,
      payload:  this.payload,
    };
  }
}

// Make static members non-enumberable
Object.keys(MatcherResult).forEach((staticPropertyName) => {
  Object.defineProperties(MatcherResult, {
    [staticPropertyName]: {
      writable:     false,
      enumerable:   false,
      configurable: true,
      value:        MatcherResult[staticPropertyName],
    },
  });
});
