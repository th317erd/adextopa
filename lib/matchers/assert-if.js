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

  constructor(_options) {
    let options    = _options || {};
    let message = options.message;
    let matcher = options.matcher;

    if (!message)
      throw new TypeError('AssertIfMatcher: "message" property is required.');

    if (!matcher)
      throw new TypeError('AssertIfMatcher: "matcher" property is required.');

    super(options);

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

  async exec(matcherScope) {
    let matcherName = ('' + context.resolveValue(this.getName()));
    let matcher     = context.resolveValue(this.matcher);

    if (!Utils.isType(matcher, Matcher))
      return context.panicResult(`${context.debugColor('fg:cyan', matcherName)}: "matcher" must be a matcher.`);

    let result = await context.exec(matcher);
    if (!result) {
      context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: Provided matcher returned an empty result.`);
      return context.failResult();
    }

    if (result.type === MatcherResult.RESULT_TOKEN) {
      context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: Condition succeeded. Failing!`);

      let errorMessage = ('' + context.resolveValue(this.message));
      return context.panicResult(errorMessage);
    } else if (result.type === MatcherResult.RESULT_FAIL) {
      context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: Condition failed. Skipping by 0.`);
      return context.skipResult(0);
    }

    context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: Proxying result upstream.`);

    return result;
  }
});

export function AssertIf(message, matcher) {
  return new AssertIfMatcher({ message, matcher: stringToFetch(matcher) });
}
