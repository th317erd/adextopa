import { MatcherResult }  from './matcher-result.js';
import { SourceRange }    from './source-range.js';
import { Token }          from './token.js';

export class Matcher {
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
      'isConsuming': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        opts.consuming || false,
      },
      'hasOwnScope': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        opts.hasOwnScope || false,
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
    if (value && typeof value.fetchValue === 'function')
      return value.fetchValue(context);

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

  errorResult(context, _error) {
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
    let newContext = context.clone(this.hasOwnScope);
    newContext.scope.set('_', newContext);

    try {
      if (typeof this.beforeExec === 'function')
        await this.beforeExec(newContext);

      let result = (typeof this.exec === 'function') ? await this.exec(newContext) : undefined;

      if (typeof this.afterExec === 'function')
        await this.afterExec(newContext, result);

      return result;
    } catch (error) {
      this.debugLog(context, 'Internal error encountered:\n', error);

      if (!error.parserContext)
        error.parserContext = newContext;

      return this.errorResult(newContext, error);
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
