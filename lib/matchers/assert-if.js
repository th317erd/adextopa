import { Matcher }       from '../matcher.js';
import { MatcherResult } from '../matcher-result.js';

export class AssertIfMatcher extends Matcher {
  static name = 'AssertIf';

  constructor(_opts) {
    let opts    = _opts || {};
    let message = opts.message;
    let matcher = opts.matcher;

    if (!message)
      throw new TypeError('AssertIfMatcher: "message" property is required.');

    if (!matcher)
      throw new TypeError('AssertIfMatcher: "matcher" property is required.');

    super({
      ...opts,
      consuming: false,
    });

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
    let matcherName = ('' + this.resolveValue(context, this.name));
    let matcher     = this.resolveValue(context, this.matcher);

    if (!(matcher instanceof Matcher))
      return this.errorResult(context, `${this.debugColor(context, 'fg:cyan', matcherName)}: "matcher" must be a matcher.`);

    let result = await matcher.run(context);
    if (!result) {
      this.debugLog(context, `${this.debugColor(context, 'fg:cyan', matcherName)}: Provided matcher returned an empty result.`);
      return this.failResult(context);
    }

    if (result.type === MatcherResult.RESULT_TOKEN || result.type === MatcherResult.RESULT_PROXY_CHILDREN) {
      this.debugLog(context, `${this.debugColor(context, 'fg:cyan', matcherName)}: Condition succeeded. Failing!`);

      let errorMessage = ('' + this.resolveValue(context, this.message));
      return this.errorResult(context, errorMessage);
    } else if (result.type === MatcherResult.RESULT_FAIL) {
      this.debugLog(context, `${this.debugColor(context, 'fg:cyan', matcherName)}: Condition failed. Skipping by 0.`);
      return this.skipResult(context, 0);
    }

    this.debugLog(context, `${this.debugColor(context, 'fg:cyan', matcherName)}: Proxying result upstream.`);

    return result;
  }
}

export function AssertIf(message, matcher) {
  return new AssertIfMatcher({ message, matcher });
}
