import * as Utils       from '../utils.js';
import { Matcher }        from '../matcher.js';
import { MatcherResult }  from '../results/matcher-result.js';
import { stringToFetch }  from './fetch.js';

export const NotMatcher = Utils.makeKeysNonEnumerable(class NotMatcher extends Matcher {
  static [Utils.TYPE_SYMBOL] = 'NotMatcher';

  static name = 'Not';

  static isConsuming() {
    return false;
  }

  constructor(_options) {
    let options    = _options || {};
    let matcher = options.matcher;

    if (!matcher)
      throw new TypeError('NotMatcher: "matcher" property is required.');

    super(options);

    Object.defineProperties(this, {
      'matcher': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        matcher,
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
      context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: Success (provided matcher returned an empty result).`);
      return context.skipResult(0);
    }

    if (result.type === MatcherResult.RESULT_FAIL) {
      context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: Success (provided pattern failed).`);
      return context.skipResult(0);
    } else if (result.type === MatcherResult.RESULT_SKIP && result.value !== 0) {
      context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: Failed because provided matcher skipped by more than zero characters.`);
      return context.failResult();
    } else if (result.type === MatcherResult.RESULT_SEEK) {
      context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: Failed because provided matcher attempted a seek.`);
      return context.failResult();
    } else if (result.type === MatcherResult.RESULT_TOKEN) {
      context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: Failed because provided matcher succeeded.`);
      return context.failResult();
    }

    context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: Success (provided matcher passing result upstream).`);

    return result;
  }
});

export function Not(/* name?, matcher */) {
  if (arguments.length < 2)
    return new NotMatcher({ matcher: stringToFetch(arguments[0]) });
  else
    return new NotMatcher({ name: arguments[0], matcher: stringToFetch(arguments[1]) });
}
