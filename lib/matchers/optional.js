import { Matcher }        from '../matcher.js';
import { MatcherResult }  from '../matcher-result.js';

export class OptionalMatcher extends Matcher {
  static name = 'Optional';

  constructor(_opts) {
    let opts    = _opts || {};
    let matcher = opts.matcher;

    if (!matcher)
      throw new TypeError('OptionalMatcher: "matcher" property is required.');

    super({
      ...opts,
      consuming: true,
    });

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
    let matcherName = ('' + this.resolveValue(context, this.name));
    let matcher     = this.resolveValue(context, this.matcher);

    if (!(matcher instanceof Matcher))
      return this.errorResult(context, `${this.debugColor(context, 'fg:cyan', matcherName)}: "matcher" must be a matcher.`);

    let result = await matcher.run(context);
    if (!result) {
      this.debugLog(context, `${this.debugColor(context, 'fg:cyan', matcherName)}: Provided matcher returned an empty result.`);
      return this.failResult(context);
    }

    if (result.type === MatcherResult.RESULT_FAIL) {
      this.debugLog(context, `${this.debugColor(context, 'fg:cyan', matcherName)}: Provided pattern failed. Skipping by zero instead.`);
      return this.skipResult(context, 0);
    }

    this.debugLog(context, `${this.debugColor(context, 'fg:cyan', matcherName)}: Success.`);

    return result;
  }
}

export function Optional(matcher) {
  return new OptionalMatcher({ matcher });
}
