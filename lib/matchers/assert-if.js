import * as Utils       from '../utils.js';
import { Matcher }        from '../matcher.js';
import { MatcherResult }  from '../results/matcher-result.js';
import { stringToFetch }  from './fetch.js';

export const AssertIfMatcher = Utils.makeKeysNonEnumerable(class AssertIfMatcher extends Matcher {
  static [Utils.TYPE_SYMBOL] = 'AssertIfMatcher';

  static name = 'AssertIf';

  static isConsuming() {
    return false;
  }

  constructor(_opts) {
    let opts    = _opts || {};
    let message = opts.message;
    let matcher = opts.matcher;

    if (!message)
      throw new TypeError('AssertIfMatcher: "message" property is required.');

    if (!matcher)
      throw new TypeError('AssertIfMatcher: "matcher" property is required.');

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
      context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: Condition succeeded. Failing!`);

      let errorMessage = ('' + context.resolveValue(this.message, { wantPrimitiveValue: true }));
      return this.panicResult(context, errorMessage);
    } else if (result.type === MatcherResult.RESULT_FAIL) {
      context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: Condition failed. Skipping by 0.`);
      return this.skipResult(context, 0);
    }

    context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: Proxying result upstream.`);

    return result;
  }
});

export function AssertIf(message, matcher) {
  return new AssertIfMatcher({ message, matcher: stringToFetch(matcher) });
}
