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

  set(key, value) {
    this[key] = value;
    return this;
  }

  clone() {
    return new this.constructor(this._options);
  }

  resolveValue(context, value) {
    if (value && typeof value[VIRTUAL_RESOLVER] === 'function')
      return this.resolveValue(context, value[VIRTUAL_RESOLVER](context));

    return value;
  }

  tokenResult(context, tokenProps) {
    return new MatcherResult(
      MatcherResult.RESULT_TOKEN,
      new Token(
        context,
        {
          name: ('' + this.resolveValue(context, this.name)),
          ...(tokenProps || {}),
        },
      ),
    );
  }

  proxyChildrenResult(context, token) {
    return new MatcherResult(
      MatcherResult.RESULT_PROXY_CHILDREN,
      token,
    );
  }

  skipResult(context, skipCount) {
    return new MatcherResult(MatcherResult.RESULT_SKIP, skipCount);
  }

  breakResult(context, name) {
    return new MatcherResult(MatcherResult.RESULT_BREAK, name);
  }

  continueResult(context, name) {
    return new MatcherResult(MatcherResult.RESULT_CONTINUE, name);
  }

  // eslint-disable-next-line no-unused-vars
  stopResult(context) {
    return new MatcherResult(MatcherResult.RESULT_HALT);
  }

  // eslint-disable-next-line no-unused-vars
  failResult(context) {
    return new MatcherResult(MatcherResult.RESULT_FAIL);
  }

  panicResult(context, _error) {
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

    return new MatcherResult(MatcherResult.RESULT_PANIC, error);
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

  async run(context) {
    let hasOwnScope = this.hasOwnScope();
    let matcherName = ('' + this.resolveValue(context, this.name));
    let newContext  = context.clone(hasOwnScope);

    if (hasOwnScope) {
      // Set "self" key
      newContext.scope.set('_', newContext);
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
