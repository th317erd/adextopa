import { Matcher }        from '../matcher.js';
import { MatcherResult }  from '../matcher-result.js';
import { stringToFetch }  from './fetch.js';

export class AssertIfNotMatcher extends Matcher {
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
    let matcherName = ('' + this.resolveValue(context, this.name, { wantPrimitiveValue: true }));
    let matcher     = this.resolveValue(context, this.matcher);

    if (!(matcher instanceof Matcher))
      return this.panicResult(context, `${this.debugColor(context, 'fg:cyan', matcherName)}: "matcher" must be a matcher.`);

    let result = await matcher.run(context);
    if (!result) {
      this.debugLog(context, `${this.debugColor(context, 'fg:cyan', matcherName)}: Provided matcher returned an empty result.`);
      return this.failResult(context);
    }

    if (result.type === MatcherResult.RESULT_TOKEN) {
      this.debugLog(context, `${this.debugColor(context, 'fg:cyan', matcherName)}: success, skipping by zero.`);

      return this.skipResult(context, 0);
    }

    this.debugLog(context, `${this.debugColor(context, 'fg:cyan', matcherName)}: failing!`);

    let errorMessage = ('' + this.resolveValue(context, this.message, { wantPrimitiveValue: true }));
    return this.panicResult(context, errorMessage);
  }
}

export function AssertIfNot(message, matcher) {
  return new AssertIfNotMatcher({ message, matcher: stringToFetch(matcher) });
}
