import { MatcherResult }  from './matcher-result.js';
import { SourceRange }    from './source-range.js';
import { Token }          from './token.js';

const VIRTUAL_RESOLVER = Symbol.for('/adextopa/constants/virtual_resolver');

const HELPER_CONTEXT = {
  fetchArgs: function(context, collectorCallback) {
    return collectorCallback(context);
  },
  typeOf: function(...types) {
    return (value) => {
      if (types.some((type) => (typeof type === 'string' && typeof value === type.toLowerCase())))
        return true;

      if (types.some((type) => (typeof type === 'function' && type.name && typeof value === type.name.toLowerCase())))
        return true;

      if (types.some((type) => (typeof type === 'function' && value instanceof type)))
        return true;

      return false;
    };
  },
  isAny: function(value, ...args) {
    if (args.length === 0)
      return false;

    for (let i = 0, il = args.length; i < il; i++) {
      let arg = args[i];
      if (arg(value))
        return true;
    }

    return false;
  },
  isAll: function(value, ...args) {
    if (args.length === 0)
      return false;

    for (let i = 0, il = args.length; i < il; i++) {
      let arg = args[i];
      if (!arg(value))
        return false;
    }

    return true;
  },
};

const thisScope = this;

const createHelperContext = (params) => {
  let base = Object.assign(
    Object.create(HELPER_CONTEXT),
    params || {},
  );

  base.fetchArgs = HELPER_CONTEXT.fetchArgs.bind(thisScope, base);

  return base;
};

export class Matcher {
  static VIRTUAL_RESOLVER = VIRTUAL_RESOLVER;

  static createHelper(callback) {
    return (...args) => {
      return callback(createHelperContext({ args }));
    };
  }

  static isVirtualMatcher(value) {
    return (value && typeof value.isVirtual === 'function' && value.isVirtual() === true);
  }

  static isVirtual() {
    return false;
  }

  static isConsuming() {
    return true;
  }

  static hasOwnScope() {
    return false;
  }

  isVirtual() {
    return this.constructor.isVirtual();
  }

  isConsuming() {
    return this.constructor.isConsuming();
  }

  hasOwnScope() {
    return this.constructor.hasOwnScope();
  }

  constructor(_opts) {
    let opts = _opts || {};
    let name = opts.name || null;

    Object.defineProperties(this, {
      [Symbol.for('/adextopa/types/type')]: {
        writable:     false,
        enumerable:   false,
        configurable: false,
        value:        'Matcher',
      },
      '_options': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        opts,
      },
      'hasCustomName': {
        enumerable:   false,
        configurable: true,
        get:          () => !!name,
      },
      'name': {
        enumerable:   false,
        configurable: true,
        get:          () => name || this.constructor.name,
        set:          (_name) => {
          name = _name;
        },
      },
    });
  }

  getOptions() {
    return this._options;
  }

  set(key, value) {
    this[key] = value;
    return this;
  }

  clone() {
    return new this.constructor(this._options);
  }

  resolveValue(context, value, opts) {
    if (value && typeof value[VIRTUAL_RESOLVER] === 'function')
      return this.resolveValue(context, value[VIRTUAL_RESOLVER](context, opts), opts);

    return value;
  }

  tokenResult(context, tokenProps, payload) {
    return new MatcherResult(
      MatcherResult.RESULT_TOKEN,
      (tokenProps instanceof Token) ? tokenProps : new Token(
        context,
        {
          name: ('' + this.resolveValue(context, this.name, { wantPrimitiveValue: true })),
          ...(tokenProps || {}),
        },
      ),
      payload,
    );
  }

  skipResult(context, skipCount, payload) {
    return new MatcherResult(MatcherResult.RESULT_SKIP, skipCount, payload);
  }

  seekResult(context, range, payload) {
    return new MatcherResult(MatcherResult.RESULT_SEEK, range, payload);
  }

  breakResult(context, name, payload) {
    return new MatcherResult(MatcherResult.RESULT_BREAK, name, payload);
  }

  continueResult(context, name, payload) {
    return new MatcherResult(MatcherResult.RESULT_CONTINUE, name, payload);
  }

  // eslint-disable-next-line no-unused-vars
  haltResult(context, value = null, payload = null) {
    return new MatcherResult(MatcherResult.RESULT_HALT, value, payload);
  }

  // eslint-disable-next-line no-unused-vars
  failResult(context, value = null, payload = null) {
    return new MatcherResult(MatcherResult.RESULT_FAIL, value, payload);
  }

  panicResult(context, _error, payload) {
    let error = _error;
    if (typeof error === 'string')
      error = new Error(error);

    if (!error.parserContext)
      error.parserContext = context;

    if (error.lineStart == null)
      error.lineStart = context.getLineAtOffset(context.range.start);

    if (error.lineEnd == null)
      error.lineEnd = context.getLineAtOffset(context.range.end);

    if (error.columnStart == null)
      error.columnStart = context.getColumnAtOffset(context.range.start);

    if (error.columnEnd == null)
      error.columnEnd = context.getColumnAtOffset(context.range.end);

    return new MatcherResult(MatcherResult.RESULT_PANIC, error, payload);
  }

  throwError(context, _error) {
    let error = _error;
    if (typeof error === 'string')
      error = new Error(error);

    if (!error.parserContext)
      error.parserContext = context;

    throw error;
  }

  getRangeBounds(rangeName, _tokens) {
    let tokens = _tokens;
    if (!Array.isArray(tokens))
      tokens = [ tokens ];

    let smallest  = Infinity;
    let largest   = -Infinity;

    for (let i = 0, il = tokens.length; i < il; i++) {
      let token = tokens[i];
      if (!token)
        continue;

      let range = token[rangeName];
      if (!range)
        continue;

      if (range.start < smallest)
        smallest = range.start;

      if (range.end > largest)
        largest = range.end;
    }

    if (Object.is(smallest, Infinity))
      smallest = 0;

    if (Object.is(largest, -Infinity))
      largest = 0;

    if (smallest > largest) {
      let temp = smallest;
      smallest = largest;
      largest = temp;
    }

    return new SourceRange(smallest, largest);
  }

  getCapturedRangeBounds(tokens) {
    return this.getRangeBounds('capturedRange', tokens);
  }

  getMatchedRangeBounds(tokens) {
    return this.getRangeBounds('matchedRange', tokens);
  }

  // async beforeExec(context) {
  // }

  // async exec(context) {
  // }

  // async afterExec(context) {
  // }

  buildNewContext(context, newScope) {
    let newContext = context.clone(newScope);
    return newContext;
  }

  async run(context) {
    let hasOwnScope = this.hasOwnScope();
    let matcherName = ('' + this.resolveValue(context, this.name, { wantPrimitiveValue: true }));
    let newContext  = this.buildNewContext(context, hasOwnScope);

    if (hasOwnScope) {
      // Set "self" key
      newContext.scope.set('@', newContext);
    }

    // Set myself on the scope
    // so that others can reference
    // me with a "Fetch"
    if (this.hasCustomName)
      newContext.assignToScope({ [matcherName]: this });

    try {
      if (typeof this.beforeExec === 'function')
        await this.beforeExec(newContext);

      let result = (typeof this.exec === 'function') ? await this.exec(newContext) : undefined;

      if (typeof this.afterExec === 'function')
        result = await this.afterExec(newContext, result);

      if (typeof this._resultMapper === 'function') {
        result = this._resultMapper.call(this, {
          context:  newContext,
          self:     this,
          type:     (result && result.type),
          value:    (result && result.value),
          token:    (result && result.value && result.type === MatcherResult.RESULT_TOKEN && result.value),
          result,
        });

        if (result == null)
          this.throwError(context, `${this.debugColor(context, 'fg:cyan', matcherName)}: Bad return value from result mapper method. Method is required to return a valid result.`);
      }

      return result;
    } catch (error) {
      this.debugLog(context, 'Internal error encountered:\n', error);

      if (!error.parserContext)
        error.parserContext = newContext;

      return this.panicResult(newContext, error);
    }
  }

  debugColor(context, ...args) {
    return context.debugColor(...args);
  }

  debugValue(context, ...args) {
    return context.debugValue(...args);
  }

  debugLog(context, ...args) {
    context.debugLog(...args);
  }

  debugPosition(context, ...args) {
    return context.debugPosition(...args);
  }
}

// Make static members non-enumberable
Object.keys(Matcher).forEach((staticPropertyName) => {
  Object.defineProperties(Matcher, {
    [staticPropertyName]: {
      writable:     false,
      enumerable:   false,
      configurable: true,
      value:        Matcher[staticPropertyName],
    },
  });
});
