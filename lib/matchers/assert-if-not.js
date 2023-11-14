import * as Utils       from '../utils.js';
import { Matcher }        from '../matcher.js';
import { MatcherResult }  from '../results/matcher-result.js';
import { stringToFetch }  from './fetch.js';

export const AssertIfNotMatcher = Utils.makeKeysNonEnumerable(class AssertIfNotMatcher extends Matcher {
  static [Utils.TYPE_SYMBOL] = 'EqualsMatcher';

  static name = 'AssertIfNot';

  static isConsuming() {
    return false;
  }

  constructor(_opts) {
    let opts    = _opts || {};
    let message = opts.message;
    let matcher = opts.matcher;

    if (!message)
      throw new TypeError('AssertIfNotMatcher: "message" property is required.');

    if (!matcher)
      throw new TypeError('AssertIfNotMatcher: "matcher" property is required.');

    super(opts);

    Object.defineProperties(this, {
      'matcher': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        matcher,
      },
      'message': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        message,
      },
    });
  }

  async exec(context) {
    let matcherName = ('' + context.resolveValue(this.name, { wantPrimitiveValue: true }));
    let matcher     = context.resolveValue(this.matcher);

    if (!(matcher instanceof Matcher))
      return this.panicResult(context, `${context.debugColor('fg:cyan', matcherName)}: "matcher" must be a matcher.`);

    let result = await context.exec(matcher);
    if (!result) {
      context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: Provided matcher returned an empty result.`);
      return this.failResult(context);
    }

    if (result.type === MatcherResult.RESULT_TOKEN) {
      context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: success, skipping by zero.`);

      return this.skipResult(context, 0);
    }

    context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: failing!`);

    let errorMessage = ('' + context.resolveValue(this.message, { wantPrimitiveValue: true }));
    return this.panicResult(context, errorMessage);
  }
});

export function AssertIfNot(message, matcher) {
  return new AssertIfNotMatcher({ message, matcher: stringToFetch(matcher) });
}
