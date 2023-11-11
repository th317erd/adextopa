import { Matcher }        from '../matcher.js';
import { MatcherResult }  from '../matcher-result.js';

export class NotMatcher extends Matcher {
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
    let matcherName = ('' + this.resolveValue(context, this.name, { wantPrimitiveValue: true }));
    let matcher     = this.resolveValue(context, this.matcher);

    if (!(matcher instanceof Matcher))
      return this.panicResult(context, `${this.debugColor(context, 'fg:cyan', matcherName)}: "matcher" must be a matcher.`);

    let result = await matcher.run(context);
    if (!result) {
      this.debugLog(context, `${this.debugColor(context, 'fg:cyan', matcherName)}: Success (provided matcher returned an empty result).`);
      return this.skipResult(context, 0);
    }

    if (result.type === MatcherResult.RESULT_FAIL) {
      this.debugLog(context, `${this.debugColor(context, 'fg:cyan', matcherName)}: Success (provided pattern failed).`);
      return this.skipResult(context, 0);
    } else if (result.type === MatcherResult.RESULT_SKIP && result.value !== 0) {
      this.debugLog(context, `${this.debugColor(context, 'fg:cyan', matcherName)}: Failed because provided matcher skipped by more than zero characters.`);
      return this.failResult(context);
    } else if (result.type === MatcherResult.RESULT_SEEK) {
      this.debugLog(context, `${this.debugColor(context, 'fg:cyan', matcherName)}: Failed because provided matcher attempted a seek.`);
      return this.failResult(context);
    } else if (result.type === MatcherResult.RESULT_TOKEN) {
      this.debugLog(context, `${this.debugColor(context, 'fg:cyan', matcherName)}: Failed because provided matcher succeeded.`);
      return this.failResult(context);
    }

    this.debugLog(context, `${this.debugColor(context, 'fg:cyan', matcherName)}: Success (provided matcher passing result upstream).`);

    return result;
  }
}

export function Not(/* name?, matcher */) {
  if (arguments.length < 2)
    return new NotMatcher({ matcher: arguments[0] });
  else
    return new NotMatcher({ name: arguments[0], matcher: arguments[1] });
}
