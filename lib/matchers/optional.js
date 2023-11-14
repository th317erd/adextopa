import * as Utils       from '../utils.js';
import { Matcher }        from '../matcher.js';
import { MatcherResult }  from '../results/matcher-result.js';
import { stringToFetch }  from './fetch.js';

export const OptionalMatcher = Utils.makeKeysNonEnumerable(class OptionalMatcher extends Matcher {
  static [Utils.TYPE_SYMBOL] = 'OptionalMatcher';

  static name = 'Optional';

  constructor(_opts) {
    let opts    = _opts || {};
    let matcher = opts.matcher;

    if (!matcher)
      throw new TypeError('OptionalMatcher: "matcher" property is required.');

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
    // if (!result) {
    //   context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: Provided matcher returned an empty result.`);
    //   return this.failResult(context);
    // }

    if (!result || result.type === MatcherResult.RESULT_FAIL) {
      context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: Provided pattern failed. Skipping by zero instead.`);
      return this.skipResult(context, 0);
    }

    context.debugLog(`${context.debugColor('fg:cyan', matcherName)}: Success.`);

    return result;
  }
});

export function Optional(matcher) {
  return new OptionalMatcher({ matcher: stringToFetch(matcher) });
}
