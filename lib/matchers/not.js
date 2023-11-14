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

  constructor(_opts) {
    let opts    = _opts || {};
    let matcher = opts.matcher;

    if (!matcher)
      throw new TypeError('NotMatcher: "matcher" property is required.');

    super(opts);

    Object.defineProperties(this, {
      'matcher': {
        writable:     true,
        enumerable:   false,
        configurable: true,
        value:        matcher,
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
      context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: Success (provided matcher returned an empty result).`);
      return this.skipResult(context, 0);
    }

    if (result.type === MatcherResult.RESULT_FAIL) {
      context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: Success (provided pattern failed).`);
      return this.skipResult(context, 0);
    } else if (result.type === MatcherResult.RESULT_SKIP && result.value !== 0) {
      context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: Failed because provided matcher skipped by more than zero characters.`);
      return this.failResult(context);
    } else if (result.type === MatcherResult.RESULT_SEEK) {
      context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: Failed because provided matcher attempted a seek.`);
      return this.failResult(context);
    } else if (result.type === MatcherResult.RESULT_TOKEN) {
      context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: Failed because provided matcher succeeded.`);
      return this.failResult(context);
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
